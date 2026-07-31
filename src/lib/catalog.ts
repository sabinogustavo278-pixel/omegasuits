import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/db";
import { type Product, type ProductCategory } from "@/data/products";
import { fallbackImage } from "@/lib/product-images";
import { expandSizes } from "@/lib/sizes";

function toCategory(slug: unknown, nome: unknown): ProductCategory | null {
  const s = `${String(slug ?? "")} ${String(nome ?? "")}`.toLowerCase();
  if (s.includes("terno")) return "ternos";
  if (s.includes("camis")) return "camisaria";
  if (s.includes("calcad") || s.includes("calçad") || s.includes("sapato")) return "calcados";
  if (s.includes("acess")) return "acessorios";
  return null;
}

/** Catálogo público lido via RPC (list_produtos), direto do banco real. */
export function useCatalog(category?: ProductCategory) {
  const query = useQuery({
    queryKey: ["catalogo"],
    queryFn: () => callRpc("list_produtos"),
    retry: false,
  });

  const all: Product[] = (query.data ?? [])
    .filter((r) => String(r.status ?? "").toLowerCase() === "publicado")
    .map((r): Product | null => {
      const cat = toCategory(r.categoria_slug, r.categoria);
      if (!cat) return null;
      const name = String(r.nome ?? "");
      const image = String(r.imagem_url ?? "").trim();
      return {
        id: String(r.id),
        name,
        category: cat,
        categoryLabel: String(r.categoria ?? ""),
        price: Number(r.preco_promocional ?? r.preco ?? 0),
        image: image || fallbackImage(name, r.cor as string | null),
        tagline: (r.descricao as string | null) ?? undefined,
        sizes: expandSizes(r.tamanho as string | null),
      };
    })
    .filter((p): p is Product => p !== null);

  const items = category ? all.filter((p) => p.category === category) : all;

  const counts = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return { items, all, counts, loading: query.isLoading, error: query.error };
}
