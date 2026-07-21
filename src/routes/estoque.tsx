import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Omega Admin" },
      { name: "description", content: "Controle de estoque Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EstoquePage,
});

const rows = [
  { sku: "TRN-MAR-001", produto: "Terno Marinho Clássico", deposito: "Ateliê SP", saldo: 8, reservado: 2, disp: 6, ult: "05 Set 2025", status: "OK" },
  { sku: "CAL-OXF-014", produto: "Sapato Oxford Havana", deposito: "CD Barueri", saldo: 12, reservado: 3, disp: 9, ult: "02 Set 2025", status: "OK" },
  { sku: "ACS-GRV-088", produto: "Gravata de Seda Marinho", deposito: "Ateliê SP", saldo: 24, reservado: 0, disp: 24, ult: "01 Set 2025", status: "OK" },
  { sku: "CAM-ALV-002", produto: "Camisa Social Alvo", deposito: "CD Barueri", saldo: 0, reservado: 0, disp: 0, ult: "29 Ago 2025", status: "Ruptura" },
  { sku: "ACS-CNT-041", produto: "Cinto Couro Marrom", deposito: "Ateliê SP", saldo: 3, reservado: 1, disp: 2, ult: "27 Ago 2025", status: "Crítico" },
  { sku: "ACS-ABT-019", produto: "Abotoaduras em Prata", deposito: "Cofre", saldo: 6, reservado: 0, disp: 6, ult: "20 Ago 2025", status: "OK" },
];

function EstoquePage() {
  return (
    <AdminShell
      eyebrow="Loja"
      title="Estoque"
      actions={
        <CadastroActions
          entity="Movimentação"
          templateName="estoque-template.csv"
          templateColumns={["sku", "deposito", "tipo", "quantidade", "custo_unitario", "data", "observacao"]}
        />
      }
    >
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Total em peças" value="53" hint="6 SKUs" />
        <StatCard label="SKUs críticos" value="1" hint="Reposição sugerida" />
        <StatCard label="Rupturas" value="1" hint="Ação imediata" />
      </div>

      <DataTable columns={["SKU", "Produto", "Depósito", "Saldo", "Reservado", "Disponível", "Última mov.", "Status"]}>
        {rows.map((r) => (
          <tr key={r.sku} className="hover:bg-secondary/40">
            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.sku}</td>
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.produto}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.deposito}</td>
            <td className="px-6 py-4 text-foreground">{r.saldo}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.reservado}</td>
            <td className="px-6 py-4 text-foreground">{r.disp}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.ult}</td>
            <td className="px-6 py-4"><StatusPill status={r.status} /></td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
