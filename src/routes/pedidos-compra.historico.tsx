import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Printer, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { callRpc, friendlyError, updateRow, type Row } from "@/lib/db";
import { formatPrice } from "@/data/products";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";
import {
  buildPedidoCompraHtml,
  PEDIDO_COMPRA_STATUS,
  printPedidoCompra,
} from "@/lib/pedido-compra";

export const Route = createFileRoute("/pedidos-compra/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de pedidos de compra — Omega Admin" },
      {
        name: "description",
        content: "Gestão do histórico de pedidos de compra e recebimento de estoque.",
      },
      { property: "og:title", content: "Histórico de pedidos de compra — Omega Admin" },
      {
        property: "og:description",
        content: "Acompanhe e atualize o status dos pedidos de compra Omega Suits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoPage,
});

const inputCls =
  "border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

function HistoricoPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/pedidos-compra/historico", role);
  const qc = useQueryClient();

  const pedidos = useQuery({
    queryKey: ["list_pedidos_compra"],
    queryFn: () => callRpc("list_pedidos_compra"),
  });
  const empresa = useQuery({
    queryKey: ["get_empresa_config"],
    queryFn: () => callRpc("get_empresa_config"),
  });
  const fornecedores = useQuery({
    queryKey: ["list_fornecedores"],
    queryFn: () => callRpc("list_fornecedores"),
  });

  const rows = pedidos.data ?? [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [fornecedor, setFornecedor] = useState("todos");
  const [aberto, setAberto] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = rows.filter((r) => {
    if (status !== "todos" && String(r.status) !== status) return false;
    if (fornecedor !== "todos" && String(r.fornecedor_id) !== fornecedor) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return ["numero", "fornecedor", "observacoes"].some((k) =>
      String(r[k] ?? "").toLowerCase().includes(q),
    );
  });
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "data_pedido", dir: "desc" });

  const statusMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      updateRow("pedidos_compra", id, { status: value }),
    onSuccess: (_d, vars) => {
      setFeedback(
        vars.value === "recebido"
          ? "Pedido recebido: as quantidades foram somadas ao estoque."
          : "Status do pedido atualizado.",
      );
      qc.invalidateQueries({ queryKey: ["list_pedidos_compra"] });
      qc.invalidateQueries({ queryKey: ["list_estoque"] });
      qc.invalidateQueries({ queryKey: ["dashboard_metrics"] });
    },
    onError: (e) => setFeedback(friendlyError(e)),
  });

  async function imprimir(pedido: Row) {
    const itens = await callRpc("list_pedido_compra_itens", { _pedido_id: String(pedido.id) });
    printPedidoCompra(
      buildPedidoCompraHtml({
        empresa: empresa.data?.[0] ?? null,
        pedido,
        fornecedor:
          (fornecedores.data ?? []).find((f) => String(f.id) === String(pedido.fornecedor_id)) ??
          null,
        itens,
      }),
    );
  }

  const totalPeriodo = filtered.reduce((s, r) => s + Number(r.valor_total ?? 0), 0);

  return (
    <AdminShell eyebrow="Fornecedores" title="Histórico de pedidos de compra">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Pedidos listados" value={String(filtered.length)} hint={formatPrice(totalPeriodo)} />
        <StatCard
          label="Pendentes"
          value={String(rows.filter((r) => r.status === "pendente").length)}
        />
        <StatCard
          label="Recebidos"
          value={String(rows.filter((r) => r.status === "recebido").length)}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número, fornecedor ou observação"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          <option value="todos">Todos os status</option>
          {PEDIDO_COMPRA_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          className={inputCls}
        >
          <option value="todos">Todos os fornecedores</option>
          {(fornecedores.data ?? []).map((f) => (
            <option key={String(f.id)} value={String(f.id)}>
              {String(f.razao_social)}
            </option>
          ))}
        </select>
      </div>

      {feedback ? (
        <div className="mb-4 flex items-center justify-between border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} aria-label="Fechar aviso">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      ) : null}

      {pedidos.isLoading ? (
        <p className="border border-border bg-background px-6 py-10 text-sm text-muted-foreground">
          Carregando histórico…
        </p>
      ) : pedidos.isError ? (
        <p className="border border-red-600/30 bg-red-500/5 px-6 py-10 text-sm text-red-700">
          {friendlyError(pedidos.error)}
        </p>
      ) : (
        <DataTable
          sort={sort}
          onSort={toggle}
          columns={[
            "",
            { label: "Nº", sortKey: "numero" },
            { label: "Fornecedor", sortKey: "fornecedor" },
            { label: "Emissão", sortKey: "data_pedido" },
            { label: "Itens", sortKey: "total_itens" },
            { label: "Total", sortKey: "valor_total" },
            { label: "Status", sortKey: "status" },
            "",
          ]}
        >
          {visible.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhum pedido encontrado.
              </td>
            </tr>
          ) : (
            visible.map((r) => {
              const id = String(r.id);
              const expandido = aberto === id;
              return (
                <>
                  <tr key={id} className="border-t border-border/70">
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        aria-label={expandido ? "Recolher itens" : "Ver itens"}
                        onClick={() => setAberto(expandido ? null : id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandido ? (
                          <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-accent">
                      {String(r.numero ?? "—")}
                    </td>
                    <td className="px-6 py-4 font-serif text-base text-foreground">
                      {String(r.fornecedor ?? "—")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {r.data_pedido
                        ? new Date(`${String(r.data_pedido).slice(0, 10)}T00:00:00`).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {String(r.total_itens ?? 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {r.valor_total == null ? "—" : formatPrice(Number(r.valor_total))}
                    </td>
                    <td className="px-6 py-4">
                      {readOnly ? (
                        <StatusPill status={String(r.status)} />
                      ) : (
                        <select
                          value={String(r.status)}
                          disabled={statusMutation.isPending}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "recebido" &&
                              !window.confirm(
                                `Marcar o pedido ${r.numero ?? ""} como recebido? As quantidades serão somadas ao estoque.`,
                              )
                            ) {
                              return;
                            }
                            statusMutation.mutate({ id, value });
                          }}
                          className={inputCls}
                        >
                          {PEDIDO_COMPRA_STATUS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        aria-label="Imprimir pedido"
                        onClick={() => void imprimir(r)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Printer className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                  {expandido ? (
                    <tr key={`${id}-itens`} className="border-t border-border/40 bg-secondary/30">
                      <td colSpan={8} className="px-6 py-4">
                        <ItensPedido pedidoId={id} />
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })
          )}
        </DataTable>
      )}
    </AdminShell>
  );
}

function ItensPedido({ pedidoId }: { pedidoId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["list_pedido_compra_itens", pedidoId],
    queryFn: () => callRpc("list_pedido_compra_itens", { _pedido_id: pedidoId }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando itens…</p>;
  if (isError) return <p className="text-sm text-red-700">{friendlyError(error)}</p>;
  if (!data || data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum item neste pedido.</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <th className="py-2 text-left">Produto</th>
          <th className="py-2 text-left">SKU</th>
          <th className="py-2 text-right">Qtd.</th>
          <th className="py-2 text-right">Custo unit.</th>
          <th className="py-2 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {data.map((i) => (
          <tr key={String(i.id)} className="border-t border-border/50">
            <td className="py-2 pr-4">
              <span className="inline-flex items-center gap-3">
                {i.imagem_url ? (
                  <img
                    src={String(i.imagem_url)}
                    alt={String(i.produto ?? "Produto")}
                    loading="lazy"
                    className="h-10 w-10 border border-border object-cover"
                  />
                ) : null}
                <span className="text-foreground">{String(i.produto ?? "—")}</span>
              </span>
            </td>
            <td className="py-2 text-muted-foreground">{String(i.sku ?? "—")}</td>
            <td className="py-2 text-right">{String(i.quantidade ?? 0)}</td>
            <td className="py-2 text-right">{formatPrice(Number(i.preco_unitario ?? 0))}</td>
            <td className="py-2 text-right">{formatPrice(Number(i.subtotal ?? 0))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
