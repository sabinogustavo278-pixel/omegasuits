import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatPrice } from "@/data/products";
import { removeFromCart, updateQty, useCart } from "@/lib/mock-cart";
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react";
import { useSession } from "@/lib/mock-auth";

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

function CheckoutPage() {
  const { entries, count, subtotal } = useCart();
  const navigate = useNavigate();

  const { session } = useSession();

  const seguir = () => {
    if (!count) return;
    navigate({ to: session ? "/checkout/dados" : "/login" });
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

          {count === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
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

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                      Total
                    </p>
                    <p className="font-serif text-2xl text-foreground">{formatPrice(total)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={seguir}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-accent bg-accent px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
                  >
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Continuar para pagamento
                  </button>
                  <p className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Pagamento processado pelo Stripe
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
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
