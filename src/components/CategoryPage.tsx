import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { type ProductCategory } from "@/data/products";
import { useCatalog } from "@/lib/catalog";

interface Props {
  category: ProductCategory;
  title: string;
  description: string;
}

export function CategoryPage({ category, title, description }: Props) {
  const { items } = useCatalog(category);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-10 md:pt-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-accent">Coleção</p>
          <h1 className="mt-4 font-serif text-5xl text-foreground md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </section>
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Novas peças em breve. Aguarde a próxima estação.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
