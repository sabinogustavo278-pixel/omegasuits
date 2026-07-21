import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";

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
  return (
    <AdminShell
      eyebrow="Fornecedores"
      title="Cadastro de fornecedores"
      actions={
        <CadastroActions
          entity="Fornecedor"
          templateName="fornecedores-template.csv"
          templateColumns={["razao_social", "cnpj", "contato", "email", "telefone", "cidade", "uf", "categoria"]}
        />
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar por razão social, CNPJ ou contato"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground">
          <option>Todos os status</option>
          <option>Ativo</option>
          <option>Pausado</option>
        </select>
      </div>

      <DataTable columns={["Razão Social", "CNPJ", "Contato", "Cidade/UF", "Categoria", "Status", ""]}>
        {rows.map((r) => (
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
