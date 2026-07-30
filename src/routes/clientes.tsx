import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/CrudManager";
import { StatusPill } from "@/components/admin/DataTable";
import { isReadOnly, useActiveRole } from "@/lib/mock-roles";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Omega Admin" },
      { name: "description", content: "Cadastro de clientes Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

const brl = (v: unknown) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

function ClientesPage() {
  const role = useActiveRole();
  const readOnly = isReadOnly("/clientes", role);

  return (
    <AdminShell eyebrow="Loja" title="Cadastro de clientes">
      <CrudManager
        entity="Cliente"
        table="clientes"
        rpc="list_clientes"
        bucket="clientes"
        imageKey="imagem_url"
        multiImage
        readOnly={readOnly}
        searchPlaceholder="Buscar por nome, e-mail ou telefone"
        searchKeys={["nome", "email", "telefone", "cpf"]}
        statusKey="status"
        statusOptions={[
          { value: "ativo", label: "Ativo" },
          { value: "pausado", label: "Pausado" },
          { value: "inativo", label: "Inativo" },
        ]}
        defaultSort={{ key: "nome", dir: "asc" }}
        templateBase="clientes-template"
        importKey="email"
        numericColumns={["total_pedidos", "valor_total_gasto"]}
        templateColumns={[
          "nome",
          "cpf",
          "email",
          "telefone",
          "data_nascimento",
          "endereco",
          "cidade",
          "estado",
          "cep",
          "status",
          "observacoes",
        ]}
        columns={[
          { key: "nome", label: "Cliente", render: (r) => <span className="font-serif text-base text-foreground">{r.nome}</span> },
          {
            key: "email",
            label: "Contato",
            render: (r) => (
              <div>
                <div>{r.email ?? "—"}</div>
                <div className="text-xs">{r.telefone ?? ""}</div>
              </div>
            ),
          },
          { key: "cidade", label: "Cidade/UF", render: (r) => [r.cidade, r.estado].filter(Boolean).join(" · ") || "—" },
          { key: "total_pedidos", label: "Pedidos" },
          { key: "valor_total_gasto", label: "Total investido", render: (r) => brl(r.valor_total_gasto) },
          { key: "status", label: "Status", render: (r) => <StatusPill status={String(r.status)} /> },
        ]}
        fields={[
          { name: "nome", label: "Nome", required: true },
          { name: "cpf", label: "CPF" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "telefone", label: "Telefone", type: "tel" },
          { name: "data_nascimento", label: "Nascimento", type: "date" },
          { name: "endereco", label: "Endereço" },
          { name: "cidade", label: "Cidade" },
          { name: "estado", label: "UF" },
          { name: "cep", label: "CEP" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "ativo", label: "Ativo" },
              { value: "pausado", label: "Pausado" },
              { value: "inativo", label: "Inativo" },
            ],
          },
          { name: "observacoes", label: "Observações", type: "textarea" },
        ]}
      />
    </AdminShell>
  );
}
