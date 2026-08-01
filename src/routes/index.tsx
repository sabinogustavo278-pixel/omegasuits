import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { categoryNames, type ProductCategory } from "@/data/products";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Omega Suits — Alfaiataria masculina clássica" },
      {
        name: "description",
        content:
          "Ternos sob medida, camisaria fina, calçados Goodyear e acessórios em seda pura. Conheça a coleção Omega Suits.",
      },
      { property: "og:title", content: "Omega Suits — Alfaiataria masculina clássica" },
      {
        property: "og:description",
        content: "Ternos sob medida, camisaria fina, calçados Goodyear e acessórios em seda pura. Conheça a coleção Omega Suits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FILTERS: ProductCategory[] = ["ternos", "camisaria", "calcados", "acessorios"];

function Home() {
  const [filter, setFilter] = useState<ProductCategory | "todos">("todos");
  const { all, counts, loading } = useCatalog();
  const items = filter === "todos" ? all : all.filter((p) => p.category === filter);

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

          <div className="mb-12 flex flex-wrap gap-3 border-b border-border/60 pb-6">
            <FilterButton
              active={filter === "todos"}
              onClick={() => setFilter("todos")}
              label="Todos"
              count={all.length}
            />
            {FILTERS.map((c) => (
              <FilterButton
                key={c}
                active={filter === c}
                onClick={() => setFilter(c)}
                label={categoryNames[c]}
                count={counts[c] ?? 0}
              />
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando coleção…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma peça publicada nesta categoria no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
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

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 border px-5 py-3 text-[10px] uppercase tracking-[0.3em] transition-colors ${
        active
          ? "border-accent bg-accent text-charcoal"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span className="text-[9px] opacity-70">{count}</span>
    </button>
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
