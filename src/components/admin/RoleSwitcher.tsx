import { ShieldCheck } from "lucide-react";
import { ROLES, setActiveRole, useActiveRole, type Role } from "@/lib/mock-roles";

export function RoleSwitcher() {
  const role = useActiveRole();
  return (
    <label className="hidden items-center gap-2 border border-border bg-background px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:inline-flex">
      <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.25} />
      <span>Perfil</span>
      <select
        value={role}
        onChange={(e) => setActiveRole(e.target.value as Role)}
        className="border-0 bg-transparent text-[11px] uppercase tracking-[0.28em] text-foreground outline-none"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
