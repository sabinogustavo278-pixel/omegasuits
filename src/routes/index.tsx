import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
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
