import { Link } from "@tanstack/react-router";
import { User, LogIn, ShoppingBag } from "lucide-react";
import { useIsAuthenticated } from "@/lib/mock-auth";
import { useCart } from "@/lib/mock-cart";

const nav = [
  { to: "/ternos", label: "Ternos" },
  { to: "/camisaria", label: "Camisaria" },
  { to: "/calcados", label: "Calçados" },
  { to: "/acessorios", label: "Acessórios" },
] as const;

export function SiteHeader() {
  const authed = useIsAuthenticated();
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-5 md:px-10">
        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.28em] text-muted-foreground md:flex">
          {nav.slice(0, 2).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="col-start-2 flex flex-col items-center leading-none">
          <span className="font-serif text-2xl font-semibold tracking-[0.2em] text-foreground md:text-3xl">
            OMEGA
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.5em] text-accent">
            Suits · Est. 1962
          </span>
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-8 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <nav className="hidden items-center gap-8 md:flex">
            {nav.slice(2).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/checkout"
            aria-label="Sacola"
            className="relative inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.25} />
            {count > 0 ? (
              <span className="absolute -right-3 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-medium tracking-normal text-charcoal">
                {count}
              </span>
            ) : null}
          </Link>
          {authed ? (
            <>
              <Link
                to="/meus-pedidos"
                aria-label="Meus pedidos"
                className="hidden items-center gap-2 transition-colors hover:text-foreground sm:inline-flex"
              >
                <span>Meus pedidos</span>
              </Link>
              <Link
                to="/meu-perfil"
                aria-label="Meu perfil"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <User className="h-4 w-4" strokeWidth={1.25} />
                <span className="hidden sm:inline">Meu perfil</span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              aria-label="Entrar"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.25} />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
      <nav className="flex items-center justify-center gap-6 border-t border-border/40 px-6 py-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:hidden">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
