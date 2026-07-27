import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";

export const Route = createFileRoute("/fornecedores")({
  head: () => ({
    meta: [
      { title: "Fornecedores — Omega Admin" },
      { name: "description", content: "Cadastro de fornecedores Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FornecedoresPage,
});

const rows = [
  { razao: "Vitali Tecidos S/A", cnpj: "12.345.678/0001-90", contato: "Bernardo Vitali", cidade: "São Paulo · SP", cat: "Tecidos", status: "Ativo" },
  { razao: "Como Silks SRL", cnpj: "IT · Como", contato: "Alessandro Ricci", cidade: "Como · IT", cat: "Sedas", status: "Ativo" },
  { razao: "Northampton Leather", cnpj: "UK · NN1", contato: "Oliver Hayes", cidade: "Northampton · UK", cat: "Couros", status: "Ativo" },
  { razao: "Casa dos Botões", cnpj: "45.678.901/0001-22", contato: "Marta Prado", cidade: "São Paulo · SP", cat: "Aviamentos", status: "Pausado" },
  { razao: "Fio Nobre Algodões", cnpj: "98.765.432/0001-10", contato: "Renato Salles", cidade: "Blumenau · SC", cat: "Camisaria", status: "Ativo" },
];

function FornecedoresPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "todos" && r.status.toLowerCase() !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return [r.razao, r.cnpj, r.contato].some((v) => v.toLowerCase().includes(q));
        }
        return true;
      }),
    [search, status],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "razao", dir: "asc" });

  return (
    <AdminShell
      eyebrow="Fornecedores"
      title="Cadastro de fornecedores"
      actions={
        <CadastroActions
          entity="Fornecedor"
          templateName="fornecedores-template.csv"
          templateColumns={["razao_social", "cnpj", "contato", "email", "telefone", "cidade", "uf", "categoria"]}
          formFields={[
            { name: "razao", label: "Razão social" },
            { name: "cnpj", label: "CNPJ" },
            { name: "contato", label: "Contato" },
            { name: "email", label: "E-mail", type: "email" },
            { name: "telefone", label: "Telefone", type: "tel" },
            { name: "cidade", label: "Cidade/UF" },
            { name: "categoria", label: "Categoria" },
          ]}
        />

      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razão social, CNPJ ou contato"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
        </select>
      </div>

      <DataTable
        sort={sort}
        onSort={toggle}
        columns={[
          { label: "Razão Social", sortKey: "razao" },
          { label: "CNPJ", sortKey: "cnpj" },
          { label: "Contato", sortKey: "contato" },
          { label: "Cidade/UF", sortKey: "cidade" },
          { label: "Categoria", sortKey: "cat" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((r) => (
          <tr key={r.razao} className="hover:bg-secondary/40">
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.razao}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.cnpj}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.contato}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.cidade}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.cat}</td>
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
