import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { callRpc, deleteRows, friendlyError, insertOne, insertRows, type Row } from "@/lib/db";
import { formatPrice } from "@/data/products";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";

export const Route = createFileRoute("/fornecedores_/pedido")({
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
const STATUS = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recebido", label: "Recebido" },
  { value: "cancelado", label: "Cancelado" },
];

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";
const btnGhost =
  "inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground";

interface ItemDraft {
  produto_id: string;
  quantidade: string;
  preco_unitario: string;
}

function PedidosPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/fornecedores/pedido", role);
  const qc = useQueryClient();

  const pedidos = useQuery({
    queryKey: ["list_pedidos_compra"],
    queryFn: () => callRpc("list_pedidos_compra"),
  });
  const rows = pedidos.data ?? [];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = rows.filter((r) => {
    if (status !== "todos" && String(r.status) !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return ["numero", "fornecedor", "status"].some((k) =>
      String(r[k] ?? "").toLowerCase().includes(q),
    );
  });
  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "numero", dir: "desc" });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRows("pedidos_compra", [id]),
    onSuccess: () => {
      setFeedback("Pedido excluído.");
      qc.invalidateQueries({ queryKey: ["list_pedidos_compra"] });
      qc.invalidateQueries({ queryKey: ["dashboard_metrics"] });
    },
    onError: (e) => setFeedback(friendlyError(e)),
  });

  const abertos = rows.filter((r) => ABERTOS.includes(String(r.status)));
  const totalAberto = abertos.reduce((s, r) => s + Number(r.valor_total ?? 0), 0);
  const recebidos = rows.filter((r) => r.status === "recebido");

  return (
    <AdminShell eyebrow="Fornecedores" title="Pedidos de compra">
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Em aberto" value={String(abertos.length)} hint={formatPrice(totalAberto)} />
        <StatCard label="Recebidos" value={String(recebidos.length)} />
        <StatCard
          label="Ticket médio"
          value={
            rows.length
              ? formatPrice(rows.reduce((s, r) => s + Number(r.valor_total ?? 0), 0) / rows.length)
              : "—"
          }
        />
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
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {!readOnly ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo pedido
          </button>
        ) : null}
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
          Carregando pedidos…
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
            { label: "Nº", sortKey: "numero" },
            { label: "Fornecedor", sortKey: "fornecedor" },
            { label: "Emissão", sortKey: "data_pedido" },
            { label: "Previsão", sortKey: "data_entrega_prevista" },
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
            visible.map((r) => (
              <tr key={String(r.id)} className="border-t border-border/70">
                <td className="px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-accent">
                  {String(r.numero ?? "—")}
                </td>
                <td className="px-6 py-4 font-serif text-base text-foreground">
                  {String(r.fornecedor ?? "—")}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {r.data_pedido
                    ? new Date(`${r.data_pedido}T00:00:00`).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {r.data_entrega_prevista
                    ? new Date(`${r.data_entrega_prevista}T00:00:00`).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {String(r.total_itens ?? 0)}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {r.valor_total == null ? "—" : formatPrice(Number(r.valor_total))}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={String(r.status)} />
                </td>
                <td className="px-6 py-4 text-right">
                  {!readOnly ? (
                    <button
                      type="button"
                      aria-label="Excluir pedido"
                      onClick={() => {
                        if (window.confirm(`Excluir o pedido ${r.numero ?? ""}?`)) {
                          removeMutation.mutate(String(r.id));
                        }
                      }}
                      className="text-muted-foreground transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      )}

      {open ? (
        <PedidoForm
          onClose={() => setOpen(false)}
          onSaved={(msg) => {
            setOpen(false);
            setFeedback(msg);
            qc.invalidateQueries({ queryKey: ["list_pedidos_compra"] });
            qc.invalidateQueries({ queryKey: ["dashboard_metrics"] });
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function PedidoForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const { data: forns } = useQuery({
    queryKey: ["list_fornecedores"],
    queryFn: () => callRpc("list_fornecedores"),
  });
  const { data: prods } = useQuery({
    queryKey: ["list_produtos"],
    queryFn: () => callRpc("list_produtos"),
  });

  const [fornecedorId, setFornecedorId] = useState("");
  const [numero, setNumero] = useState(`PC-${Date.now().toString().slice(-6)}`);
  const [dataPedido, setDataPedido] = useState(new Date().toISOString().slice(0, 10));
  const [previsao, setPrevisao] = useState("");
  const [statusValue, setStatusValue] = useState("rascunho");
  const [condicao, setCondicao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([
    { produto_id: "", quantidade: "1", preco_unitario: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const produtos = useMemo(() => prods ?? [], [prods]);
  const fornecedoresDoPedido = useMemo(
    () => (fornecedorId ? produtos.filter((p) => String(p.fornecedor_id) === fornecedorId) : produtos),
    [produtos, fornecedorId],
  );

  const subtotalOf = (i: ItemDraft) =>
    Number(i.quantidade || 0) * Number(String(i.preco_unitario || 0).replace(",", "."));
  const total = items.reduce((s, i) => s + subtotalOf(i), 0);

  const setItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const pickProduct = (idx: number, produtoId: string) => {
    const prod = produtos.find((p) => String(p.id) === produtoId);
    setItem(idx, {
      produto_id: produtoId,
      preco_unitario:
        prod?.custo != null
          ? String(prod.custo)
          : prod?.preco != null
            ? String(prod.preco)
            : items[idx]?.preco_unitario ?? "",
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validos = items.filter((i) => i.produto_id && Number(i.quantidade) > 0);
    if (!fornecedorId) return setError("Selecione um fornecedor.");
    if (validos.length === 0) return setError("Adicione ao menos um item ao pedido.");

    setSaving(true);
    try {
      const pedidoId = await insertOne("pedidos_compra", {
        numero: numero || null,
        fornecedor_id: fornecedorId,
        data_pedido: dataPedido || null,
        data_entrega_prevista: previsao || null,
        status: statusValue,
        valor_total: total,
        condicao_pagamento: condicao || null,
        observacoes: observacoes || null,
      });
      const payload: Row[] = validos.map((i) => ({
        pedido_id: pedidoId,
        produto_id: i.produto_id,
        quantidade: Number(i.quantidade),
        preco_unitario: Number(String(i.preco_unitario || 0).replace(",", ".")),
        subtotal: subtotalOf(i),
      }));
      await insertRows("pedidos_compra_itens", payload);
      onSaved(`Pedido ${numero} criado com ${payload.length} item(ns).`);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="my-8 w-full max-w-3xl border border-border bg-background p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Novo pedido</p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">Pedido de compra</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Fornecedor <span className="text-accent">*</span>
            </label>
            <select
              required
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione um fornecedor</option>
              {(forns ?? []).map((f) => (
                <option key={String(f.id)} value={String(f.id)}>
                  {String(f.razao_social)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Número
            </label>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Status
            </label>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              className={inputCls}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Data do pedido
            </label>
            <input
              type="date"
              value={dataPedido}
              onChange={(e) => setDataPedido(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Previsão de entrega
            </label>
            <input
              type="date"
              value={previsao}
              onChange={(e) => setPrevisao(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Condição de pagamento
            </label>
            <input
              value={condicao}
              onChange={(e) => setCondicao(e.target.value)}
              placeholder="30/60/90"
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Observações
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Itens do pedido</p>
            <button
              type="button"
              onClick={() =>
                setItems((prev) => [...prev, { produto_id: "", quantidade: "1", preco_unitario: "" }])
              }
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Adicionar item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="grid items-end gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    Produto
                  </label>
                  <select
                    value={it.produto_id}
                    onChange={(e) => pickProduct(idx, e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Selecione</option>
                    {fornecedoresDoPedido.map((p) => (
                      <option key={String(p.id)} value={String(p.id)}>
                        {[p.sku, p.nome].filter(Boolean).join(" · ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    Qtd.
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={it.quantidade}
                    onChange={(e) => setItem(idx, { quantidade: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    Preço unit. (R$)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={it.preco_unitario}
                    onChange={(e) => setItem(idx, { preco_unitario: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 md:col-span-1">
                  <span className="text-xs text-muted-foreground md:hidden">
                    {formatPrice(subtotalOf(it))}
                  </span>
                  <button
                    type="button"
                    aria-label="Remover item"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="pb-2 text-muted-foreground hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-6 border-t border-border pt-4">
            <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Valor total
            </span>
            <span className="font-serif text-2xl text-foreground">{formatPrice(total)}</span>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
