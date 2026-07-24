import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Omega Admin" },
      { name: "description", content: "Cadastro de clientes Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

const rows = [
  { nome: "Henrique Barros", email: "henrique@barros.adv.br", tel: "(11) 99812-4410", cidade: "São Paulo · SP", ultima: "12/07/2026", total: "R$ 42.900", status: "Ativo" },
  { nome: "Rafael Toledo",  email: "rafael.toledo@me.com",     tel: "(21) 99231-0087", cidade: "Rio de Janeiro · RJ", ultima: "03/07/2026", total: "R$ 18.200", status: "Ativo" },
  { nome: "Otávio Camargo", email: "otavio@camargo.co",        tel: "(31) 99772-1140", cidade: "Belo Horizonte · MG", ultima: "28/06/2026", total: "R$ 26.500", status: "Ativo" },
  { nome: "Lucas Verona",   email: "lucas@verona.eng.br",      tel: "(48) 98811-2233", cidade: "Florianópolis · SC", ultima: "10/06/2026", total: "R$  8.400", status: "Ativo" },
  { nome: "André Salgado",  email: "asalgado@salgadoco.com",   tel: "(11) 99900-8877", cidade: "São Paulo · SP", ultima: "22/05/2026", total: "R$ 61.300", status: "Ativo" },
  { nome: "Miguel Fontes",  email: "miguel.fontes@fontes.law", tel: "(51) 99441-2288", cidade: "Porto Alegre · RS", ultima: "04/04/2026", total: "R$  5.100", status: "Pausado" },
];

function ClientesPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/clientes", role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "todos" && r.status.toLowerCase() !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return [r.nome, r.email, r.tel].some((v) => v.toLowerCase().includes(q));
        }
        return true;
      }),
    [search, status],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "nome", dir: "asc" });

  return (
    <AdminShell
      eyebrow="Loja"
      title="Cadastro de clientes"
      actions={
        readOnly ? (
          <div className="flex items-center justify-end">
            <span className="border border-accent/40 bg-accent/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-accent">
              Somente leitura
            </span>
          </div>
        ) : (
          <CadastroActions
            entity="Cliente"
            templateName="clientes-template.csv"
            templateColumns={["nome", "email", "telefone", "cpf", "cidade", "uf", "endereco", "observacoes"]}
          />
        )
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone"
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
          { label: "Cliente", sortKey: "nome" },
          { label: "Contato", sortKey: "email" },
          { label: "Cidade/UF", sortKey: "cidade" },
          { label: "Última compra", sortKey: "ultima" },
          { label: "Total investido", sortKey: "total" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((r) => (
          <tr key={r.email} className="hover:bg-secondary/40">
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.nome}</td>
            <td className="px-6 py-4 text-muted-foreground">
              <div>{r.email}</div>
              <div className="text-xs">{r.tel}</div>
            </td>
            <td className="px-6 py-4 text-muted-foreground">{r.cidade}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.ultima}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.total}</td>
            <td className="px-6 py-4"><StatusPill status={r.status} /></td>
            <td className="px-6 py-4 text-right">
              <button className="text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground">
                {readOnly ? "Ver" : "Editar"}
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
