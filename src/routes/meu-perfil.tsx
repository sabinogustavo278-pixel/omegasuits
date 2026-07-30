import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCircle2, ShoppingBag } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, StatCard, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { callRpc, friendlyError } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/mock-auth";
import { useAvatar } from "@/lib/mock-account";
import { useCurrentRole } from "@/lib/user-role";
import { roleLabel } from "@/lib/mock-roles";
import { formatPrice } from "@/data/products";

export const Route = createFileRoute("/meu-perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Omega Suits" },
      { name: "description", content: "Dados da conta e histórico de compras Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeuPerfilPage,
});

function MeuPerfilPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const avatar = useAvatar();
  const { role } = useCurrentRole();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const userId = session?.user.id;

  const perfil = useQuery({
    queryKey: ["user_profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("name, email, avatar_url, telefone, status, profile:profiles(name)")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const pedidos = useQuery({
    queryKey: ["list_pedidos_cliente", userId],
    enabled: !!userId,
    queryFn: () => callRpc("list_pedidos_cliente"),
  });

  const rows = pedidos.data ?? [];
  const { rows: visible, sort, toggle } = useTableSort(rows, { key: "data_pedido", dir: "desc" });
  const totalGasto = rows.reduce((s, r) => s + Number(r.valor_total ?? 0), 0);

  const nome =
    (perfil.data?.name as string | undefined) ??
    (session?.user.user_metadata?.nome as string | undefined) ??
    "—";
  const email = (perfil.data?.email as string | undefined) ?? session?.user.email ?? "—";
  const foto = avatar ?? (perfil.data?.avatar_url as string | undefined) ?? null;
  const cargo =
    (Array.isArray(perfil.data?.profile) ? perfil.data?.profile[0]?.name : perfil.data?.profile?.name) ??
    roleLabel(role);

  return (
    <AdminShell eyebrow="Conta" title="Meu perfil">
      <section className="border border-border bg-background p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {foto ? (
            <img src={foto} alt={`Avatar de ${nome}`} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground">
              <UserCircle2 className="h-10 w-10" strokeWidth={1.1} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">{cargo}</p>
            <h2 className="mt-2 font-serif text-3xl text-foreground">{nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            {perfil.data?.telefone ? (
              <p className="text-sm text-muted-foreground">{String(perfil.data.telefone)}</p>
            ) : null}
          </div>
          <Link
            to="/conta"
            className="inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Editar conta
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Pedidos realizados" value={String(rows.length)} />
        <StatCard label="Total investido" value={formatPrice(totalGasto)} />
        <StatCard
          label="Ticket médio"
          value={rows.length ? formatPrice(totalGasto / rows.length) : "—"}
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <ShoppingBag className="h-4 w-4 text-accent" strokeWidth={1.5} />
          <h3 className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            Histórico de compras
          </h3>
        </div>

        {pedidos.isLoading ? (
          <p className="border border-border bg-background px-6 py-10 text-sm text-muted-foreground">
            Carregando pedidos…
          </p>
        ) : pedidos.isError ? (
          <p className="border border-red-600/30 bg-red-500/5 px-6 py-10 text-sm text-red-700">
            {friendlyError(pedidos.error)}
          </p>
        ) : (
          <DataTable
            sort={sort}
            onSort={toggle}
            columns={[
              { label: "Nº", sortKey: "numero" },
              { label: "Data", sortKey: "data_pedido" },
              { label: "Itens", sortKey: "total_itens" },
              { label: "Pagamento", sortKey: "metodo_pagamento" },
              { label: "Total", sortKey: "valor_total" },
              { label: "Status", sortKey: "status" },
            ]}
          >
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma compra registrada para este e-mail.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={String(r.id)} className="border-t border-border/70">
                  <td className="px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-accent">
                    {String(r.numero ?? "—")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {r.data_pedido
                      ? new Date(String(r.data_pedido)).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {String(r.total_itens ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {String(r.metodo_pagamento ?? "—")}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {r.valor_total == null ? "—" : formatPrice(Number(r.valor_total))}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={String(r.status)} />
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        )}
      </div>
    </AdminShell>
  );
}
