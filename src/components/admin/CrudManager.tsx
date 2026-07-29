import { useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Plus, X, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { DataTable, Thumb } from "./DataTable";
import { useTableSort, type SortState } from "@/hooks/use-table-sort";
import { callRpc, deleteRows, friendlyError, insertRows, updateRow, type TableName } from "@/lib/db";
import { exportCsv, exportXlsx, parseSheet } from "@/lib/sheet";
import { uploadImages, type BucketName } from "@/lib/storage";

export type Rec = Record<string, any>;

export interface CrudField {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "tel" | "date" | "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
}

export interface CrudColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right";
  render?: (row: Rec) => ReactNode;
}

export interface CrudManagerProps {
  entity: string;
  table: TableName;
  rpc: Parameters<typeof callRpc>[0];
  bucket?: BucketName;
  imageKey?: string;
  /** Grava imagens extras em produtos_imagens. */
  multiImage?: boolean;
  columns: CrudColumn[];
  fields: CrudField[];
  searchKeys: string[];
  searchPlaceholder?: string;
  statusKey?: string;
  statusOptions?: Array<{ value: string; label: string }>;
  templateColumns: string[];
  templateBase: string;
  numericColumns?: string[];
  defaultSort?: SortState;
  readOnly?: boolean;
  stats?: (rows: Rec[]) => ReactNode;
  /** Ajusta o payload antes de gravar (ex.: campos derivados). */
  beforeSave?: (values: Rec) => Rec;
}

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";
const btnGhost =
  "inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground";

export function CrudManager(props: CrudManagerProps) {
  const {
    entity,
    table,
    rpc,
    bucket,
    imageKey,
    multiImage,
    columns,
    fields,
    searchKeys,
    searchPlaceholder = "Buscar",
    statusKey,
    statusOptions,
    templateColumns,
    templateBase,
    numericColumns = [],
    defaultSort,
    readOnly,
    stats,
    beforeSave,
  } = props;

  const qc = useQueryClient();
  const query = useQuery({ queryKey: [rpc], queryFn: () => callRpc(rpc) });
  const rows = (query.data ?? []) as Rec[];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Rec | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusKey && status !== "todos") {
          if (String(r[statusKey] ?? "").toLowerCase() !== status) return false;
        }
        if (search) {
          const q = search.toLowerCase();
          return searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
        }
        return true;
      }),
    [rows, search, status, statusKey, searchKeys],
  );
  const { rows: visible, sort, toggle } = useTableSort(filtered, defaultSort);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [rpc] });
    qc.invalidateQueries({ queryKey: ["dashboard_metrics"] });
    qc.invalidateQueries({ queryKey: ["list_produtos"] });
  };

  const removeMutation = useMutation({
    mutationFn: (ids: string[]) => deleteRows(table, ids),
    onSuccess: (_d, ids) => {
      setSelected((prev) => prev.filter((i) => !ids.includes(i)));
      setFeedback(`${ids.length} registro(s) excluído(s).`);
      invalidate();
    },
    onError: (e) => setFeedback(friendlyError(e)),
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const parsed = await parseSheet(file);
      const payload = parsed
        .map((r) => {
          const obj: Rec = {};
          for (const c of templateColumns) {
            const v = r[c];
            if (v === undefined || v === "") continue;
            obj[c] = numericColumns.includes(c) ? Number(String(v).replace(",", ".")) : v;
          }
          return obj;
        })
        .filter((o) => Object.keys(o).length > 0);
      if (payload.length === 0) throw new Error("Nenhuma linha válida encontrada no arquivo.");
      await insertRows(table, payload);
      return payload.length;
    },
    onSuccess: (n) => {
      setFeedback(`${n} registro(s) importado(s).`);
      invalidate();
    },
    onError: (e) => setFeedback(friendlyError(e)),
  });

  const allVisibleIds = visible.map((r) => String(r.id));
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.includes(id));

  const handleTemplate = (format: "csv" | "xlsx") => {
    const data = rows.map((r) =>
      Object.fromEntries(templateColumns.map((c) => [c, r[c] ?? ""])),
    );
    if (format === "csv") exportCsv(`${templateBase}.csv`, templateColumns, data);
    else exportXlsx(`${templateBase}.xlsx`, templateColumns, data);
  };

  return (
    <>
      {stats ? <div className="mb-8">{stats(rows)}</div> : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        {statusKey && statusOptions ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
          >
            <option value="todos">Todos os status</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => handleTemplate("csv")} className={btnGhost}>
            <Download className="h-4 w-4" strokeWidth={1.25} />
            Template CSV
          </button>
          <button type="button" onClick={() => handleTemplate("xlsx")} className={btnGhost}>
            <Download className="h-4 w-4" strokeWidth={1.25} />
            Template XLSX
          </button>
          {!readOnly ? (
            <>
              <input
                ref={importRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importMutation.mutate(f);
                  e.target.value = "";
                }}
              />
              <button type="button" onClick={() => importRef.current?.click()} className={btnGhost}>
                <Upload className="h-4 w-4" strokeWidth={1.25} />
                {importMutation.isPending ? "Importando…" : "Importar"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Novo {entity}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <div className="mb-4 flex items-center justify-between border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} aria-label="Fechar aviso">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      ) : null}

      {selected.length > 0 && !readOnly ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-secondary/60 px-4 py-3">
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            {selected.length} selecionado(s)
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected([])}
              className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
            >
              Limpar
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Excluir ${selected.length} registro(s)?`)) {
                  removeMutation.mutate(selected);
                }
              }}
              className="inline-flex items-center gap-2 border border-red-600/40 bg-red-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-red-700"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Excluir selecionados
            </button>
          </div>
        </div>
      ) : null}

      {query.isLoading ? (
        <p className="border border-border bg-background px-6 py-10 text-sm text-muted-foreground">
          Carregando registros…
        </p>
      ) : query.isError ? (
        <p className="border border-red-600/30 bg-red-500/5 px-6 py-10 text-sm text-red-700">
          {friendlyError(query.error)}
        </p>
      ) : (
        <DataTable
          sort={sort}
          onSort={toggle}
          columns={[
            "",
            ...(imageKey ? [""] : []),
            ...columns.map((c) => ({
              label: c.label,
              sortKey: c.sortable === false ? undefined : c.key,
              align: c.align,
            })),
            "",
          ]}
        >
          {visible.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 2 + (imageKey ? 1 : 0)}
                className="px-6 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : null}
          {visible.map((r) => {
            const id = String(r.id);
            return (
              <tr key={id} className="hover:bg-secondary/40">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    aria-label="Selecionar linha"
                    checked={selected.includes(id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked ? [...prev, id] : prev.filter((s) => s !== id),
                      )
                    }
                    className="h-4 w-4 accent-[var(--color-accent,#b8964f)]"
                  />
                </td>
                {imageKey ? (
                  <td className="px-6 py-4">
                    <Thumb src={r[imageKey] as string | null} alt={String(r[columns[0].key] ?? "")} />
                  </td>
                ) : null}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-6 py-4 text-muted-foreground ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setEditing(r)}
                      aria-label="Editar"
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      {readOnly ? "Ver" : "Editar"}
                    </button>
                    {!readOnly ? (
                      <button
                        onClick={() => {
                          if (window.confirm("Excluir este registro?")) removeMutation.mutate([id]);
                        }}
                        aria-label="Excluir"
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-red-700 hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        Excluir
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
          {allVisibleIds.length > 0 && !readOnly ? (
            <tr className="bg-secondary/30">
              <td colSpan={columns.length + 2 + (imageKey ? 1 : 0)} className="px-6 py-3">
                <label className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setSelected(e.target.checked ? allVisibleIds : [])}
                    className="h-4 w-4"
                  />
                  Selecionar todos os visíveis
                </label>
              </td>
            </tr>
          ) : null}
        </DataTable>
      )}

      {creating || editing ? (
        <RecordForm
          entity={entity}
          table={table}
          fields={fields}
          bucket={bucket}
          imageKey={imageKey}
          multiImage={multiImage}
          record={editing}
          readOnly={readOnly}
          beforeSave={beforeSave}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(msg) => {
            setCreating(false);
            setEditing(null);
            setFeedback(msg);
            invalidate();
          }}
        />
      ) : null}
    </>
  );
}

function RecordForm({
  entity,
  table,
  fields,
  bucket,
  imageKey,
  multiImage,
  record,
  readOnly,
  beforeSave,
  onClose,
  onSaved,
}: {
  entity: string;
  table: TableName;
  fields: CrudField[];
  bucket?: BucketName;
  imageKey?: string;
  multiImage?: boolean;
  record: Rec | null;
  readOnly?: boolean;
  beforeSave?: (v: Rec) => Rec;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [values, setValues] = useState<Rec>(() => {
    const base: Rec = {};
    for (const f of fields) base[f.name] = record?.[f.name] ?? "";
    return base;
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentImage = imageKey ? (record?.[imageKey] as string | undefined) : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return onClose();
    setSaving(true);
    setError(null);
    try {
      const payload: Rec = {};
      for (const f of fields) {
        const v = values[f.name];
        if (v === "" || v === undefined || v === null) {
          payload[f.name] = null;
          continue;
        }
        payload[f.name] = f.type === "number" ? Number(String(v).replace(",", ".")) : v;
      }
      let urls: string[] = [];
      if (bucket && files.length > 0) {
        urls = await uploadImages(bucket, files);
        if (imageKey) payload[imageKey] = urls[0];
      }
      const final = beforeSave ? beforeSave(payload) : payload;
      if (record?.id) {
        await updateRow(table, String(record.id), final);
        if (multiImage && urls.length > 1) {
          await insertRows(
            "produtos_imagens",
            urls.slice(1).map((u, i) => ({ produto_id: record.id, imagem_url: u, ordem: i + 1 })),
          );
        }
        onSaved(`${entity} atualizado(a) com sucesso.`);
      } else {
        await insertRows(table, final);
        onSaved(`${entity} cadastrado(a) com sucesso.`);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form onSubmit={submit} className="my-8 w-full max-w-2xl border border-border bg-background p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">
              {record ? "Edição" : "Novo cadastro"}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">
              {record ? `${entity}` : `Novo ${entity}`}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {bucket && !readOnly ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Imagens {multiImage ? "(múltipla seleção)" : ""}
              </p>
              <label className="flex cursor-pointer items-center gap-4 border border-dashed border-border bg-secondary/40 p-4 transition-colors hover:border-foreground">
                {files.length > 0 || currentImage ? (
                  <img
                    src={files.length > 0 ? URL.createObjectURL(files[0]) : currentImage}
                    alt="Prévia"
                    className="h-20 w-20 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center bg-background text-muted-foreground">
                    <ImagePlus className="h-6 w-6" strokeWidth={1.25} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    {files.length > 0 ? `${files.length} imagem(ns) selecionada(s)` : "Selecionar imagens"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redimensionadas e comprimidas antes do envio ao bucket “{bucket}”.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple={multiImage}
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </label>
            </div>
          ) : null}

          {fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : "md:col-span-1"}>
              <label
                htmlFor={`f-${f.name}`}
                className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
              >
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={`f-${f.name}`}
                  rows={3}
                  disabled={readOnly}
                  className={inputCls}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                />
              ) : f.type === "select" ? (
                <select
                  id={`f-${f.name}`}
                  disabled={readOnly}
                  className={inputCls}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                >
                  <option value="">—</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`f-${f.name}`}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type ?? "text"}
                  step={f.type === "number" ? "any" : undefined}
                  disabled={readOnly}
                  className={inputCls}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setValues((p) => ({ ...p, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
          <button type="button" onClick={onClose} className={btnGhost}>
            {readOnly ? "Fechar" : "Cancelar"}
          </button>
          {!readOnly ? (
            <button
              type="submit"
              disabled={saving}
              className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
