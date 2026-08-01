import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("stripe-signature") ?? "";

        const { getStripeKeys, confirmarPagamento, admin } = await import(
          "@/lib/checkout.server"
        );

        let keys;
        try {
          keys = await getStripeKeys();
        } catch (err) {
          console.error("[stripe-webhook] configuração indisponível:", (err as Error).message);
          // 500 faz o Stripe reenviar o evento depois, em vez de descartá-lo.
          return new Response("Stripe não configurado", { status: 500 });
        }
        if (!keys.webhook) {
          console.error("[stripe-webhook] webhook secret ausente");
          return new Response("Webhook secret ausente", { status: 500 });
        }

        // Verificação da assinatura do Stripe (t=...,v1=...)
        const parts = Object.fromEntries(
          signature.split(",").map((p) => {
            const [k, ...rest] = p.split("=");
            return [k?.trim() ?? "", rest.join("=")];
          }),
        ) as Record<string, string>;
        const timestamp = parts["t"];
        const v1 = parts["v1"];
        if (!timestamp || !v1) return new Response("Assinatura inválida", { status: 401 });

        const idade = Math.abs(Date.now() / 1000 - Number(timestamp));
        if (!Number.isFinite(idade) || idade > 300) {
          return new Response("Assinatura expirada", { status: 401 });
        }

        const esperado = createHmac("sha256", keys.webhook)
          .update(`${timestamp}.${raw}`)
          .digest("hex");
        const a = Buffer.from(esperado);
        const b = Buffer.from(v1);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Assinatura inválida", { status: 401 });
        }


        let evento: any;
        try {
          evento = JSON.parse(raw);
        } catch {
          return new Response("Payload inválido", { status: 400 });
        }

        const tipo = String(evento?.type ?? "");
        const obj = evento?.data?.object ?? {};
        console.log("[stripe-webhook] evento recebido:", tipo, evento?.id ?? "");

        try {
          if (tipo === "checkout.session.completed" || tipo === "checkout.session.async_payment_succeeded") {
            if (obj.payment_status === "paid") {
              const pedidoId =
                obj.metadata?.pedido_id ?? obj.client_reference_id ?? null;
              if (pedidoId) {
                const pi =
                  typeof obj.payment_intent === "string"
                    ? obj.payment_intent
                    : (obj.payment_intent?.id ?? null);
                // confirmarPagamento é idempotente: se o pedido já estiver pago, não repete.
                const r = await confirmarPagamento({
                  pedidoId: String(pedidoId),
                  paymentIntentId: pi,
                  valor: Number(obj.amount_total ?? 0) / 100,
                  metodo: "stripe",
                });
                console.log("[stripe-webhook] pedido", pedidoId, "->", r.mensagem);
              } else {
                console.warn("[stripe-webhook] sessão paga sem pedido_id:", obj.id);
              }
            }
          } else if (
            tipo === "checkout.session.expired" ||
            tipo === "checkout.session.async_payment_failed"
          ) {
            const pedidoId = obj.metadata?.pedido_id ?? obj.client_reference_id ?? null;
            if (pedidoId) {
              // Nunca cancela um pedido já pago (eventos podem chegar fora de ordem).
              await admin()
                .from("pedidos_venda")
                .update({ status: "cancelado", status_entrega: "cancelado" })
                .eq("id", String(pedidoId))
                .neq("status", "pago");
            }
          }
        } catch (err) {
          console.error("[stripe-webhook]", (err as Error).message);
          return new Response("Erro ao processar", { status: 500 });
        }


        return new Response("ok");
      },
    },
  },
});
