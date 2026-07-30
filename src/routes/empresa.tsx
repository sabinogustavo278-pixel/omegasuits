import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Dados da empresa — Omega Admin" },
      { name: "description", content: "Dados cadastrais da Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmpresaPage,
});

const inputCls =
  "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground";

function EmpresaPage() {
  const [values, setValues] = useState({
    nome: "Omega Suits Alfaiataria Ltda.",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 4000-1962",
    endereco: "Rua Haddock Lobo, 1620 — Jardins, São Paulo/SP",
  });
  const [saved, setSaved] = useState(false);

  const field = (
    name: keyof typeof values,
    label: string,
    span = false,
    type = "text",
  ) => (
    <div className={span ? "md:col-span-2" : undefined}>
      <label
        htmlFor={`e-${name}`}
        className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={`e-${name}`}
        type={type}
        className={inputCls}
        value={values[name]}
        onChange={(e) => {
          setSaved(false);
          setValues((p) => ({ ...p, [name]: e.target.value }));
        }}
      />
    </div>
  );

  return (
    <AdminShell eyebrow="Configurações" title="Dados da empresa">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="max-w-3xl border border-border bg-background p-8"
      >
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-14 w-14 items-center justify-center border border-border bg-secondary/60 text-accent">
            <Building2 className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Identificação</p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">Cadastro da matriz</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {field("nome", "Nome da empresa", true)}
          {field("cnpj", "CNPJ")}
          {field("telefone", "Telefone", false, "tel")}
          {field("endereco", "Endereço", true)}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Tela visual de interface — os dados não são persistidos no banco nesta versão.
        </p>

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-border pt-5">
          {saved ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" strokeWidth={2} />
              Dados conferidos
            </span>
          ) : null}
          <button
            type="submit"
            className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Salvar
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
