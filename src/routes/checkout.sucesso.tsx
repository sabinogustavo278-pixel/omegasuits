import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { clearCart } from "@/lib/mock-cart";
import { confirmarPedido } from "@/lib/checkout.functions";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/sucesso")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado — Omega Suits" },
      { name: "description", content: "Confirmação do seu pedido Omega Suits." },
      { property: "og:title", content: "Pedido confirmado — Omega Suits" },
      { property: "og:description", content: "Seu pagamento foi processado com segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SucessoPage,
});

function SucessoPage() {
  const navigate = useNavigate();
  const confirmar = useServerFn(confirmarPedido);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("carregando");
  const [mensagem, setMensagem] = useState("");
  const [numero, setNumero] = useState("");
  const rodou = useRef(false);

  useEffect(() => {
    if (rodou.current) return;
    rodou.current = true;
    const sessionId = new URLSearchParams(window.location.search).get("session_id") ?? "";
    confirmar({ data: { sessionId } })
      .then((r) => {
        setMensagem(r.mensagem);
        setNumero(r.numero ?? "");
        if (r.ok) {
          clearCart();
          setEstado("ok");
        } else {
          setEstado("erro");
        }
      })
      .catch((err: Error) => {
        setMensagem(err.message);
        setEstado("erro");
      });
  }, [confirmar]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center md:px-10">
          {estado === "carregando" ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" strokeWidth={1.25} />
              <h1 className="mt-6 font-serif text-3xl text-foreground">
                Confirmando seu pagamento…
              </h1>
            </>
          ) : estado === "ok" ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-accent" strokeWidth={1.25} />
              <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-accent">
                Pagamento aprovado
              </p>
              <h1 className="mt-3 font-serif text-4xl text-foreground">
                Obrigado pela sua compra
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Pedido <span className="font-serif text-foreground">{numero}</span> confirmado. Já
                iniciamos a preparação das suas peças.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate({ to: "/meus-pedidos" })}
                  className="border border-accent bg-accent px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
                >
                  Acompanhar pedido
                </button>
                <Link
                  to="/"
                  className="border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Continuar comprando
                </Link>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.25} />
              <h1 className="mt-6 font-serif text-3xl text-foreground">
                Não foi possível confirmar agora
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">{mensagem}</p>
              <Link
                to="/meus-pedidos"
                className="mt-10 inline-block border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Ver meus pedidos
              </Link>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
