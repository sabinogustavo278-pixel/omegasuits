import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/CrudManager";
import { StatusPill } from "@/components/admin/DataTable";
import { callRpc } from "@/lib/db";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Omega Admin" },
      { name: "description", content: "Estrutura de categorias da loja." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const { data: cats } = useQuery({ queryKey: ["list_categorias"], queryFn: () => callRpc("list_categorias") });
  const options = (cats ?? []).map((c) => ({ value: String(c.id), label: String(c.nome) }));

  return (
    <AdminShell eyebrow="Loja" title="Categorias">
      <CrudManager
        entity="Categoria"
        table="categorias"
        rpc="list_categorias"
        bucket="categorias"
        imageKey="imagem_url"
        multiImage
        searchPlaceholder="Buscar por nome ou slug"
        searchKeys={["nome", "slug", "categoria_pai"]}
        statusKey="status"
        statusOptions={[
          { value: "publicado", label: "Publicado" },
          { value: "rascunho", label: "Rascunho" },
        ]}
        defaultSort={{ key: "nome", dir: "asc" }}
        templateBase="categorias-template"
        importKey="slug"
        numericColumns={["ordem"]}
        templateColumns={["nome", "slug", "descricao", "ordem", "status"]}
        columns={[
          { key: "nome", label: "Nome", render: (r) => <span className="font-serif text-base text-foreground">{r.nome}</span> },
          { key: "categoria_pai", label: "Categoria pai" },
          { key: "slug", label: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug ?? "—"}</span> },
          { key: "total_produtos", label: "Produtos" },
          { key: "ordem", label: "Ordem" },
          { key: "status", label: "Status", render: (r) => <StatusPill status={String(r.status)} /> },
        ]}
        fields={[
          { name: "nome", label: "Nome", required: true },
          { name: "slug", label: "Slug" },
          { name: "categoria_pai_id", label: "Categoria pai", type: "select", options },
          { name: "ordem", label: "Ordem", type: "number" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "publicado", label: "Publicado" },
              { value: "rascunho", label: "Rascunho" },
            ],
          },
          { name: "descricao", label: "Descrição", type: "textarea" },
        ]}
      />
    </AdminShell>
  );
}
