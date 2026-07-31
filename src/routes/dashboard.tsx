import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/DataTable";
import { callRpc } from "@/lib/db";
import { formatPrice } from "@/data/products";

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
  {
    to: "/pedidos-compra/historico",
    label: "Histórico de compras",
    desc: "Status dos pedidos e entrada em estoque.",
  },
  { to: "/categorias", label: "Categorias", desc: "Estrutura de coleções e famílias." },
  { to: "/produtos", label: "Produtos", desc: "Ficha, preço e disponibilidade." },
  { to: "/estoque", label: "Estoque", desc: "Saldos por depósito e movimentações." },
  { to: "/clientes", label: "Clientes", desc: "Base de clientes e histórico de compras." },
  { to: "/usuarios", label: "Usuários", desc: "Contas de acesso ao painel." },
  { to: "/perfis", label: "Perfis", desc: "Administrador, Gerente e Usuário." },
  { to: "/acessos", label: "Acessos", desc: "Matriz de permissões por rota." },
  { to: "/conta", label: "Minha conta", desc: "Avatar e alteração de senha." },
] as const;

const AXIS = "hsl(var(--muted-foreground))";

function ChartCard({
  title,
  hint,
  state,
  children,
}: {
  title: string;
  hint?: string;
  state: { isLoading: boolean; isError: boolean };
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-background p-6">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Indicadores</p>
      <h3 className="mt-2 font-serif text-2xl text-foreground">{title}</h3>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-6 h-64">
        {state.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando dados…</p>
        ) : state.isError ? (
          <p className="text-sm text-muted-foreground">
            Entre com um usuário Administrador ou Gerente para visualizar o gráfico.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard_metrics"],
    queryFn: () => callRpc("dashboard_metrics"),
  });
  const faturamento = useQuery({
    queryKey: ["faturamento_por_mes"],
    queryFn: () => callRpc("faturamento_por_mes"),
  });
  const produtosMes = useQuery({
    queryKey: ["produtos_por_mes"],
    queryFn: () => callRpc("produtos_por_mes"),
  });

  const m = (data?.[0] ?? {}) as Record<string, number>;
  const v = (k: string) => (isLoading ? "…" : isError ? "—" : String(m[k] ?? 0));

  const faturamentoData = (faturamento.data ?? []).map((r) => ({
    rotulo: String(r.rotulo),
    total: Number(r.total ?? 0),
    pedidos: Number(r.pedidos ?? 0),
  }));
  const produtosData = (produtosMes.data ?? []).map((r) => ({
    rotulo: String(r.rotulo),
    total: Number(r.total ?? 0),
  }));

  return (
    <AdminShell eyebrow="Painel" title="Visão geral do ateliê">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Produtos cadastrados" value={v("total_produtos")} hint={`${v("total_clientes")} clientes`} />
        <StatCard
          label="Pedidos de compra em aberto"
          value={v("pedidos_compra_abertos")}
          hint={isLoading ? undefined : formatPrice(Number(m.valor_compras_abertas ?? 0))}
        />
        <StatCard label="SKUs em ruptura" value={v("skus_ruptura")} hint={`${v("skus_criticos")} críticos`} />
      </div>

      {isError ? (
        <p className="mt-6 border border-border bg-background px-6 py-4 text-sm text-muted-foreground">
          Entre com um usuário Administrador ou Gerente para visualizar os indicadores.
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Faturamento de pedidos por mês (R$)"
          hint="Pedidos de venda dos últimos 12 meses"
          state={faturamento}
        >
          <LineChart data={faturamentoData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="rotulo" stroke={AXIS} fontSize={11} tickLine={false} />
            <YAxis
              stroke={AXIS}
              fontSize={11}
              tickLine={false}
              tickFormatter={(val: number) => (val >= 1000 ? `${Math.round(val / 1000)}k` : String(val))}
            />
            <Tooltip
              formatter={(val: number) => formatPrice(Number(val))}
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Faturamento"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard
          title="Quantidade de produtos por mês"
          hint="Produtos cadastrados nos últimos 12 meses"
          state={produtosMes}
        >
          <BarChart data={produtosData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="rotulo" stroke={AXIS} fontSize={11} tickLine={false} />
            <YAxis stroke={AXIS} fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" name="Produtos" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartCard>
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
