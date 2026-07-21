import type { ReactNode } from "react";

export function DataTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-border bg-background">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {columns.map((c) => (
              <th key={c} className="px-6 py-4 font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    s.includes("ativo") || s.includes("recebido") || s.includes("publicado") || s.includes("ok")
      ? "text-emerald-700 bg-emerald-500/10 border-emerald-600/30"
      : s.includes("rascunho") || s.includes("pausado")
        ? "text-muted-foreground bg-muted border-border"
        : s.includes("crítico") || s.includes("ruptura") || s.includes("bloqueado")
          ? "text-red-700 bg-red-500/10 border-red-600/30"
          : "text-accent bg-accent/10 border-accent/40";
  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${tone}`}
    >
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-background p-6">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl text-foreground">{value}</p>
      {hint ? (
        <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-accent">{hint}</p>
      ) : null}
    </div>
  );
}
