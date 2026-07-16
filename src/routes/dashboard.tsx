import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { isAuthenticated, signOut } from "@/lib/mock-auth";
import { formatPrice, products } from "@/data/products";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Minha conta — Omega Suits" },
      { name: "description", content: "Área do cliente Omega Suits." },
    ],
  }),
  component: DashboardPage,
});

const mockOrders = [
  {
    id: "OMG-2408-041",
    date: "12 Ago 2025",
    status: "Em prova final",
    total: 4890,
    item: "Terno Marinho Clássico",
  },
  {
    id: "OMG-2405-018",
    date: "24 Mai 2025",
    status: "Entregue",
    total: 2880,
    item: "Sapato Oxford Havana · Cinto Marrom",
  },
  {
    id: "OMG-2402-007",
    date: "09 Fev 2025",
    status: "Entregue",
    total: 690,
    item: "Camisa Social Alvo",
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login", replace: true });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  const wishlist = products.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/40">
        <section className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-10 md:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-accent">
                Minha conta
              </p>
              <h1 className="mt-3 font-serif text-5xl text-foreground md:text-6xl">
                Olá, Sr. Almeida
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Cliente Omega desde outubro de 2019.
              </p>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate({ to: "/", replace: true });
              }}
              className="border border-border px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3 md:px-10">
          {/* Orders */}
          <div className="md:col-span-2 border border-border bg-background p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-foreground">Pedidos recentes</h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Últimos 12 meses
              </span>
            </div>
            <ul className="mt-6 divide-y divide-border">
              {mockOrders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
                      {o.id}
                    </p>
                    <p className="mt-1 font-serif text-lg text-foreground">{o.item}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{o.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {o.status}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{formatPrice(o.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Profile / Address */}
          <div className="space-y-6">
            <InfoCard title="Dados da conta">
              <Row label="Nome" value="Ricardo Almeida" />
              <Row label="E-mail" value="ricardo.almeida@omega.example" />
              <Row label="Telefone" value="+55 11 9 8080 1962" />
            </InfoCard>
            <InfoCard title="Endereço de entrega">
              <p className="text-sm leading-relaxed text-foreground">
                Alameda Casa Branca, 421
                <br />
                Ap. 92 — Jardins
                <br />
                São Paulo · SP · 01408-001
              </p>
            </InfoCard>
            <InfoCard title="Ateliê designado">
              <p className="text-sm leading-relaxed text-foreground">
                Sr. Bernardo Vitali
                <br />
                Alfaiate-chefe · Omega Rua Barão
              </p>
              <Link
                to="/"
                className="mt-4 inline-block text-[11px] uppercase tracking-[0.3em] text-accent hover:text-foreground"
              >
                Agendar prova →
              </Link>
            </InfoCard>
          </div>
        </section>

        {/* Wishlist */}
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl text-foreground">Peças reservadas</h2>
            <Link
              to="/ternos"
              className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              Ver coleção →
            </Link>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((p) => (
              <article key={p.id} className="flex flex-col">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="aspect-[3/4] w-full object-cover"
                />
                <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-accent">
                  {p.categoryLabel}
                </p>
                <h3 className="mt-1 font-serif text-xl text-foreground">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(p.price)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background p-6">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
