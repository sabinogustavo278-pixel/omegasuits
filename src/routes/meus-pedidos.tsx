import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatPrice } from "@/data/products";
import { callRpc, type Row } from "@/lib/db";
import { useSession } from "@/lib/mock-auth";
import { ENTREGA_ETAPAS, entregaLabel } from "@/lib/pedido-status";
import { Check, PackageSearch } from "lucide-react";

export const Route = createFileRoute("/meus-pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — Omega Suits" },
      {
        name: "description",
        content:
          "Acompanhe o status dos seus pedidos Omega Suits: pagamento, preparação, envio e entrega.",
      },
      { property: "og:title", content: "Meus pedidos — Omega Suits" },
      {
        property: "og:description",
        content: "Acompanhamento de pedidos e entregas da Omega Suits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeusPedidosPage,
});

type Item = {
  produto: string;
  sku: string | null;
  imagem_url: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
};

function MeusPedidosPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [filtro, setFiltro] = useState<string>("todos");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const pedidos = useQuery({
    queryKey: ["list_meus_pedidos"],
    queryFn: () => callRpc("list_meus_pedidos"),
    enabled: !!session,
  });

  const lista = useMemo(() => {
    const rows = (pedidos.data ?? []) as Row[];
    if (filtro === "todos") return rows;
    return rows.filter((p) => String(p.status_entrega) === filtro);
  }, [pedidos.data, filtro]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.4em] text-accent">Minha conta</p>
          <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">Meus pedidos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Acompanhe cada etapa: pagamento, preparação no ateliê, envio e entrega.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {[{ value: "todos", label: "Todos" }, ...ENTREGA_ETAPAS].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`border px-4 py-2 text-[10px] uppercase tracking-[0.28em] transition-colors ${
                  filtro === f.value
                    ? "border-accent bg-accent text-charcoal"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {pedidos.isLoading ? (
            <p className="mt-12 text-sm text-muted-foreground">Carregando pedidos…</p>
          ) : lista.length === 0 ? (
            <div className="mt-12 border border-border bg-background px-8 py-20 text-center">
              <PackageSearch
                className="mx-auto h-10 w-10 text-muted-foreground"
                strokeWidth={1.25}
              />
              <h2 className="mt-6 font-serif text-3xl text-foreground">Nenhum pedido por aqui</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Quando você concluir uma compra, o acompanhamento aparece nesta página.
              </p>
              <Link
                to="/ternos"
                className="mt-8 inline-block border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Visitar a loja
              </Link>
            </div>
          ) : (
            <ul className="mt-12 space-y-8">
              {lista.map((p) => (
                <li key={String(p.id)} className="border border-border bg-background">
                  <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-accent">
                        Pedido {String(p.numero ?? "")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(String(p.data_pedido)).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl text-foreground">
                        {formatPrice(Number(p.valor_total ?? 0))}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        {entregaLabel(String(p.status_entrega))}
                      </p>
                    </div>
                  </header>

                  <Timeline status={String(p.status_entrega)} />

                  <ul className="divide-y divide-border border-t border-border">
                    {((p.itens ?? []) as Item[]).map((it, idx) => (
                      <li key={idx} className="flex items-center gap-4 px-6 py-4">
                        {it.imagem_url ? (
                          <img
                            src={it.imagem_url}
                            alt={it.produto}
                            className="h-16 w-12 flex-none object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-16 w-12 flex-none bg-secondary" />
                        )}
                        <div className="flex-1">
                          <p className="font-serif text-base text-foreground">{it.produto}</p>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                            {it.quantidade}x · {formatPrice(Number(it.preco_unitario ?? 0))}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">
                          {formatPrice(Number(it.subtotal ?? 0))}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {p.endereco_entrega ? (
                    <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
                      Entrega em {String(p.endereco_entrega)} — {String(p.cidade_entrega ?? "")}/
                      {String(p.estado_entrega ?? "")}
                    </footer>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Timeline({ status }: { status: string }) {
  const etapas = ENTREGA_ETAPAS.filter((e) => e.value !== "cancelado");
  const atual = etapas.findIndex((e) => e.value === status);
  const cancelado = status === "cancelado";

  if (cancelado) {
    return (
      <div className="px-6 py-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-red-600">Pedido cancelado</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-wrap gap-6 px-6 py-6">
      {etapas.map((e, idx) => {
        const feito = atual >= idx && atual >= 0;
        return (
          <li key={e.value} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] ${
                feito
                  ? "border-accent bg-accent text-charcoal"
                  : "border-border text-muted-foreground"
              }`}
            >
              {feito ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : idx + 1}
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.28em] ${
                feito ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {e.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
