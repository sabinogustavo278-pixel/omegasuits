import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/cancelado")({
  head: () => ({
    meta: [
      { title: "Pagamento cancelado — Omega Suits" },
      { name: "description", content: "O pagamento foi cancelado antes da conclusão." },
      { property: "og:title", content: "Pagamento cancelado — Omega Suits" },
      { property: "og:description", content: "Retome sua compra quando quiser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CanceladoPage,
});

function CanceladoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center md:px-10">
          <XCircle className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.25} />
          <h1 className="mt-6 font-serif text-4xl text-foreground">Pagamento cancelado</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Sua sacola foi preservada. Você pode retomar o pagamento quando desejar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/checkout"
              className="border border-accent bg-accent px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
            >
              Voltar à sacola
            </Link>
            <Link
              to="/"
              className="border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Ver a coleção
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
