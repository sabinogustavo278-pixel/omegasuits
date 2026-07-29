import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/CrudManager";
import { StatusPill } from "@/components/admin/DataTable";
import { callRpc } from "@/lib/db";
import { formatPrice } from "@/data/products";

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

function ProdutosPage() {
  const { data: cats } = useQuery({ queryKey: ["list_categorias"], queryFn: () => callRpc("list_categorias") });
  const { data: forns } = useQuery({ queryKey: ["list_fornecedores"], queryFn: () => callRpc("list_fornecedores") });

  return (
    <AdminShell eyebrow="Loja" title="Produtos">
      <CrudManager
        entity="Produto"
        table="produtos"
        rpc="list_produtos"
        bucket="produtos"
        imageKey="imagem_url"
        multiImage
        searchPlaceholder="Buscar por SKU, nome ou categoria"
        searchKeys={["sku", "nome", "categoria", "fornecedor"]}
        statusKey="status"
        statusOptions={[
          { value: "publicado", label: "Publicado" },
          { value: "rascunho", label: "Rascunho" },
          { value: "inativo", label: "Inativo" },
        ]}
        defaultSort={{ key: "nome", dir: "asc" }}
        templateBase="produtos-template"
        numericColumns={["preco", "preco_promocional", "custo", "peso"]}
        templateColumns={[
          "sku",
          "nome",
          "descricao",
          "preco",
          "preco_promocional",
          "custo",
          "peso",
          "tamanho",
          "cor",
          "material",
          "status",
        ]}
        columns={[
          { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku ?? "—"}</span> },
          {
            key: "nome",
            label: "Produto",
            render: (r) => (
              <div>
                <p className="font-serif text-base text-foreground">{r.nome}</p>
                {r.cor || r.tamanho ? (
                  <p className="text-xs">{[r.cor, r.tamanho].filter(Boolean).join(" · ")}</p>
                ) : null}
              </div>
            ),
          },
          { key: "categoria", label: "Categoria" },
          { key: "fornecedor", label: "Fornecedor" },
          { key: "preco", label: "Preço", render: (r) => (r.preco == null ? "—" : formatPrice(Number(r.preco))) },
          { key: "estoque", label: "Estoque" },
          { key: "status", label: "Status", render: (r) => <StatusPill status={String(r.status)} /> },
        ]}
        fields={[
          { name: "sku", label: "SKU" },
          { name: "nome", label: "Nome" },
          {
            name: "categoria_id",
            label: "Categoria",
            type: "select",
            options: (cats ?? []).map((c) => ({ value: String(c.id), label: String(c.nome) })),
          },
          {
            name: "fornecedor_id",
            label: "Fornecedor",
            type: "select",
            options: (forns ?? []).map((f) => ({ value: String(f.id), label: String(f.razao_social) })),
          },
          { name: "preco", label: "Preço (R$)", type: "number" },
          { name: "preco_promocional", label: "Preço promocional (R$)", type: "number" },
          { name: "custo", label: "Custo (R$)", type: "number" },
          { name: "peso", label: "Peso (kg)", type: "number" },
          { name: "tamanho", label: "Tamanho" },
          { name: "cor", label: "Cor" },
          { name: "material", label: "Material" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "publicado", label: "Publicado" },
              { value: "rascunho", label: "Rascunho" },
              { value: "inativo", label: "Inativo" },
            ],
          },
          { name: "descricao", label: "Descrição", type: "textarea" },
        ]}
      />
    </AdminShell>
  );
}
