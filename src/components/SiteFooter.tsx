import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl tracking-[0.15em] text-foreground">OMEGA</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-accent">
              Alfaiataria · 1962
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Alfaiataria clássica masculina, feita à mão em nosso ateliê há mais de seis
              décadas.
            </p>
          </div>
          <FooterColumn title="Coleção" items={[
            { label: "Ternos", to: "/ternos" },
            { label: "Camisaria", to: "/camisaria" },
            { label: "Calçados", to: "/calcados" },
            { label: "Acessórios", to: "/acessorios" },
          ]} />
          <FooterColumn title="Casa" items={[
            { label: "O Ateliê", to: "/" },
            { label: "Sob Medida", to: "/" },
            { label: "Agendar visita", to: "/" },
            { label: "Contato", to: "/" },
          ]} />
          <FooterColumn title="Cliente" items={[
            { label: "Entrar", to: "/login" },
            { label: "Minha conta", to: "/dashboard" },
            { label: "Pedidos", to: "/dashboard" },
            { label: "Trocas", to: "/" },
          ]} />
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Omega Suits. Todos os direitos reservados.</p>
          <p>Rua Barão de Itapetininga, 128 · São Paulo</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.35em] text-foreground">{title}</p>
      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="transition-colors hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
