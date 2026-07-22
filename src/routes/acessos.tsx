import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ACCESS_MATRIX, ROLES, type Access } from "@/lib/mock-roles";
import { Check, Minus, Eye } from "lucide-react";

export const Route = createFileRoute("/acessos")({
  head: () => ({
    meta: [
      { title: "Acessos — Omega Admin" },
      { name: "description", content: "Matriz de acesso por perfil e rota." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessosPage,
});

const routeLabels: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/fornecedores": "Fornecedores · Cadastro",
  "/fornecedores/pedido": "Fornecedores · Pedido",
  "/categorias": "Loja · Categorias",
  "/produtos": "Loja · Produtos",
  "/estoque": "Loja · Estoque",
  "/clientes": "Loja · Clientes",
  "/usuarios": "Usuários · Cadastro",
  "/perfis": "Usuários · Perfis",
  "/acessos": "Usuários · Acessos",
};

function AccessCell({ level }: { level: Access }) {
  if (level === "full")
    return (
      <span className="inline-flex items-center gap-2 text-emerald-700">
        <Check className="h-4 w-4" strokeWidth={2} /> Total
      </span>
    );
  if (level === "read")
    return (
      <span className="inline-flex items-center gap-2 text-accent">
        <Eye className="h-4 w-4" strokeWidth={1.5} /> Leitura
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Minus className="h-4 w-4" strokeWidth={1.5} /> Restrito
    </span>
  );
}

function AcessosPage() {
  const paths = Object.keys(ACCESS_MATRIX);
  return (
    <AdminShell eyebrow="Usuários" title="Matriz de acesso por perfil">
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Configuração padrão de permissões por rota. Rotas marcadas como{" "}
        <span className="text-accent">Leitura</span> ocultam ações de cadastro para o perfil.
      </p>

      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <th className="px-6 py-4 font-normal">Rota</th>
              {ROLES.map((r) => (
                <th key={r.value} className="px-6 py-4 font-normal">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paths.map((p) => (
              <tr key={p} className="hover:bg-secondary/40">
                <td className="px-6 py-4">
                  <div className="font-serif text-base text-foreground">
                    {routeLabels[p] ?? p}
                  </div>
                  <div className="text-xs text-muted-foreground">{p}</div>
                </td>
                {ROLES.map((r) => (
                  <td key={r.value} className="px-6 py-4 text-[11px] uppercase tracking-[0.22em]">
                    <AccessCell level={ACCESS_MATRIX[p][r.value]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="inline-flex items-center gap-2 text-emerald-700"><Check className="h-4 w-4" /> Total — cria, edita e remove</span>
        <span className="inline-flex items-center gap-2 text-accent"><Eye className="h-4 w-4" /> Leitura — apenas consulta</span>
        <span className="inline-flex items-center gap-2"><Minus className="h-4 w-4" /> Restrito — sem acesso</span>
      </div>
    </AdminShell>
  );
}
