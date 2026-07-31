import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatPrice } from "@/data/products";
import { clearCart, removeFromCart, updateQty, useCart } from "@/lib/mock-cart";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Omega Suits" },
      {
        name: "description",
        content:
          "Finalize sua compra na Omega Suits: revisão dos itens, endereço de entrega e pagamento seguro.",
      },
      { property: "og:title", content: "Checkout — Omega Suits" },
      {
        property: "og:description",
        content: "Revisão do pedido, entrega e pagamento.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

// ---------- máscaras ----------
const onlyDigits = (v: string) => v.replace(/\D+/g, "");

const maskCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
const maskCard = (v: string) =>
  onlyDigits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
const maskExp = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
const maskCvv = (v: string) => onlyDigits(v).slice(0, 4);

function CheckoutPage() {
  const { entries, count, subtotal } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    endereco: "",
    cidade: "",
    uf: "",
    cep: "",
    cardName: "",
    cardNumber: "",
    exp: "",
    cvv: "",
    cupom: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome";
    if (!/.+@.+\..+/.test(form.email)) e.email = "E-mail inválido";
    if (!form.endereco.trim()) e.endereco = "Informe o endereço";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    if (form.uf.trim().length !== 2) e.uf = "UF com 2 letras";
    if (onlyDigits(form.cep).length !== 8) e.cep = "CEP inválido";
    if (!form.cardName.trim()) e.cardName = "Nome no cartão";
    if (onlyDigits(form.cardNumber).length < 13) e.cardNumber = "Número inválido";
    if (!/^\d{2}\/\d{2}$/.test(form.exp)) e.exp = "MM/AA";
    if (onlyDigits(form.cvv).length < 3) e.cvv = "CVV inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!count) return;
    if (!validate()) return;
    const num =
      "OM-" +
      new Date().getFullYear() +
      "-" +
      String(Math.floor(Math.random() * 9000) + 1000);
    setConfirmed(num);
    clearCart();
  };

  const frete = subtotal > 0 ? 0 : 0;
  const total = subtotal + frete;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.4em] text-accent">Checkout</p>
            <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
              Finalize seu pedido
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Revisão dos itens, endereço de entrega e pagamento. Envio cortesia para todo o Brasil.
            </p>
          </div>

          {count === 0 && !confirmed ? (
            <EmptyState />
          ) : confirmed ? (
            <Confirmation number={confirmed} onContinue={() => navigate({ to: "/" })} />
          ) : (
            <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
              {/* Esquerda: itens + formulários */}
              <div className="space-y-10">
                <section className="border border-border bg-background">
                  <header className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="font-serif text-xl text-foreground">Sua sacola</h2>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {count} {count === 1 ? "peça" : "peças"}
                    </span>
                  </header>
                  <ul className="divide-y divide-border">
                    {entries.map((e) => (
                      <li key={e.key} className="flex gap-5 p-6">
                        <img
                          src={e.image}
                          alt={e.name}
                          className="h-32 w-24 flex-none object-cover"
                          loading="lazy"
                        />
                        <div className="flex flex-1 flex-col">
                          <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                            {e.categoryLabel}
                          </p>
                          <h3 className="mt-1 font-serif text-lg text-foreground">
                            {e.name}
                          </h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Tamanho: <span className="text-foreground">{e.size}</span>
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <div className="inline-flex items-center border border-border">
                              <button
                                type="button"
                                aria-label="Diminuir"
                                onClick={() => updateQty(e.productId, e.size, e.qty - 1)}
                                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="h-3 w-3" strokeWidth={1.5} />
                              </button>
                              <span className="min-w-8 border-x border-border px-3 py-2 text-center text-sm text-foreground">
                                {e.qty}
                              </span>
                              <button
                                type="button"
                                aria-label="Aumentar"
                                onClick={() => updateQty(e.productId, e.size, e.qty + 1)}
                                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="h-3 w-3" strokeWidth={1.5} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-sm text-foreground">{formatPrice(e.subtotal)}</p>
                              <button
                                type="button"
                                aria-label="Remover"
                                onClick={() => removeFromCart(e.productId, e.size)}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}

                  </ul>
                </section>

                <section className="border border-border bg-background p-6 md:p-8">
                  <h2 className="font-serif text-xl text-foreground">Endereço de entrega</h2>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="Nome completo" error={errors.nome} className="md:col-span-2">
                      <input
                        value={form.nome}
                        onChange={(e) => set("nome", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="E-mail" error={errors.email} className="md:col-span-2">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Endereço" error={errors.endereco} className="md:col-span-2">
                      <input
                        value={form.endereco}
                        onChange={(e) => set("endereco", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Cidade" error={errors.cidade}>
                      <input
                        value={form.cidade}
                        onChange={(e) => set("cidade", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="UF" error={errors.uf}>
                        <input
                          value={form.uf}
                          maxLength={2}
                          onChange={(e) => set("uf", e.target.value.toUpperCase())}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="CEP" error={errors.cep}>
                        <input
                          value={form.cep}
                          inputMode="numeric"
                          onChange={(e) => set("cep", maskCep(e.target.value))}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="border border-border bg-background p-6 md:p-8">
                  <h2 className="font-serif text-xl text-foreground">Pagamento</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cartão de crédito em até 6x sem juros.
                  </p>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="Nome impresso no cartão" error={errors.cardName} className="md:col-span-2">
                      <input
                        value={form.cardName}
                        onChange={(e) => set("cardName", e.target.value.toUpperCase())}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Número do cartão" error={errors.cardNumber} className="md:col-span-2">
                      <input
                        value={form.cardNumber}
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        onChange={(e) => set("cardNumber", maskCard(e.target.value))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Validade (MM/AA)" error={errors.exp}>
                      <input
                        value={form.exp}
                        inputMode="numeric"
                        placeholder="MM/AA"
                        onChange={(e) => set("exp", maskExp(e.target.value))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <input
                        value={form.cvv}
                        inputMode="numeric"
                        placeholder="000"
                        onChange={(e) => set("cvv", maskCvv(e.target.value))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>
              </div>

              {/* Direita: resumo */}
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="border border-border bg-background p-6 md:p-8">
                  <h2 className="font-serif text-xl text-foreground">Resumo</h2>
                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="text-foreground">{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Frete</dt>
                      <dd className="text-accent">Cortesia</dd>
                    </div>
                  </dl>

                  <div className="mt-5 border-t border-border pt-4">
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                      Cupom
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={form.cupom}
                        onChange={(e) => set("cupom", e.target.value)}
                        placeholder="OMEGA26"
                        className="flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            form.cupom
                              ? "Cupom validado (mock)."
                              : "Informe um código de cupom.",
                          )
                        }
                        className="border border-border px-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:border-foreground hover:text-foreground"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                      Total
                    </p>
                    <p className="font-serif text-2xl text-foreground">{formatPrice(total)}</p>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full border border-accent bg-accent px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
                  >
                    Finalizar compra
                  </button>
                  <p className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Pagamento seguro · Envio cortesia
                  </p>
                </div>
              </aside>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-border bg-background px-8 py-20 text-center">
      <ShoppingBag
        className="mx-auto h-10 w-10 text-muted-foreground"
        strokeWidth={1.25}
      />
      <h2 className="mt-6 font-serif text-3xl text-foreground">Sua sacola está vazia</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Descubra a nova coleção de alfaiataria e comece sua composição.
      </p>
      <Link
        to="/ternos"
        className="mt-8 inline-flex items-center justify-center border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        Visitar a loja
      </Link>
    </div>
  );
}

function Confirmation({
  number,
  onContinue,
}: {
  number: string;
  onContinue: () => void;
}) {
  return (
    <div className="border border-border bg-background px-8 py-20 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-accent" strokeWidth={1.25} />
      <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-accent">Pedido recebido</p>
      <h2 className="mt-3 font-serif text-4xl text-foreground">
        Obrigado pela sua compra
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Seu pedido{" "}
        <span className="font-serif text-foreground">{number}</span> foi confirmado. Enviaremos os
        detalhes por e-mail em instantes.
      </p>
      <button
        onClick={onContinue}
        className="mt-8 inline-flex items-center justify-center border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        Continuar navegando
      </button>
    </div>
  );
}
