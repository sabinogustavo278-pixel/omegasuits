import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { canAccess, roleLabel, useActiveRole } from "@/lib/mock-roles";

export function RoleGate({ path, children }: { path: string; children: ReactNode }) {
  const role = useActiveRole();
  if (canAccess(path, role)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl border border-border bg-background p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-accent/40 text-accent">
        <Lock className="h-6 w-6" strokeWidth={1.25} />
      </div>
      <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-accent">Acesso restrito</p>
      <h2 className="mt-3 font-serif text-3xl text-foreground">
        Esta área não está disponível para o seu perfil
      </h2>
      <p className="mt-4 text-sm text-muted-foreground">
        Perfil ativo: <span className="text-foreground">{roleLabel(role)}</span>. Altere o perfil
        no seletor do topo para visualizar este conteúdo.
      </p>
    </div>
  );
}
