import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager, type Rec } from "@/components/admin/CrudManager";
import { StatCard, StatusPill } from "@/components/admin/DataTable";
import { callRpc } from "@/lib/db";

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

function EstoquePage() {
  const { data: produtos } = useQuery({ queryKey: ["list_produtos"], queryFn: () => callRpc("list_produtos") });

  return (
    <AdminShell eyebrow="Loja" title="Estoque">
      <CrudManager
        entity="Saldo"
        table="estoque"
        rpc="list_estoque"
        imageKey="imagem_url"
        searchPlaceholder="Buscar por SKU, produto ou localização"
        searchKeys={["sku", "produto", "localizacao"]}
        statusKey="situacao"
        statusOptions={[
          { value: "ok", label: "OK" },
          { value: "crítico", label: "Crítico" },
          { value: "ruptura", label: "Ruptura" },
        ]}
        defaultSort={{ key: "produto", dir: "asc" }}
        templateBase="estoque-template"
        numericColumns={["quantidade", "quantidade_minima"]}
        templateColumns={["produto_id", "quantidade", "quantidade_minima", "localizacao"]}
        stats={(rows: Rec[]) => (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total em peças"
              value={String(rows.reduce((s, r) => s + Number(r.quantidade ?? 0), 0))}
              hint={`${rows.length} SKUs`}
            />
            <StatCard
              label="SKUs críticos"
              value={String(rows.filter((r) => r.situacao === "Crítico").length)}
              hint="Reposição sugerida"
            />
            <StatCard
              label="Rupturas"
              value={String(rows.filter((r) => r.situacao === "Ruptura").length)}
              hint="Ação imediata"
            />
          </div>
        )}
        columns={[
          { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku ?? "—"}</span> },
          { key: "produto", label: "Produto", render: (r) => <span className="font-serif text-base text-foreground">{r.produto ?? "—"}</span> },
          { key: "localizacao", label: "Localização" },
          { key: "quantidade", label: "Saldo" },
          { key: "quantidade_minima", label: "Mínimo" },
          {
            key: "ultima_movimentacao",
            label: "Última mov.",
            render: (r) =>
              r.ultima_movimentacao
                ? new Date(String(r.ultima_movimentacao)).toLocaleDateString("pt-BR")
                : "—",
          },
          { key: "situacao", label: "Situação", render: (r) => <StatusPill status={String(r.situacao)} /> },
        ]}
        fields={[
          {
            name: "produto_id",
            label: "Produto",
            type: "select",
            options: (produtos ?? []).map((p) => ({
              value: String(p.id),
              label: `${p.sku ? `${p.sku} · ` : ""}${p.nome}`,
            })),
          },
          { name: "quantidade", label: "Quantidade", type: "number" },
          { name: "quantidade_minima", label: "Quantidade mínima", type: "number" },
          { name: "localizacao", label: "Localização" },
        ]}
      />
    </AdminShell>
  );
}
