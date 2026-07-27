import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";

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

const rows = [
  { nome: "Ternos", pai: "—", slug: "/ternos", produtos: 14, status: "Publicado" },
  { nome: "Ternos · Marinho", pai: "Ternos", slug: "/ternos/marinho", produtos: 6, status: "Publicado" },
  { nome: "Ternos · Grafite", pai: "Ternos", slug: "/ternos/grafite", produtos: 5, status: "Publicado" },
  { nome: "Camisaria", pai: "—", slug: "/camisaria", produtos: 22, status: "Publicado" },
  { nome: "Calçados", pai: "—", slug: "/calcados", produtos: 9, status: "Publicado" },
  { nome: "Acessórios", pai: "—", slug: "/acessorios", produtos: 31, status: "Publicado" },
  { nome: "Acessórios · Gravatas", pai: "Acessórios", slug: "/acessorios/gravatas", produtos: 12, status: "Publicado" },
  { nome: "Acessórios · Cintos", pai: "Acessórios", slug: "/acessorios/cintos", produtos: 8, status: "Rascunho" },
];

function CategoriasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "todos" && r.status.toLowerCase() !== status) return false;
        if (search) return r.nome.toLowerCase().includes(search.toLowerCase());
        return true;
      }),
    [search, status],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "nome", dir: "asc" });

  return (
    <AdminShell
      eyebrow="Loja"
      title="Categorias"
      actions={
        <CadastroActions
          entity="Categoria"
          templateName="categorias-template.csv"
          templateColumns={["nome", "categoria_pai", "slug", "descricao", "ordem"]}
          formFields={[
            { name: "nome", label: "Nome" },
            { name: "pai", label: "Categoria pai" },
            { name: "slug", label: "Slug" },
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
          placeholder="Buscar por nome"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
        >
          <option value="todos">Todos os status</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
        </select>
      </div>

      <DataTable
        sort={sort}
        onSort={toggle}
        columns={[
          { label: "Nome", sortKey: "nome" },
          { label: "Categoria pai", sortKey: "pai" },
          { label: "Slug", sortKey: "slug" },
          { label: "Produtos", sortKey: "produtos" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((r) => (
          <tr key={r.slug} className="hover:bg-secondary/40">
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.nome}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.pai}</td>
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.slug}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.produtos}</td>
            <td className="px-6 py-4"><StatusPill status={r.status} /></td>
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
