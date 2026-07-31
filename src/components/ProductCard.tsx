import { formatPrice, type Product } from "@/data/products";
import { addToCart } from "@/lib/mock-cart";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const single = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(single ? product.sizes[0] : null);
  const [added, setAdded] = useState(false);
  const needsSize = product.sizes.length > 0;

  const onAdd = () => {
    if (needsSize && !size) return;
    addToCart(product, size ?? "Único", 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={1200}
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/50 to-transparent" />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">
          {product.categoryLabel}
        </p>
        <h3 className="font-serif text-xl leading-tight text-foreground">{product.name}</h3>
        {product.tagline ? (
          <p className="text-xs text-muted-foreground">{product.tagline}</p>
        ) : null}
        <p className="mt-2 text-sm tracking-wide text-foreground">
          {formatPrice(product.price)}
        </p>

        {needsSize ? (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {single ? "Tamanho" : "Selecione o tamanho"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className={`min-w-11 border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    size === s
                      ? "border-accent bg-accent text-charcoal"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onAdd}
          disabled={needsSize && !size}
          className="mt-4 inline-flex items-center justify-center border border-foreground/70 px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-foreground/70 disabled:hover:text-foreground"
        >
          {added
            ? "Adicionado ✓"
            : needsSize && !size
              ? "Escolha o tamanho"
              : "Adicionar à sacola"}
        </button>
      </div>
    </article>
  );
}
