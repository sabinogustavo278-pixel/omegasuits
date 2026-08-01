import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TesteConexao = {
  ok: boolean;
  mensagem: string;
  conta?: string;
  modoDetectado?: "teste" | "producao";
  divergencia?: boolean;
};

/**
 * Valida a Secret Key gravada em stripe_config contra a API do Stripe.
 * A chave é lida no servidor (RLS restringe a leitura ao Administrador) e
 * nunca é devolvida ao navegador.
 */
export const testarConexaoStripe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TesteConexao> => {
    const client = context.supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          limit: (n: number) => Promise<{
            data: Array<{ secret_key: string | null; modo_teste: boolean | null }> | null;
            error: { message: string } | null;
          }>;
        };
      };
    };

    const { data, error } = await client
      .from("stripe_config")
      .select("secret_key, modo_teste")
      .limit(1);

    if (error) return { ok: false, mensagem: "Não foi possível ler as configurações do Stripe." };

    const config = data?.[0];
    const secret = (config?.secret_key ?? "").trim();
    if (!secret) {
      return { ok: false, mensagem: "Nenhuma Secret Key salva. Informe a chave e salve antes de testar." };
    }

    const modoDetectado: "teste" | "producao" = secret.includes("_test_") ? "teste" : "producao";
    const divergencia = (config?.modo_teste ?? true) !== (modoDetectado === "teste");

    try {
      const res = await fetch("https://api.stripe.com/v1/balance", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const body = (await res.json()) as {
        error?: { message?: string };
        livemode?: boolean;
      };

      if (!res.ok) {
        console.error("Stripe balance error", res.status, body?.error?.message);
        return {
          ok: false,
          mensagem: body?.error?.message ?? `O Stripe recusou a chave (HTTP ${res.status}).`,
          modoDetectado,
          divergencia,
        };
      }

      const live = body.livemode === true;
      return {
        ok: true,
        mensagem: `Conexão estabelecida com o Stripe em modo ${live ? "produção" : "teste"}.`,
        conta: live ? "Conta em produção" : "Conta em modo de teste",
        modoDetectado: live ? "producao" : "teste",
        divergencia: (config?.modo_teste ?? true) !== !live,
      };
    } catch (err) {
      console.error("Stripe connection failure", err);
      return { ok: false, mensagem: "Falha de rede ao contatar o Stripe. Tente novamente." };
    }
  });
