import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/categorias")({
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
  { nome: "· Marinho", pai: "Ternos", slug: "/ternos/marinho", produtos: 6, status: "Publicado" },
  { nome: "· Grafite", pai: "Ternos", slug: "/ternos/grafite", produtos: 5, status: "Publicado" },
  { nome: "Camisaria", pai: "—", slug: "/camisaria", produtos: 22, status: "Publicado" },
  { nome: "Calçados", pai: "—", slug: "/calcados", produtos: 9, status: "Publicado" },
  { nome: "Acessórios", pai: "—", slug: "/acessorios", produtos: 31, status: "Publicado" },
  { nome: "· Gravatas", pai: "Acessórios", slug: "/acessorios/gravatas", produtos: 12, status: "Publicado" },
  { nome: "· Cintos", pai: "Acessórios", slug: "/acessorios/cintos", produtos: 8, status: "Rascunho" },
];

function CategoriasPage() {
  return (
    <AdminShell
      eyebrow="Loja"
      title="Categorias"
      actions={
        <CadastroActions
          entity="Categoria"
          templateName="categorias-template.csv"
          templateColumns={["nome", "categoria_pai", "slug", "descricao", "ordem"]}
        />
      }
    >
      <DataTable columns={["Nome", "Categoria pai", "Slug", "Produtos", "Status", ""]}>
        {rows.map((r) => (
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
