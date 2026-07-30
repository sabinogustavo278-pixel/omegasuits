import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Truck,
  ClipboardList,
  LayoutGrid,
  Package,
  Warehouse,
  LayoutDashboard,
  Menu,
  X,
  Users,
  UserCog,
  ShieldCheck,
  KeyRound,
  Building2,
  UserRound,
} from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { RoleGate } from "./RoleGate";
import { canAccess, useActiveRole } from "@/lib/mock-roles";
import { useAvatar } from "@/lib/mock-account";
import { UserCircle2 } from "lucide-react";

const groups = [
  {
    label: "Fornecedores",
    items: [
      { to: "/fornecedores", label: "Cadastro", icon: Truck },
      { to: "/fornecedores/pedido", label: "Pedido", icon: ClipboardList },
    ],
  },
  {
    label: "Loja",
    items: [
      { to: "/categorias", label: "Categorias", icon: LayoutGrid },
      { to: "/produtos", label: "Produtos", icon: Package },
      { to: "/estoque", label: "Estoque", icon: Warehouse },
      { to: "/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Usuários",
    items: [
      { to: "/usuarios", label: "Usuários", icon: UserCog },
      { to: "/perfis", label: "Perfis", icon: ShieldCheck },
      { to: "/acessos", label: "Acessos", icon: KeyRound },
    ],
  },
  {
    label: "Configurações",
    items: [
      { to: "/empresa", label: "Dados da empresa", icon: Building2 },
      { to: "/meu-perfil", label: "Meu perfil", icon: UserRound },
    ],
  },
] as const;

export function AdminShell({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useActiveRole();
  const avatar = useAvatar();

  return (
    <div className="flex min-h-screen bg-secondary/40 text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border bg-charcoal text-primary-foreground transition-transform md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-8">
          <Link to="/dashboard" className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-[0.2em]">OMEGA</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.5em] text-accent">
              Admin · Ateliê
            </span>
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 px-4 pb-10">
          <Link
            to="/dashboard"
            className={`mb-6 flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition-colors ${
              pathname === "/dashboard"
                ? "border-l-2 border-accent bg-white/5 text-accent"
                : "border-l-2 border-transparent text-primary-foreground/70 hover:text-primary-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.25} />
            Visão geral
          </Link>

          {groups
            .map((group) => ({
              ...group,
              items: group.items.filter((it) => canAccess(it.to, role)),
            }))
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label} className="mb-8">
                <p className="px-4 text-[10px] uppercase tracking-[0.4em] text-accent">
                  {group.label}
                </p>
                <ul className="mt-3 space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-colors ${
                            active
                              ? "border-accent bg-white/5 text-accent"
                              : "border-transparent text-primary-foreground/75 hover:border-primary-foreground/40 hover:text-primary-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.25} />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-4 backdrop-blur md:px-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div>
              {eyebrow ? (
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="font-serif text-2xl text-foreground md:text-3xl">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <Link
              to="/conta"
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              aria-label="Minha conta"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <UserCircle2 className="h-5 w-5" strokeWidth={1.25} />
              )}
              <span className="hidden sm:inline">Minha conta</span>
            </Link>
            <Link
              to="/"
              className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground md:inline"
            >
              ← Ir para a loja
            </Link>
          </div>
        </header>

        <main className="flex-1 px-6 py-10 md:px-10">
          <RoleGate path={pathname}>
            {actions ? <div className="mb-8">{actions}</div> : null}
            {children}
          </RoleGate>
        </main>
      </div>
    </div>
  );
}
