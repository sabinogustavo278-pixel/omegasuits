import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { callRpc, friendlyError, insertOne, updateRow, type Row } from "@/lib/db";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Dados da empresa — Omega Admin" },
      { name: "description", content: "Dados cadastrais da Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmpresaPage,
});

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

const FIELDS = [
  { name: "razao_social", label: "Razão social", span: true },
  { name: "nome_fantasia", label: "Nome fantasia", span: true },
  { name: "cnpj", label: "CNPJ" },
  { name: "inscricao_estadual", label: "Inscrição estadual" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "telefone", label: "Telefone", type: "tel" },
  { name: "endereco", label: "Endereço", span: true },
  { name: "cidade", label: "Cidade" },
  { name: "estado", label: "UF" },
  { name: "cep", label: "CEP" },
] as const;

type Values = Record<string, string>;

const empty: Values = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

function EmpresaPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/empresa", role);
  const qc = useQueryClient();

  const config = useQuery({
    queryKey: ["get_empresa_config"],
    queryFn: () => callRpc("get_empresa_config"),
  });

  const [values, setValues] = useState<Values>(empty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const record = config.data?.[0] as Row | undefined;

  useEffect(() => {
    if (!record) return;
    setValues(
      Object.fromEntries(FIELDS.map((f) => [f.name, String(record[f.name] ?? "")])) as Values,
    );
  }, [record]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: Row = Object.fromEntries(
        FIELDS.map((f) => [f.name, values[f.name]?.trim() ? values[f.name] : null]),
      );
      payload.razao_social = values.razao_social?.trim() || "";
      if (record?.id) await updateRow("empresa_config", String(record.id), payload);
      else await insertOne("empresa_config", payload);
    },
    onSuccess: () => {
      setSaved(true);
      setError(null);
      qc.invalidateQueries({ queryKey: ["get_empresa_config"] });
    },
    onError: (e) => {
      setSaved(false);
      setError(friendlyError(e));
    },
  });

  return (
    <AdminShell eyebrow="Configurações" title="Dados da empresa">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="max-w-3xl border border-border bg-background p-8"
      >
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-14 w-14 items-center justify-center border border-border bg-secondary/60 text-accent">
            <Building2 className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Identificação</p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">Cadastro da matriz</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name} className={"span" in f && f.span ? "md:col-span-2" : undefined}>
              <label
                htmlFor={`e-${f.name}`}
                className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
              >
                {f.label}
              </label>
              <input
                id={`e-${f.name}`}
                type={"type" in f ? f.type : "text"}
                className={inputCls}
                disabled={readOnly}
                value={values[f.name] ?? ""}
                onChange={(e) => {
                  setSaved(false);
                  setValues((p) => ({ ...p, [f.name]: e.target.value }));
                }}
              />
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Estes dados são usados no cabeçalho dos pedidos de compra enviados aos fornecedores.
        </p>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-border pt-5">
          {saved ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" strokeWidth={2} />
              Dados salvos
            </span>
          ) : null}
          <button
            type="submit"
            disabled={readOnly || save.isPending}
            className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-50"
          >
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
