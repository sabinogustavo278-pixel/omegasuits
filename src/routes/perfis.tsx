import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { ROLES, ACCESS_MATRIX, type Role } from "@/lib/mock-roles";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/perfis")({
  head: () => ({
    meta: [
      { title: "Perfis — Omega Admin" },
      { name: "description", content: "Perfis de acesso do painel Omega." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfisPage,
});

const counts: Record<Role, number> = { admin: 2, gerente: 2, usuario: 2 };

function permissionsFor(role: Role): { total: string[]; leitura: string[]; negado: string[] } {
  const total: string[] = [];
  const leitura: string[] = [];
  const negado: string[] = [];
  for (const [path, map] of Object.entries(ACCESS_MATRIX)) {
    const lvl = map[role];
    if (lvl === "full") total.push(path);
    else if (lvl === "read") leitura.push(path);
    else negado.push(path);
  }
  return { total, leitura, negado };
}

function PerfisPage() {
  return (
    <AdminShell
      eyebrow="Usuários"
      title="Perfis de acesso"
      actions={
        <CadastroActions
          entity="Perfil"
          templateName="perfis-template.csv"
          templateColumns={["nome", "descricao", "permissoes"]}
        />
      }
    >
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        Três perfis padrão organizam o acesso ao painel. Ajuste a matriz completa em{" "}
        <Link to="/acessos" className="text-accent hover:text-foreground">
          Acessos
        </Link>
        .
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {ROLES.map((r) => {
          const perms = permissionsFor(r.value);
          return (
            <article key={r.value} className="border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center border border-accent/40 text-accent">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.25} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  {counts[r.value]} usuários
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl text-foreground">{r.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>

              <dl className="mt-6 space-y-3 text-[11px] uppercase tracking-[0.28em]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Acesso total</dt>
                  <dd className="text-foreground">{perms.total.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Somente leitura</dt>
                  <dd className="text-foreground">{perms.leitura.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Restrito</dt>
                  <dd className="text-foreground">{perms.negado.length}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
