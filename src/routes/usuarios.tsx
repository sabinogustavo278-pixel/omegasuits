import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { roleLabel } from "@/lib/mock-roles";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — Omega Admin" },
      { name: "description", content: "Gestão de usuários do painel Omega." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsuariosPage,
});

const rows = [
  { nome: "Usuário de Teste", email: "teste@omegasuits.com", role: "admin" as const, senha: "omega#2026", ultimo: "Agora", status: "Ativo" },
  { nome: "Beatriz Álvares",  email: "beatriz@omegasuits.com", role: "admin" as const, senha: "••••••••", ultimo: "Hoje · 09:12", status: "Ativo" },
  { nome: "Caio Mendonça",    email: "caio@omegasuits.com",    role: "gerente" as const, senha: "••••••••", ultimo: "Ontem · 18:47", status: "Ativo" },
  { nome: "Julia Reis",       email: "julia@omegasuits.com",   role: "gerente" as const, senha: "••••••••", ultimo: "20/07 · 14:03", status: "Ativo" },
  { nome: "Marcos Vinhas",    email: "marcos@omegasuits.com",  role: "usuario" as const, senha: "••••••••", ultimo: "18/07 · 11:20", status: "Ativo" },
  { nome: "Sofia Duarte",     email: "sofia@omegasuits.com",   role: "usuario" as const, senha: "••••••••", ultimo: "10/07 · 16:41", status: "Pausado" },
];

function UsuariosPage() {
  return (
    <AdminShell
      eyebrow="Usuários"
      title="Cadastro de usuários"
      actions={
        <CadastroActions
          entity="Usuário"
          templateName="usuarios-template.csv"
          templateColumns={["nome", "email", "perfil", "status"]}
        />
      }
    >
      <div className="mb-6 border border-accent/30 bg-accent/5 px-6 py-4 text-sm">
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Usuário de teste</p>
        <p className="mt-2 text-foreground">
          E-mail <span className="font-serif">teste@omegasuits.com</span> · senha{" "}
          <span className="font-serif">omega#2026</span> · perfil{" "}
          <span className="font-serif">Administrador</span>
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar por nome ou e-mail"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground">
          <option>Todos os perfis</option>
          <option>Administrador</option>
          <option>Gerente</option>
          <option>Usuário</option>
        </select>
      </div>

      <DataTable columns={["Nome", "E-mail", "Perfil", "Último acesso", "Status", ""]}>
        {rows.map((r) => (
          <tr key={r.email} className="hover:bg-secondary/40">
            <td className="px-6 py-4 font-serif text-base text-foreground">{r.nome}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.email}</td>
            <td className="px-6 py-4 text-muted-foreground">{roleLabel(r.role)}</td>
            <td className="px-6 py-4 text-muted-foreground">{r.ultimo}</td>
            <td className="px-6 py-4"><StatusPill status={r.status} /></td>
            <td className="px-6 py-4 text-right">
              <button className="text-[10px] uppercase tracking-[0.28em] text-accent hover:text-foreground">
                Editar
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </AdminShell>
  );
}
