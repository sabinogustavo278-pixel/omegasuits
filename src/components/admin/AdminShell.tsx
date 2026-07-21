import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Truck, ClipboardList, LayoutGrid, Package, Warehouse, LayoutDashboard, Menu, X } from "lucide-react";
import { isAuthenticated, signOut } from "@/lib/mock-auth";

const groups = [
  {
    label: "Fornecedores",
    items: [
      { to: "/admin/fornecedores", label: "Cadastro", icon: Truck },
      { to: "/admin/fornecedores/pedidos", label: "Pedido", icon: ClipboardList },
    ],
  },
  {
    label: "Loja",
    items: [
      { to: "/admin/categorias", label: "Categorias", icon: LayoutGrid },
      { to: "/admin/produtos", label: "Produtos", icon: Package },
      { to: "/admin/estoque", label: "Estoque", icon: Warehouse },
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
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: "/login", replace: true });
    else setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-secondary/40 text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border bg-charcoal text-primary-foreground transition-transform md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-8">
          <Link to="/admin" className="flex flex-col leading-none">
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

        <nav className="mt-4 px-4">
          <Link
            to="/admin"
            className={`mb-6 flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition-colors ${
              pathname === "/admin"
                ? "border-l-2 border-accent bg-white/5 text-accent"
                : "border-l-2 border-transparent text-primary-foreground/70 hover:text-primary-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.25} />
            Visão geral
          </Link>

          {groups.map((group) => (
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
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 px-8 py-6">
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/", replace: true });
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary-foreground/60 hover:text-accent"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.25} />
            Sair
          </button>
        </div>
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
          <Link
            to="/dashboard"
            className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground md:inline"
          >
            ← Minha conta
          </Link>
        </header>

        <main className="flex-1 px-6 py-10 md:px-10">
          {actions ? <div className="mb-8">{actions}</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
