import { formatPrice, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
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
      </div>
    </article>
  );
}
