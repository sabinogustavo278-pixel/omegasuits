import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { items } = useCatalog();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-accent">Coleção</p>
              <h2 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
                Nossas Coleções
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Uma seleção do ateliê: ternos sob medida, camisaria fina, calçados Goodyear e
                acessórios em seda pura.
              </p>
            </div>
            <Link
              to="/ternos"
              className="inline-flex items-center justify-center border border-accent bg-accent px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
            >
              Visitar a loja
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-secondary/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3 md:px-10">
            <Pillar
              kicker="Sob medida"
              title="Duas provas, uma vida"
              body="Cada peça nasce de duas provas presenciais em nosso ateliê, com cortes ajustados ao seu porte."
            />
            <Pillar
              kicker="Tecidos"
              title="Lã italiana Super 130's"
              body="Trabalhamos exclusivamente com casas de tecelagem centenárias em Biella e Como."
            />
            <Pillar
              kicker="Feito à mão"
              title="Costura interna à agulha"
              body="Entretela flutuante, casas de botão e ombreiras montadas ponto a ponto — como manda a tradição."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Pillar({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">{kicker}</p>
      <h3 className="mt-3 font-serif text-2xl text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
