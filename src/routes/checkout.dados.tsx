import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/mock-cart";
import { useSession } from "@/lib/mock-auth";
import { criarSessaoCheckout, obterMeusDados, salvarDadosCliente } from "@/lib/checkout.functions";
import { Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/checkout/dados")({
  head: () => ({
    meta: [
      { title: "Dados de entrega — Omega Suits" },
      {
        name: "description",
        content: "Complete seu cadastro e endereço de entrega para finalizar a compra.",
      },
      { property: "og:title", content: "Dados de entrega — Omega Suits" },
      { property: "og:description", content: "Cadastro e endereço para o checkout seguro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DadosPage,
});

const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const maskCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
const maskCpf = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
};
const maskTel = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3");
};

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

function DadosPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { entries, count, subtotal } = useCart();

  const salvar = useServerFn(salvarDadosCliente);
  const carregar = useServerFn(obterMeusDados);
  const criarSessao = useServerFn(criarSessaoCheckout);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) navigate({ to: "/login", search: { redirect: "/checkout/dados" } as never });
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (!session) return;
    carregar({}).then((dados) => {
      if (!dados) return;
      setForm((s) => ({
        ...s,
        nome: dados.nome ?? s.nome,
        email: dados.email ?? session.user.email ?? "",
        cpf: dados.cpf ? maskCpf(dados.cpf) : "",
        telefone: dados.telefone ? maskTel(dados.telefone) : "",
        cep: dados.cep ? maskCep(dados.cep) : "",
        endereco: dados.endereco ?? "",
        cidade: dados.cidade ?? "",
        estado: dados.estado ?? "",
      }));
    });
  }, [session, carregar]);

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErro(null);
    if (count === 0) {
      setErro("Sua sacola está vazia.");
      return;
    }
    setEnviando(true);
    try {
      await salvar({ data: { ...form, estado: form.estado.toUpperCase() } });
      const { url } = await criarSessao({
        data: {
          itens: entries.map((e) => ({ produtoId: e.productId, size: e.size, qty: e.qty })),
          origin: window.location.origin,
        },
      });
      window.location.href = url;
    } catch (err) {
      setErro((err as Error).message ?? "Não foi possível seguir para o pagamento.");
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-accent">Etapa 2 de 3</p>
          <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
            Dados de entrega
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Complete seu cadastro. Em seguida você será levado ao ambiente seguro do Stripe para
            concluir o pagamento.
          </p>

          <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr,1fr]">
            <div className="border border-border bg-background p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nome completo" className="md:col-span-2">
                  <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} />
                </Field>
                <Field label="E-mail">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    value={form.telefone}
                    inputMode="numeric"
                    onChange={(e) => set("telefone", maskTel(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="CPF">
                  <input
                    value={form.cpf}
                    inputMode="numeric"
                    onChange={(e) => set("cpf", maskCpf(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="CEP">
                  <input
                    value={form.cep}
                    inputMode="numeric"
                    onChange={(e) => set("cep", maskCep(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="Endereço" className="md:col-span-2">
                  <input
                    value={form.endereco}
                    onChange={(e) => set("endereco", e.target.value)}
                    placeholder="Rua, número, complemento"
                    className={inputCls}
                  />
                </Field>
                <Field label="Cidade">
                  <input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={inputCls} />
                </Field>
                <Field label="UF">
                  <input
                    value={form.estado}
                    maxLength={2}
                    onChange={(e) => set("estado", e.target.value.toUpperCase())}
                    className={inputCls}
                  />
                </Field>
              </div>
              {erro ? <p className="mt-6 text-sm text-red-600">{erro}</p> : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-border bg-background p-6 md:p-8">
                <h2 className="font-serif text-xl text-foreground">Resumo</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {entries.map((e) => (
                    <li key={e.key} className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">
                        {e.name}
                        <span className="block text-[10px] uppercase tracking-[0.24em]">
                          {e.size} · {e.qty}x
                        </span>
                      </span>
                      <span className="text-foreground">{formatPrice(e.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Total</p>
                  <p className="font-serif text-2xl text-foreground">{formatPrice(subtotal)}</p>
                </div>
                <button
                  type="submit"
                  disabled={enviando || count === 0}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-accent bg-accent px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-charcoal transition-colors hover:bg-transparent hover:text-accent disabled:opacity-50"
                >
                  {enviando ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                  {enviando ? "Redirecionando" : "Pagar com Stripe"}
                </button>
                <Link
                  to="/checkout"
                  className="mt-3 block text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
                >
                  Voltar à sacola
                </Link>
              </div>
            </aside>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
