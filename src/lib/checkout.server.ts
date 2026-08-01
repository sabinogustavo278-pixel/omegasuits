import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AnyClient = {
  from: (t: string) => any;
};

export type StripeKeys = { secret: string; webhook: string; modoTeste: boolean };

/** Lê as chaves do Stripe gravadas em stripe_config (nunca vão ao navegador). */
export async function getStripeKeys(): Promise<StripeKeys> {
  const { data, error } = await (supabaseAdmin as unknown as AnyClient)
    .from("stripe_config")
    .select("secret_key, webhook_secret, modo_teste")
    .order("created_at")
    .limit(1);
  if (error) throw new Error("Não foi possível ler as configurações do Stripe.");
  const row = data?.[0];
  const secret = String(row?.secret_key ?? "").trim();
  if (!secret) {
    throw new Error(
      "Nenhuma Secret Key do Stripe configurada. Preencha em Gestão de Pagamentos › Configurações Stripe.",
    );
  }
  return {
    secret,
    webhook: String(row?.webhook_secret ?? "").trim(),
    modoTeste: Boolean(row?.modo_teste ?? true),
  };
}

/** Chamada genérica à API do Stripe (form-urlencoded). */
export async function stripeRequest(
  path: string,
  secret: string,
  body?: URLSearchParams,
): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Falha na comunicação com o Stripe.");
  }
  return json;
}

export function admin() {
  return supabaseAdmin as unknown as AnyClient;
}

/** Gera o próximo número de pedido de venda. */
export async function proximoNumeroVenda(): Promise<string> {
  const { data } = await admin()
    .from("pedidos_venda")
    .select("id", { count: "exact", head: true });
  void data;
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `OM-${new Date().getFullYear()}-${random}`;
}

/** Marca o pedido como pago (o trigger dá baixa no estoque) e registra o pagamento. */
export async function confirmarPagamento(opts: {
  pedidoId: string;
  paymentIntentId?: string | null;
  valor: number;
  metodo?: string;
}) {
  const db = admin();

  const { data: pedidoRows } = await db
    .from("pedidos_venda")
    .select("id, cliente_id, status, estoque_baixado")
    .eq("id", opts.pedidoId)
    .limit(1);
  const pedido = pedidoRows?.[0];
  if (!pedido) return { ok: false, mensagem: "Pedido não encontrado." };
  if (pedido.status === "pago") return { ok: true, mensagem: "Pedido já estava pago." };

  const { error: upErr } = await db
    .from("pedidos_venda")
    .update({
      status: "pago",
      stripe_payment_intent_id: opts.paymentIntentId ?? null,
      metodo_pagamento: opts.metodo ?? "stripe",
    })
    .eq("id", opts.pedidoId);
  if (upErr) throw new Error(upErr.message);

  const { data: existentes } = await db
    .from("pagamentos")
    .select("id")
    .eq("pedido_id", opts.pedidoId)
    .limit(1);

  if (!existentes || existentes.length === 0) {
    await db.from("pagamentos").insert({
      pedido_id: opts.pedidoId,
      cliente_id: pedido.cliente_id,
      valor: opts.valor,
      moeda: "BRL",
      status: "aprovado",
      metodo: opts.metodo ?? "stripe",
      stripe_payment_intent_id: opts.paymentIntentId ?? null,
    });
  }

  return { ok: true, mensagem: "Pagamento confirmado." };
}
