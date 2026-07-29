import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager, type Rec } from "@/components/admin/CrudManager";
import { StatCard, StatusPill } from "@/components/admin/DataTable";
import { callRpc } from "@/lib/db";
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

const ABERTOS = ["rascunho", "enviado", "aprovado"];

function PedidosPage() {
  const { data: forns } = useQuery({ queryKey: ["list_fornecedores"], queryFn: () => callRpc("list_fornecedores") });

  return (
    <AdminShell eyebrow="Fornecedores" title="Pedidos de compra">
      <CrudManager
        entity="Pedido"
        table="pedidos_compra"
        rpc="list_pedidos_compra"
        searchPlaceholder="Buscar por número ou fornecedor"
        searchKeys={["numero", "fornecedor", "status"]}
        statusKey="status"
        statusOptions={[
          { value: "rascunho", label: "Rascunho" },
          { value: "enviado", label: "Enviado" },
          { value: "aprovado", label: "Aprovado" },
          { value: "recebido", label: "Recebido" },
          { value: "cancelado", label: "Cancelado" },
        ]}
        defaultSort={{ key: "numero", dir: "desc" }}
        templateBase="pedidos-compra-template"
        numericColumns={["valor_total"]}
        templateColumns={[
          "numero",
          "data_pedido",
          "data_entrega_prevista",
          "status",
          "valor_total",
          "condicao_pagamento",
          "observacoes",
        ]}
        stats={(rows: Rec[]) => {
          const abertos = rows.filter((r) => ABERTOS.includes(String(r.status)));
          const total = abertos.reduce((s, r) => s + Number(r.valor_total ?? 0), 0);
          const recebidos = rows.filter((r) => r.status === "recebido");
          return (
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Em aberto" value={String(abertos.length)} hint={formatPrice(total)} />
              <StatCard label="Recebidos" value={String(recebidos.length)} />
              <StatCard
                label="Ticket médio"
                value={rows.length ? formatPrice(rows.reduce((s, r) => s + Number(r.valor_total ?? 0), 0) / rows.length) : "—"}
              />
            </div>
          );
        }}
        columns={[
          { key: "numero", label: "Nº", render: (r) => <span className="text-[11px] uppercase tracking-[0.25em] text-accent">{r.numero ?? "—"}</span> },
          { key: "fornecedor", label: "Fornecedor", render: (r) => <span className="font-serif text-base text-foreground">{r.fornecedor ?? "—"}</span> },
          {
            key: "data_pedido",
            label: "Emissão",
            render: (r) => (r.data_pedido ? new Date(`${r.data_pedido}T00:00:00`).toLocaleDateString("pt-BR") : "—"),
          },
          {
            key: "data_entrega_prevista",
            label: "Previsão",
            render: (r) =>
              r.data_entrega_prevista
                ? new Date(`${r.data_entrega_prevista}T00:00:00`).toLocaleDateString("pt-BR")
                : "—",
          },
          { key: "total_itens", label: "Itens" },
          { key: "valor_total", label: "Total", render: (r) => (r.valor_total == null ? "—" : formatPrice(Number(r.valor_total))) },
          { key: "status", label: "Status", render: (r) => <StatusPill status={String(r.status)} /> },
        ]}
        fields={[
          { name: "numero", label: "Número" },
          {
            name: "fornecedor_id",
            label: "Fornecedor",
            type: "select",
            options: (forns ?? []).map((f) => ({ value: String(f.id), label: String(f.razao_social) })),
          },
          { name: "data_pedido", label: "Data do pedido", type: "date" },
          { name: "data_entrega_prevista", label: "Previsão de entrega", type: "date" },
          { name: "data_entrega_real", label: "Entrega real", type: "date" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "rascunho", label: "Rascunho" },
              { value: "enviado", label: "Enviado" },
              { value: "aprovado", label: "Aprovado" },
              { value: "recebido", label: "Recebido" },
              { value: "cancelado", label: "Cancelado" },
            ],
          },
          { name: "valor_total", label: "Valor total (R$)", type: "number" },
          { name: "condicao_pagamento", label: "Condição de pagamento" },
          { name: "observacoes", label: "Observações", type: "textarea" },
        ]}
      />
    </AdminShell>
  );
}
