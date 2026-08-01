import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { callRpc, friendlyError, type Row } from "@/lib/db";
import { formatPrice } from "@/data/products";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";
import { ENTREGA_ETAPAS, entregaLabel } from "@/lib/pedido-status";
import { atualizarStatusEntrega } from "@/lib/checkout.functions";

export const Route = createFileRoute("/pedidos-venda/historico")({
  head: () => ({
    meta: [
      { title: "Pedidos de venda — Omega Admin" },
      {
        name: "description",
        content: "Acompanhe os pedidos de venda e atualize o status de entrega.",
      },
      { property: "og:title", content: "Pedidos de venda — Omega Admin" },
      {
        property: "og:description",
        content: "Gestão de pedidos de venda e entregas da Omega Suits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidosVendaPage,
});

const inputCls =
  "border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

function PedidosVendaPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/pedidos-venda/historico", role);
  const qc = useQueryClient();
  const atualizar = useServerFn(atualizarStatusEntrega);

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");

  const pedidos = useQuery({
    queryKey: ["list_pedidos_venda"],
    queryFn: () => callRpc("list_pedidos_venda"),
  });

  const mut = useMutation({
    mutationFn: (v: { pedidoId: string; status: string }) => atualizar({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list_pedidos_venda"] }),
    onError: (e) => alert(friendlyError(e)),
  });

  const filtrados = useMemo(() => {
    const rows = (pedidos.data ?? []) as Row[];
    return rows.filter((p) => {
      const texto = `${p.numero ?? ""} ${p.cliente ?? ""}`.toLowerCase();
      if (busca && !texto.includes(busca.toLowerCase())) return false;
      if (status && String(p.status) !== status) return false;
      return true;
    });
  }, [pedidos.data, busca, status]);

  const { sorted, sortProps } = useTableSort(filtrados);

  const total = filtrados.reduce((s, p) => s + Number(p.valor_total ?? 0), 0);
  const pagos = filtrados.filter((p) => String(p.status) === "pago").length;

  return (
    <AdminShell eyebrow="Loja" title="Pedidos de venda">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pedidos" value={String(filtrados.length)} />
        <StatCard label="Pagos" value={String(pagos)} />
        <StatCard label="Valor total" value={formatPrice(total)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por número ou cliente"
          className={`${inputCls} min-w-64 flex-1`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          <option value="">Todos os status</option>
          <option value="aguardando_pagamento">Aguardando pagamento</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "numero", label: "Número" },
            { key: "cliente", label: "Cliente" },
            { key: "data_pedido", label: "Data" },
            { key: "status", label: "Pagamento" },
            { key: "valor_total", label: "Valor" },
            { key: "acao", label: "Entrega", sortable: false },
          ]}
          sortProps={sortProps}
          loading={pedidos.isLoading}
          empty="Nenhum pedido de venda encontrado."
        >
          {sorted.map((p) => (
            <tr key={String(p.id)} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-sm text-foreground">{String(p.numero ?? "")}</td>
              <td className="px-4 py-3 text-sm text-foreground">{String(p.cliente ?? "—")}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {p.data_pedido
                  ? new Date(String(p.data_pedido)).toLocaleDateString("pt-BR")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusPill status={String(p.status ?? "")} />
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {formatPrice(Number(p.valor_total ?? 0))}
              </td>
              <td className="px-4 py-3 text-sm">
                {readOnly ? (
                  entregaLabel(String(p.status_entrega ?? ""))
                ) : (
                  <select
                    value={String(p.status_entrega ?? "aguardando_pagamento")}
                    onChange={(e) =>
                      mut.mutate({ pedidoId: String(p.id), status: e.target.value })
                    }
                    className={inputCls}
                  >
                    {ENTREGA_ETAPAS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </AdminShell>
  );
}
