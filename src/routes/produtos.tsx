import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatPrice, products, type ProductCategory } from "@/data/products";

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
  "terno-transpassado-marinho": { sku: "TRN-DBM-005", estoque: 4, status: "Publicado" },
  "terno-transpassado-preto": { sku: "TRN-DBP-006", estoque: 3, status: "Publicado" },
  "terno-italiano-colete-preto": { sku: "TRN-ITP-011", estoque: 5, status: "Publicado" },
  "terno-italiano-colete-marinho": { sku: "TRN-ITM-012", estoque: 5, status: "Publicado" },
  "terno-italiano-colete-cinza": { sku: "TRN-ITC-013", estoque: 4, status: "Publicado" },
  "sapato-oxford-couro": { sku: "CAL-OXF-014", estoque: 12, status: "Publicado" },
  "sapato-loafer-preto": { sku: "CAL-LFR-020", estoque: 7, status: "Publicado" },
  "sapato-oxford-marrom-cafe": { sku: "CAL-OXM-021", estoque: 6, status: "Publicado" },
  "gravata-seda-marinho": { sku: "ACS-GRV-088", estoque: 24, status: "Publicado" },
  "gravata-seda-detalhes-amarela": { sku: "ACS-GRV-101", estoque: 15, status: "Publicado" },
  "gravata-seda-detalhes-marrom": { sku: "ACS-GRV-102", estoque: 12, status: "Publicado" },
  "gravata-seda-detalhes-verde": { sku: "ACS-GRV-103", estoque: 10, status: "Publicado" },
  "gravata-seda-detalhes-vermelha": { sku: "ACS-GRV-104", estoque: 14, status: "Publicado" },
  "camisa-social-branca": { sku: "CAM-ALV-002", estoque: 0, status: "Ruptura" },
  "cinto-couro-marrom": { sku: "ACS-CNT-041", estoque: 3, status: "Crítico" },
  "abotoaduras-prata": { sku: "ACS-ABT-019", estoque: 6, status: "Publicado" },
};

function ProdutosPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"todas" | ProductCategory>("todas");

  const enriched = useMemo(
    () =>
      products.map((p) => {
        const meta = stockBySku[p.id] ?? { sku: "—", estoque: 0, status: "Rascunho" };
        return { ...p, sku: meta.sku, estoque: meta.estoque, status: meta.status };
      }),
    [],
  );

  const filtered = useMemo(
    () =>
      enriched.filter((p) => {
        if (cat !== "todas" && p.category !== cat) return false;
        if (search) {
          const q = search.toLowerCase();
          return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        }
        return true;
      }),
    [enriched, search, cat],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "name", dir: "asc" });

  return (
    <AdminShell
      eyebrow="Loja"
      title="Produtos"
      actions={
        <CadastroActions
          entity="Produto"
          templateName="produtos-template.csv"
          templateColumns={["sku", "nome", "categoria", "preco", "estoque_inicial", "descricao", "imagem"]}
          formFields={[
            { name: "sku", label: "SKU" },
            { name: "nome", label: "Nome" },
            { name: "categoria", label: "Categoria" },
            { name: "preco", label: "Preço (R$)" },
            { name: "descricao", label: "Descrição", type: "textarea" },
          ]}
        />

      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por SKU ou nome"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as "todas" | ProductCategory)}
          className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
        >
          <option value="todas">Todas as categorias</option>
          <option value="ternos">Ternos</option>
          <option value="camisaria">Camisaria</option>
          <option value="calcados">Calçados</option>
          <option value="acessorios">Acessórios</option>
        </select>
      </div>

      <DataTable
        sort={sort}
        onSort={toggle}
        columns={[
          "",
          { label: "SKU", sortKey: "sku" },
          { label: "Produto", sortKey: "name" },
          { label: "Categoria", sortKey: "categoryLabel" },
          { label: "Preço", sortKey: "price" },
          { label: "Estoque", sortKey: "estoque" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((p) => (
          <tr key={p.id} className="hover:bg-secondary/40">
            <td className="px-6 py-4">
              <img
                src={p.image}
                alt={p.name}
                className="h-14 w-11 object-cover"
                loading="lazy"
              />
            </td>
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
            <td className="px-6 py-4">
              <p className="font-serif text-base text-foreground">{p.name}</p>
              {p.tagline ? <p className="text-xs text-muted-foreground">{p.tagline}</p> : null}
            </td>
            <td className="px-6 py-4 text-muted-foreground">{p.categoryLabel}</td>
            <td className="px-6 py-4 text-foreground">{formatPrice(p.price)}</td>
            <td className="px-6 py-4 text-muted-foreground">{p.estoque}</td>
            <td className="px-6 py-4"><StatusPill status={p.status} /></td>
            <td className="px-6 py-4 text-right">
              <button className="text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground">
                Editar
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
