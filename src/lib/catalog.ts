import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/db";
import { products as fallback, type Product, type ProductCategory } from "@/data/products";

function slugToCategory(slug: unknown): ProductCategory | null {
  const s = String(slug ?? "").toLowerCase();
  if (s.includes("terno")) return "ternos";
  if (s.includes("camis")) return "camisaria";
  if (s.includes("calcad") || s.includes("calçad") || s.includes("sapato")) return "calcados";
  if (s.includes("acess")) return "acessorios";
  return null;
}

/** Catálogo público lido via RPC (list_produtos); usa mocks enquanto o banco estiver vazio. */
export function useCatalog(category?: ProductCategory) {
  const query = useQuery({
    queryKey: ["catalogo"],
    queryFn: () => callRpc("list_produtos"),
    retry: false,
  });

  const mapped: Product[] = (query.data ?? [])
    .map((r) => {
      const cat = slugToCategory(r.categoria_slug) ?? slugToCategory(r.categoria);
      if (!cat) return null;
      return {
        id: String(r.id),
        name: String(r.nome),
        category: cat,
        categoryLabel: String(r.categoria ?? ""),
        price: Number(r.preco_promocional ?? r.preco ?? 0),
        image: String(r.imagem_url ?? ""),
        tagline: (r.descricao as string | null) ?? undefined,
      } satisfies Product;
    })
    .filter((p): p is Product => p !== null && Boolean(p.image));

  const source = mapped.length > 0 ? mapped : fallback;
  const items = category ? source.filter((p) => p.category === category) : source;

  return { items, loading: query.isLoading };
}
