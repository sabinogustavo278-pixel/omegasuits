import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/DataTable";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Omega Admin" },
      { name: "description", content: "Painel administrativo Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const shortcuts = [
  { to: "/fornecedores", label: "Fornecedores", desc: "Cadastro de parceiros e ateliês." },
  { to: "/fornecedores/pedido", label: "Pedidos de compra", desc: "Ordens em curso e recebidas." },
  { to: "/categorias", label: "Categorias", desc: "Estrutura de coleções e famílias." },
  { to: "/produtos", label: "Produtos", desc: "Ficha, preço e disponibilidade." },
  { to: "/estoque", label: "Estoque", desc: "Saldos por depósito e movimentações." },
] as const;

function DashboardPage() {
  return (
    <AdminShell eyebrow="Painel" title="Visão geral do ateliê">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Fornecedores ativos" value="18" hint="+2 no mês" />
        <StatCard label="Pedidos em aberto" value="6" hint="R$ 148.900" />
        <StatCard label="SKUs em ruptura" value="3" hint="Ação imediata" />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group border border-border bg-background p-6 transition-colors hover:border-foreground"
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Gerenciar</p>
            <h3 className="mt-2 font-serif text-2xl text-foreground">{s.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground">
              Abrir →
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
