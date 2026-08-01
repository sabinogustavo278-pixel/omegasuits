import {
  admin,
  confirmarPagamento,
  getStripeKeys,
  proximoNumeroVenda,
  stripeRequest,
} from "@/lib/checkout.server";
import type { DadosCliente, ItemCarrinho } from "@/lib/checkout.functions";

const ENTREGA_STATUS = [
  "aguardando_pagamento",
  "pago",
  "em_preparacao",
  "enviado",
  "entregue",
  "cancelado",
];

const onlyDigits = (v: string) => String(v ?? "").replace(/\D+/g, "");

export async function obterCliente(
  userId: string,
  email?: string,
): Promise<Partial<DadosCliente> | null> {
  const db = admin();
  const { data } = await db
    .from("clientes")
    .select("nome, email, cpf, telefone, cep, endereco, cidade, estado")
    .eq("user_id", userId)
    .limit(1);
  if (data?.[0]) return data[0] as Partial<DadosCliente>;
  return email ? { email } : null;
}

export async function salvarCliente(
  userId: string,
  authEmail: string | undefined,
  input: DadosCliente,
): Promise<{ clienteId: string }> {
  const nome = String(input.nome ?? "").trim();
  const email = String(input.email ?? authEmail ?? "").trim();
  if (nome.length < 3) throw new Error("Informe seu nome completo.");
  if (!/.+@.+\..+/.test(email)) throw new Error("E-mail inválido.");
  if (onlyDigits(input.cpf).length !== 11) throw new Error("CPF inválido.");
  if (onlyDigits(input.cep).length !== 8) throw new Error("CEP inválido.");
  if (!String(input.endereco ?? "").trim()) throw new Error("Informe o endereço.");
  if (!String(input.cidade ?? "").trim()) throw new Error("Informe a cidade.");
  if (String(input.estado ?? "").trim().length !== 2) throw new Error("UF com 2 letras.");

  const values = {
    nome,
    email,
    cpf: onlyDigits(input.cpf),
    telefone: onlyDigits(input.telefone),
    cep: onlyDigits(input.cep),
    endereco: String(input.endereco).trim(),
    cidade: String(input.cidade).trim(),
    estado: String(input.estado).trim().toUpperCase(),
    status: "ativo",
  };

  const db = admin();
  const { data: existentes } = await db
    .from("clientes")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existentes?.[0]) {
    const { error } = await db.from("clientes").update(values).eq("id", existentes[0].id);
    if (error) throw new Error(error.message);
    return { clienteId: String(existentes[0].id) };
  }

  // Reaproveita um cliente já cadastrado com o mesmo e-mail, se houver.
  const { data: porEmail } = await db.from("clientes").select("id").eq("email", email).limit(1);
  if (porEmail?.[0]) {
    const { error } = await db
      .from("clientes")
      .update({ ...values, user_id: userId })
      .eq("id", porEmail[0].id);
    if (error) throw new Error(error.message);
    return { clienteId: String(porEmail[0].id) };
  }

  const { data: criado, error } = await db
    .from("clientes")
    .insert({ ...values, user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { clienteId: String(criado.id) };
}

export async function criarSessao(
  userId: string,
  itens: ItemCarrinho[],
  origin: string,
): Promise<{ url: string; pedidoId: string }> {
  if (!Array.isArray(itens) || itens.length === 0) throw new Error("Sacola vazia.");
  if (itens.length > 50) throw new Error("Muitos itens na sacola.");

  const db = admin();
  const { data: clientes } = await db
    .from("clientes")
    .select("id, nome, email, endereco, cidade, estado, cep")
    .eq("user_id", userId)
    .limit(1);
  const cliente = clientes?.[0];
  if (!cliente) throw new Error("Complete seus dados de entrega antes de pagar.");

  const ids = [...new Set(itens.map((i) => String(i.produtoId)))];
  const { data: produtos, error: prodErr } = await db
    .from("produtos")
    .select("id, nome, sku, preco, preco_promocional")
    .in("id", ids);
  if (prodErr) throw new Error(prodErr.message);

  const mapa = new Map<string, { nome: string; preco: number }>();
  for (const p of produtos ?? []) {
    const preco = Number(p.preco_promocional ?? 0) > 0 ? Number(p.preco_promocional) : Number(p.preco ?? 0);
    mapa.set(String(p.id), { nome: String(p.nome), preco });
  }

  const linhas = itens.map((i) => {
    const prod = mapa.get(String(i.produtoId));
    if (!prod || !(prod.preco > 0)) throw new Error("Produto indisponível na sacola.");
    const qty = Math.max(1, Math.min(20, Math.trunc(Number(i.qty) || 1)));
    const size = String(i.size ?? "").slice(0, 20);
    return { produtoId: String(i.produtoId), nome: prod.nome, preco: prod.preco, qty, size };
  });

  const subtotal = linhas.reduce((s, l) => s + l.preco * l.qty, 0);
  const numero = await proximoNumeroVenda();

  const { data: pedido, error: pedErr } = await db
    .from("pedidos_venda")
    .insert({
      numero,
      cliente_id: cliente.id,
      status: "aguardando_pagamento",
      status_entrega: "aguardando_pagamento",
      subtotal,
      frete: 0,
      desconto: 0,
      valor_total: subtotal,
      metodo_pagamento: "stripe",
      endereco_entrega: cliente.endereco,
      cidade_entrega: cliente.cidade,
      estado_entrega: cliente.estado,
      cep_entrega: cliente.cep,
      observacoes: linhas.map((l) => `${l.nome} — tamanho ${l.size || "único"} × ${l.qty}`).join("; "),
    })
    .select("id")
    .single();
  if (pedErr) throw new Error(pedErr.message);

  const pedidoId = String(pedido.id);

  const { error: itemErr } = await db.from("pedidos_venda_itens").insert(
    linhas.map((l) => ({
      pedido_id: pedidoId,
      produto_id: l.produtoId,
      quantidade: l.qty,
      preco_unitario: l.preco,
      subtotal: l.preco * l.qty,
    })),
  );
  if (itemErr) throw new Error(itemErr.message);

  const { secret } = await getStripeKeys();
  const base = /^https?:\/\//.test(origin) ? origin.replace(/\/$/, "") : "";

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("client_reference_id", pedidoId);
  body.set("metadata[pedido_id]", pedidoId);
  body.set("metadata[numero]", numero);
  body.set("customer_email", String(cliente.email ?? ""));
  body.set("success_url", `${base}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${base}/checkout/cancelado`);
  linhas.forEach((l, idx) => {
    body.set(`line_items[${idx}][quantity]`, String(l.qty));
    body.set(`line_items[${idx}][price_data][currency]`, "brl");
    body.set(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(l.preco * 100)));
    body.set(
      `line_items[${idx}][price_data][product_data][name]`,
      `${l.nome}${l.size ? ` · ${l.size}` : ""}`,
    );
  });

  const session = await stripeRequest("checkout/sessions", secret, body);

  await db
    .from("pedidos_venda")
    .update({ stripe_session_id: String(session.id) })
    .eq("id", pedidoId);

  return { url: String(session.url), pedidoId };
}

export async function confirmarSessao(sessionId: string): Promise<{
  ok: boolean;
  mensagem: string;
  numero?: string;
  pedidoId?: string;
}> {
  const id = String(sessionId ?? "").trim();
  if (!id.startsWith("cs_")) return { ok: false, mensagem: "Sessão inválida." };

  const { secret } = await getStripeKeys();
  const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(id)}`, secret);

  const db = admin();
  const { data: pedidos } = await db
    .from("pedidos_venda")
    .select("id, numero, status, valor_total")
    .eq("stripe_session_id", id)
    .limit(1);
  const pedido = pedidos?.[0];
  if (!pedido) return { ok: false, mensagem: "Pedido não encontrado para esta sessão." };

  if (session.payment_status !== "paid") {
    return {
      ok: false,
      mensagem: "O pagamento ainda não foi confirmado pelo Stripe.",
      numero: String(pedido.numero ?? ""),
      pedidoId: String(pedido.id),
    };
  }

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await confirmarPagamento({
    pedidoId: String(pedido.id),
    paymentIntentId: pi,
    valor: Number(session.amount_total ?? 0) / 100 || Number(pedido.valor_total ?? 0),
    metodo: "stripe",
  });

  return {
    ok: true,
    mensagem: "Pagamento confirmado.",
    numero: String(pedido.numero ?? ""),
    pedidoId: String(pedido.id),
  };
}

export async function atualizarEntrega(
  supabase: unknown,
  pedidoId: string,
  status: string,
): Promise<{ ok: boolean }> {
  if (!ENTREGA_STATUS.includes(status)) throw new Error("Status de entrega inválido.");
  const client = supabase as {
    from: (t: string) => {
      update: (v: Record<string, unknown>) => {
        eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  const { error } = await client
    .from("pedidos_venda")
    .update({ status_entrega: status })
    .eq("id", pedidoId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
