import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, CreditCard, Eye, EyeOff, PlugZap } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { callRpc, friendlyError, insertOne, updateRow, type Row } from "@/lib/db";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";
import { testarConexaoStripe, type TesteConexao } from "@/lib/stripe.functions";

export const Route = createFileRoute("/pagamentos/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações Stripe — Omega Admin" },
      { name: "description", content: "Chaves de integração Stripe da Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StripeConfigPage,
});

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

const labelCls = "mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground";

function SecretField({
  id,
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="off"
          className={`${inputCls} pr-12`}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function StripeConfigPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/pagamentos/configuracoes", role);
  const qc = useQueryClient();
  const testar = useServerFn(testarConexaoStripe);

  const config = useQuery({
    queryKey: ["get_stripe_config"],
    queryFn: () => callRpc("get_stripe_config"),
  });

  const record = config.data?.[0] as Row | undefined;

  const [publishable, setPublishable] = useState("");
  const [secret, setSecret] = useState("");
  const [webhook, setWebhook] = useState("");
  const [modoTeste, setModoTeste] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teste, setTeste] = useState<TesteConexao | null>(null);

  useEffect(() => {
    if (!record) return;
    setPublishable(String(record.publishable_key ?? ""));
    setModoTeste(record.modo_teste !== false);
    setSecret("");
    setWebhook("");
  }, [record]);

  const secretMask = String(record?.secret_key_mask ?? "");
  const webhookMask = String(record?.webhook_secret_mask ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const payload: Row = {
        publishable_key: publishable.trim(),
        modo_teste: modoTeste,
      };
      if (secret.trim()) payload.secret_key = secret.trim();
      if (webhook.trim()) payload.webhook_secret = webhook.trim();

      if (record?.id) await updateRow("stripe_config", String(record.id), payload);
      else await insertOne("stripe_config", payload);
    },
    onSuccess: () => {
      setSaved(true);
      setError(null);
      setTeste(null);
      qc.invalidateQueries({ queryKey: ["get_stripe_config"] });
    },
    onError: (e) => {
      setSaved(false);
      setError(friendlyError(e));
    },
  });

  const conexao = useMutation({
    mutationFn: async () => testar({ data: {} } as never),
    onSuccess: (res) => {
      setTeste(res as TesteConexao);
      setError(null);
    },
    onError: (e) => {
      setTeste(null);
      setError(friendlyError(e));
    },
  });

  const dirty = (v: string) => {
    setSaved(false);
    setTeste(null);
    return v;
  };

  return (
    <AdminShell eyebrow="Gestão de Pagamentos" title="Configurações Stripe">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="max-w-3xl border border-border bg-background p-8"
      >
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-14 w-14 items-center justify-center border border-border bg-secondary/60 text-accent">
            <CreditCard className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Integração</p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">Chaves do Stripe</h2>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label htmlFor="s-pk" className={labelCls}>
              Publishable Key
            </label>
            <input
              id="s-pk"
              type="text"
              autoComplete="off"
              className={inputCls}
              disabled={readOnly}
              placeholder="pk_test_..."
              value={publishable}
              onChange={(e) => setPublishable(dirty(e.target.value))}
            />
          </div>

          <SecretField
            id="s-sk"
            label="Secret Key"
            value={secret}
            disabled={readOnly}
            placeholder={secretMask || "sk_test_..."}
            onChange={(v) => setSecret(dirty(v))}
          />
          {secretMask ? (
            <p className="-mt-3 text-[11px] text-muted-foreground">
              Chave salva: <span className="font-mono">{secretMask}</span>. Deixe em branco para manter.
            </p>
          ) : null}

          <SecretField
            id="s-wh"
            label="Webhook Secret"
            value={webhook}
            disabled={readOnly}
            placeholder={webhookMask || "whsec_..."}
            onChange={(v) => setWebhook(dirty(v))}
          />
          {webhookMask ? (
            <p className="-mt-3 text-[11px] text-muted-foreground">
              Segredo salvo: <span className="font-mono">{webhookMask}</span>. Deixe em branco para manter.
            </p>
          ) : null}

          <div className="flex items-center justify-between border border-border bg-secondary/40 px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Modo teste
              </p>
              <p className="mt-1 text-sm text-foreground">
                {modoTeste
                  ? "Usando chaves de teste (nenhuma cobrança real)."
                  : "Usando chaves de produção (cobranças reais)."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={modoTeste}
              aria-label="Alternar modo teste"
              disabled={readOnly}
              onClick={() => {
                setSaved(false);
                setTeste(null);
                setModoTeste((v) => !v);
              }}
              className={`relative h-7 w-14 shrink-0 border transition-colors disabled:opacity-50 ${
                modoTeste ? "border-accent bg-accent/20" : "border-border bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-6 transition-transform ${
                  modoTeste ? "translate-x-7 bg-accent" : "translate-x-0.5 bg-muted-foreground"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          As chaves ficam gravadas na tabela <span className="font-mono">stripe_config</span>, com
          leitura e escrita liberadas apenas para o perfil Administrador. Prefira chaves de teste
          durante o desenvolvimento.
        </p>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        {teste ? (
          <div
            className={`mt-4 border px-5 py-4 text-sm ${
              teste.ok
                ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-800"
                : "border-red-600/30 bg-red-500/10 text-red-700"
            }`}
          >
            <p>{teste.mensagem}</p>
            {teste.divergencia ? (
              <p className="mt-1 text-xs">
                Atenção: a chave salva é de{" "}
                {teste.modoDetectado === "teste" ? "teste" : "produção"} e não corresponde ao toggle
                de modo teste.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-border pt-5">
          {record?.updated_at ? (
            <span className="mr-auto text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Atualizado em {new Date(String(record.updated_at)).toLocaleString("pt-BR")}
            </span>
          ) : null}
          {saved ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" strokeWidth={2} />
              Chaves salvas
            </span>
          ) : null}
          <button
            type="submit"
            disabled={readOnly || save.isPending}
            className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-50"
          >
            {save.isPending ? "Salvando…" : "Salvar chaves"}
          </button>
          <button
            type="button"
            onClick={() => conexao.mutate()}
            disabled={conexao.isPending}
            className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-foreground transition-colors hover:border-foreground disabled:opacity-50"
          >
            <PlugZap className="h-4 w-4" strokeWidth={1.5} />
            {conexao.isPending ? "Testando…" : "Testar conexão"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
