import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CadastroActions } from "@/components/admin/CadastroActions";
import { DataTable, StatusPill } from "@/components/admin/DataTable";
import { useTableSort } from "@/hooks/use-table-sort";
import { roleLabel, type Role } from "@/lib/mock-roles";

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

interface Row {
  nome: string;
  email: string;
  role: Role;
  perfil: string;
  senha: string;
  ultimo: string;
  status: string;
}

const rows: Row[] = [
  { nome: "Usuário de Teste", email: "teste@omegasuits.com", role: "admin",   perfil: "Administrador", senha: "omega#2026", ultimo: "Agora",           status: "Ativo" },
  { nome: "Gustavo",           email: "gustavo@omegasuits.com", role: "usuario", perfil: "Usuário",      senha: "278",         ultimo: "Agora",           status: "Ativo" },
  { nome: "Beatriz Álvares",   email: "beatriz@omegasuits.com", role: "admin",   perfil: "Administrador", senha: "••••••••",    ultimo: "Hoje · 09:12",    status: "Ativo" },
  { nome: "Caio Mendonça",     email: "caio@omegasuits.com",    role: "gerente", perfil: "Gerente",      senha: "••••••••",    ultimo: "Ontem · 18:47",   status: "Ativo" },
  { nome: "Julia Reis",        email: "julia@omegasuits.com",   role: "gerente", perfil: "Gerente",      senha: "••••••••",    ultimo: "20/07 · 14:03",   status: "Ativo" },
  { nome: "Marcos Vinhas",     email: "marcos@omegasuits.com",  role: "usuario", perfil: "Usuário",      senha: "••••••••",    ultimo: "18/07 · 11:20",   status: "Ativo" },
  { nome: "Sofia Duarte",      email: "sofia@omegasuits.com",   role: "usuario", perfil: "Usuário",      senha: "••••••••",    ultimo: "10/07 · 16:41",   status: "Pausado" },
];

function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [perfil, setPerfil] = useState<"todos" | Role>("todos");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (perfil !== "todos" && r.role !== perfil) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.nome.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, perfil]);

  const { rows: visible, sort, toggle } = useTableSort(filtered, { key: "nome", dir: "asc" });

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
        <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Usuários de teste</p>
        <ul className="mt-3 space-y-1 text-foreground">
          <li>
            <span className="font-serif">teste@omegasuits.com</span> · senha{" "}
            <span className="font-serif">omega#2026</span> · perfil{" "}
            <span className="font-serif">Administrador</span>
          </li>
          <li>
            <span className="font-serif">gustavo@omegasuits.com</span> · senha{" "}
            <span className="font-serif">278</span> · perfil{" "}
            <span className="font-serif">Usuário</span>
          </li>
        </ul>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground md:w-96"
        />
        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as "todos" | Role)}
          className="border border-border bg-background px-4 py-3 text-sm text-muted-foreground outline-none focus:border-foreground"
        >
          <option value="todos">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="gerente">Gerente</option>
          <option value="usuario">Usuário</option>
        </select>
      </div>

      <DataTable
        sort={sort}
        onSort={toggle}
        columns={[
          { label: "Nome", sortKey: "nome" },
          { label: "E-mail", sortKey: "email" },
          { label: "Perfil", sortKey: "perfil" },
          { label: "Último acesso", sortKey: "ultimo" },
          { label: "Status", sortKey: "status" },
          "",
        ]}
      >
        {visible.map((r) => (
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
