import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { formatPrice } from "@/data/products";

export const Route = createFileRoute("/fornecedores/pedido")({
  head: () => ({
    meta: [
      { title: "Pedidos de compra — Omega Admin" },
      { name: "description", content: "Pedidos a fornecedores Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidosPage,
});

const rows = [
  { n: "PC-2025-0142", forn: "Vitali Tecidos S/A", emissao: "05 Set 2025", previsao: "22 Set 2025", itens: 12, total: 62400, status: "Enviado" },
  { n: "PC-2025-0141", forn: "Como Silks SRL", emissao: "02 Set 2025", previsao: "30 Set 2025", itens: 4, total: 28900, status: "Rascunho" },
  { n: "PC-2025-0140", forn: "Northampton Leather", emissao: "28 Ago 2025", previsao: "10 Set 2025", itens: 8, total: 41800, status: "Recebido" },
  { n: "PC-2025-0139", forn: "Fio Nobre Algodões", emissao: "20 Ago 2025", previsao: "05 Set 2025", itens: 22, total: 15800, status: "Recebido" },
];

function PedidosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "todos" && r.status.toLowerCase() !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return r.n.toLowerCase().includes(q) || r.forn.toLowerCase().includes(q);
        }
        return true;
      }),
    [search, status],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "n", dir: "desc" });

  return (
    <AdminShell
      eyebrow="Fornecedores"
      title="Pedidos de compra"
      actions={
        <CadastroActions
          entity="Pedido"
          templateName="pedidos-compra-template.csv"
          templateColumns={["numero", "fornecedor_cnpj", "data_emissao", "data_previsao", "sku", "quantidade", "custo_unitario"]}
        />
      }
    >
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Em aberto" value="6" hint="R$ 148.900" />
        <StatCard label="Recebidos no mês" value="9" hint="Setembro" />
        <StatCard label="Ticket médio" value="R$ 24.500" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número ou fornecedor"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
        >
          <option value="todos">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="enviado">Enviado</option>
          <option value="recebido">Recebido</option>
        </select>
      </div>

      <DataTable
        sort={sort}
        onSort={toggle}
        columns={[
          { label: "Nº", sortKey: "n" },
          { label: "Fornecedor", sortKey: "forn" },
          { label: "Emissão", sortKey: "emissao" },
          { label: "Previsão", sortKey: "previsao" },
          { label: "Itens", sortKey: "itens" },
          { label: "Total", sortKey: "total" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((r) => (
          <tr key={r.n} className="hover:bg-secondary/40">
            <td className="px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-accent">{r.n}</td>
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.forn}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.emissao}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.previsao}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.itens}</td>
            <td className="px-6 py-4 text-foreground">{formatPrice(r.total)}</td>
            <td className="px-6 py-4"><StatusPill status={r.status} /></td>
            <td className="px-6 py-4 text-right">
              <button className="text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground">
                Abrir
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
