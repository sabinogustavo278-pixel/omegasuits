import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { formatPrice, products } from "@/data/products";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Omega Admin" },
      { name: "description", content: "Catálogo de produtos da loja." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProdutosPage,
});

const stockBySku: Record<string, { sku: string; estoque: number; status: string }> = {
  "terno-marinho-classico": { sku: "TRN-MAR-001", estoque: 8, status: "Publicado" },
  "sapato-oxford-couro": { sku: "CAL-OXF-014", estoque: 12, status: "Publicado" },
  "gravata-seda-marinho": { sku: "ACS-GRV-088", estoque: 24, status: "Publicado" },
  "camisa-social-branca": { sku: "CAM-ALV-002", estoque: 0, status: "Ruptura" },
  "cinto-couro-marrom": { sku: "ACS-CNT-041", estoque: 3, status: "Crítico" },
  "abotoaduras-prata": { sku: "ACS-ABT-019", estoque: 6, status: "Publicado" },
};

function ProdutosPage() {
  return (
    <AdminShell
      eyebrow="Loja"
      title="Produtos"
      actions={
        <CadastroActions
          entity="Produto"
          templateName="produtos-template.csv"
          templateColumns={["sku", "nome", "categoria", "preco", "estoque_inicial", "descricao"]}
        />
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar por SKU ou nome"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground">
          <option>Todas as categorias</option>
          <option>Ternos</option>
          <option>Camisaria</option>
          <option>Calçados</option>
          <option>Acessórios</option>
        </select>
      </div>

      <DataTable columns={["", "SKU", "Produto", "Categoria", "Preço", "Estoque", "Status", ""]}>
        {products.map((p) => {
          const meta = stockBySku[p.id] ?? { sku: "—", estoque: 0, status: "Rascunho" };
          return (
            <tr key={p.id} className="hover:bg-secondary/40">
              <td className="px-6 py-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-14 w-11 object-cover"
                  loading="lazy"
                />
              </td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{meta.sku}</td>
              <td className="px-6 py-4">
                <p className="font-serif text-base text-foreground">{p.name}</p>
                {p.tagline ? (
                  <p className="text-xs text-muted-foreground">{p.tagline}</p>
                ) : null}
              </td>
              <td className="px-6 py-4 text-muted-foreground">{p.categoryLabel}</td>
              <td className="px-6 py-4 text-foreground">{formatPrice(p.price)}</td>
              <td className="px-6 py-4 text-muted-foreground">{meta.estoque}</td>
              <td className="px-6 py-4"><StatusPill status={meta.status} /></td>
              <td className="px-6 py-4 text-right">
                <button className="text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground">
                  Editar
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </AdminShell>
  );
}
