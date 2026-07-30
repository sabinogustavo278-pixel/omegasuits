import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/CrudManager";
import { StatusPill } from "@/components/admin/DataTable";

export const Route = createFileRoute("/fornecedores")({
  head: () => ({
    meta: [
      { title: "Fornecedores — Omega Admin" },
      { name: "description", content: "Cadastro de fornecedores Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FornecedoresPage,
});

function FornecedoresPage() {
  return (
    <AdminShell eyebrow="Fornecedores" title="Cadastro de fornecedores">
      <CrudManager
        entity="Fornecedor"
        table="fornecedores"
        rpc="list_fornecedores"
        bucket="fornecedores"
        imageKey="imagem_url"
        multiImage
        searchPlaceholder="Buscar por razão social, CNPJ ou contato"
        searchKeys={["razao_social", "nome_fantasia", "cnpj", "contato_nome", "email"]}
        statusKey="status"
        statusOptions={[
          { value: "ativo", label: "Ativo" },
          { value: "pausado", label: "Pausado" },
          { value: "inativo", label: "Inativo" },
        ]}
        defaultSort={{ key: "razao_social", dir: "asc" }}
        templateBase="fornecedores-template"
        importKey="cnpj"
        templateColumns={[
          "razao_social",
          "nome_fantasia",
          "cnpj",
          "inscricao_estadual",
          "email",
          "telefone",
          "contato_nome",
          "endereco",
          "cidade",
          "estado",
          "cep",
          "categoria",
          "status",
        ]}
        columns={[
          {
            key: "razao_social",
            label: "Razão social",
            render: (r) => (
              <div>
                <p className="font-serif text-base text-foreground">{r.razao_social}</p>
                {r.nome_fantasia ? <p className="text-xs">{r.nome_fantasia}</p> : null}
              </div>
            ),
          },
          { key: "cnpj", label: "CNPJ" },
          { key: "contato_nome", label: "Contato" },
          {
            key: "cidade",
            label: "Cidade/UF",
            render: (r) => [r.cidade, r.estado].filter(Boolean).join(" · ") || "—",
          },
          { key: "categoria", label: "Categoria" },
          { key: "status", label: "Status", render: (r) => <StatusPill status={String(r.status)} /> },
        ]}
        fields={[
          { name: "razao_social", label: "Razão social", required: true },
          { name: "nome_fantasia", label: "Nome fantasia" },
          { name: "cnpj", label: "CNPJ", required: true },
          { name: "inscricao_estadual", label: "Inscrição estadual" },
          { name: "email", label: "E-mail", type: "email" },
          { name: "telefone", label: "Telefone", type: "tel" },
          { name: "contato_nome", label: "Contato" },
          { name: "endereco", label: "Endereço" },
          { name: "cidade", label: "Cidade" },
          { name: "estado", label: "UF" },
          { name: "cep", label: "CEP" },
          { name: "categoria", label: "Categoria" },
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
