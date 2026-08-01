import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatCard, StatusPill, Thumb } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { callRpc, type Row } from "@/lib/db";

export const Route = createFileRoute("/pagamentos/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de pagamentos — Omega Admin" },
      { name: "description", content: "Transações e status de pagamento da Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoPagamentosPage,
});

const STATUS = ["aprovado", "pendente", "recusado", "estornado"] as const;

const inputCls =
  "border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

const brl = (v: unknown) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function HistoricoPagamentosPage() {
  const [status, setStatus] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [busca, setBusca] = useState("");

  const query = useQuery({
    queryKey: ["list_pagamentos", status, inicio, fim],
    queryFn: () =>
      callRpc("list_pagamentos", {
        _status: status || null,
        _data_inicio: inicio || null,
        _data_fim: fim || null,
      }),
  });

  const rows = useMemo(() => {
    const list = (query.data ?? []) as Row[];
    const term = busca.trim().toLowerCase();
    if (!term) return list;
    return list.filter((r) =>
      [r.cliente, r.pedido, r.metodo, r.status]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(term)),
    );
  }, [query.data, busca]);

  const { sorted, sort, toggle } = useTableSort(rows, "data_pagamento", "desc");

  const totals = useMemo(() => {
    const sum = (s: string) =>
      rows
        .filter((r) => String(r.status) === s)
        .reduce((acc, r) => acc + Number(r.valor ?? 0), 0);
    return { aprovado: sum("aprovado"), pendente: sum("pendente"), estornado: sum("estornado") };
  }, [rows]);

  return (
    <AdminShell eyebrow="Gestão de Pagamentos" title="Histórico de pagamentos">
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Aprovado" value={brl(totals.aprovado)} hint={`${rows.length} transações`} />
        <StatCard label="Pendente" value={brl(totals.pendente)} />
        <StatCard label="Estornado" value={brl(totals.estornado)} />
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 border border-border bg-background p-6">
        <div>
          <label htmlFor="p-status" className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Status
          </label>
          <select
            id="p-status"
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-ini" className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Data inicial
          </label>
          <input id="p-ini" type="date" className={inputCls} value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-fim" className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Data final
          </label>
          <input id="p-fim" type="date" className={inputCls} value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="p-busca" className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Filtrar
          </label>
          <input
            id="p-busca"
            type="search"
            placeholder="Cliente, pedido, método…"
            className={`${inputCls} w-full`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {status || inicio || fim || busca ? (
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setInicio("");
              setFim("");
              setBusca("");
            }}
            className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Limpar
          </button>
        ) : null}
      </div>

      <DataTable
        columns={[
          { label: "Cliente", sortKey: "cliente" },
          { label: "Data", sortKey: "data_pagamento" },
          { label: "Pedido", sortKey: "pedido" },
          { label: "Valor R$", sortKey: "valor", align: "right" },
          { label: "Status", sortKey: "status" },
        ]}
        sort={sort}
        onSort={toggle}
      >
        {query.isLoading ? (
          <tr>
            <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
              Carregando transações…
            </td>
          </tr>
        ) : sorted.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada para os filtros selecionados.
            </td>
          </tr>
        ) : (
          sorted.map((r) => (
            <tr key={String(r.id)} className="hover:bg-secondary/40">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <Thumb src={r.imagem_url as string | null} alt={String(r.cliente ?? "Cliente")} />
                  <div>
                    <p className="text-foreground">{String(r.cliente ?? "—")}</p>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      {String(r.metodo ?? "Stripe")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                {r.data_pagamento
                  ? new Date(String(r.data_pagamento)).toLocaleString("pt-BR")
                  : "—"}
              </td>
              <td className="px-6 py-4 text-muted-foreground">{String(r.pedido ?? "—")}</td>
              <td className="px-6 py-4 text-right text-foreground">{brl(r.valor)}</td>
              <td className="px-6 py-4">
                <StatusPill status={String(r.status ?? "")} />
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </AdminShell>
  );
}
