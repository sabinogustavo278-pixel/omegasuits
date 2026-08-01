import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DadosCliente = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
};

export type ItemCarrinho = { produtoId: string; size: string; qty: number };

/** Cria ou atualiza o cadastro de cliente do usuário logado. */
export const salvarDadosCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DadosCliente) => data)
  .handler(async ({ data, context }): Promise<{ clienteId: string }> => {
    const { salvarCliente } = await import("@/lib/checkout-actions.server");
    return salvarCliente(context.userId, context.claims.email as string | undefined, data);
  });

/** Devolve o cadastro de cliente do usuário logado (se existir). */
export const obterMeusDados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Partial<DadosCliente> | null> => {
    const { obterCliente } = await import("@/lib/checkout-actions.server");
    return obterCliente(context.userId, context.claims.email as string | undefined);
  });

/** Cria o pedido e a sessão de checkout no Stripe. Devolve a URL de pagamento. */
export const criarSessaoCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { itens: ItemCarrinho[]; origin: string }) => data)
  .handler(async ({ data, context }): Promise<{ url: string; pedidoId: string }> => {
    const { criarSessao } = await import("@/lib/checkout-actions.server");
    return criarSessao(context.userId, data.itens, data.origin);
  });

/** Confirma o pagamento na volta do Stripe (fallback caso o webhook atrase). */
export const confirmarPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ ok: boolean; mensagem: string; numero?: string; pedidoId?: string }> => {
      const { confirmarSessao } = await import("@/lib/checkout-actions.server");
      return confirmarSessao(data.sessionId);
    },
  );

/** Atualiza o status de entrega de um pedido (admin/gerente). */
export const atualizarStatusEntrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pedidoId: string; status: string }) => data)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { atualizarEntrega } = await import("@/lib/checkout-actions.server");
    return atualizarEntrega(context.supabase, data.pedidoId, data.status);
  });
