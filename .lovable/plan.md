## Objetivo

Adicionar a área de Clientes, a seção de Gerenciamento de Usuários (Usuários, Perfis, Matriz de Acesso) e um controle de acesso mock por perfil aplicado às rotas do painel. Padronizar as telas de cadastro existentes conforme a base de conhecimento (Cormorant + Inter, marinho/carvão/marfim/dourado, botões Template · Importar · Novo).

## Novas rotas

```
src/routes/
  clientes.tsx                 -> /clientes            (cadastro)
  usuarios.tsx                 -> /usuarios            (cadastro de usuários)
  perfis.tsx                   -> /perfis              (Admin / Gerente / Usuário)
  acessos.tsx                  -> /acessos             (matriz perfil × rota)
```

Sidebar do `AdminShell` ganha um novo grupo **Usuários** (Usuários, Perfis, Acessos) e o grupo **Loja** recebe **Clientes**.

## Controle de acesso mock (por perfil)

- Novo módulo `src/lib/mock-roles.ts`: tipo `Role = 'admin' | 'gerente' | 'usuario'`, matriz padrão rota→perfis, helpers `getActiveRole()`, `setActiveRole()`, `canAccess(path)`, `useActiveRole()` (hook com evento custom para re-render).
- Seletor de perfil no header do `AdminShell` (dropdown discreto ao lado do link "Ir para a loja"), grava em `localStorage`.
- Wrapper `RoleGate` usado dentro do `AdminShell`: se `canAccess(pathname) === false`, renderiza tela "Acesso restrito" com o perfil atual e sugestão de troca — não redireciona (mantém navegação livre pela URL, apenas oculta conteúdo).
- Itens da sidebar que o perfil ativo não pode acessar aparecem com opacidade reduzida e badge "restrito".

### Matriz padrão

| Rota | Admin | Gerente | Usuário |
|---|---|---|---|
| /dashboard | ✓ | ✓ | ✓ |
| /fornecedores | ✓ | ✓ | — |
| /fornecedores/pedido | ✓ | ✓ | — |
| /categorias | ✓ | ✓ | — |
| /produtos | ✓ | ✓ | ✓ (leitura) |
| /estoque | ✓ | ✓ | ✓ (leitura) |
| /clientes | ✓ | ✓ | ✓ (leitura) |
| /usuarios | ✓ | — | — |
| /perfis | ✓ | — | — |
| /acessos | ✓ | — | — |

A "leitura" é indicada por badge na página e ocultando `CadastroActions`; o dado permanece o mesmo.

## Conteúdo das novas telas

**/clientes** — `AdminShell` + `CadastroActions` (Template · Importar · Novo) + `DataTable` com colunas: Cliente, Contato, Cidade/UF, Últimas compras, Status. Mock com ~6 clientes premium.

**/usuarios** — `CadastroActions` + tabela: Nome, E-mail, Perfil, Último acesso, Status. Inclui usuário de teste `teste@omegasuits.com` (perfil Administrador, senha mock exibida como `omega#2026`).

**/perfis** — cards dos três perfis (Administrador, Gerente, Usuário) com descrição, nº de usuários e lista de permissões-chave. `CadastroActions` reduzido (Template · Novo) para criar perfis extras (mock).

**/acessos** — matriz perfil × rota (checkboxes desabilitados na visualização mock) refletindo a matriz padrão. Legenda explicando "leitura" vs "total".

## Padronização das páginas existentes

Passagem pelas telas de cadastro (`/fornecedores`, `/fornecedores/pedido`, `/categorias`, `/produtos`, `/estoque`) confirmando:
- Uso de `AdminShell` com `eyebrow` + título Cormorant.
- `CadastroActions` com a ordem exata Template · Importar · Novo.
- `DataTable` com `StatusPill` para status.
- Nenhum uso de cores hardcoded — apenas tokens (`bg-charcoal`, `text-accent`, `text-muted-foreground`, etc.).
- Ajustes pontuais onde a ordem/estilo divergir.

## Arquivos criados / editados

Criados:
- `src/lib/mock-roles.ts`
- `src/components/admin/RoleSwitcher.tsx`
- `src/components/admin/RoleGate.tsx`
- `src/routes/clientes.tsx`
- `src/routes/usuarios.tsx`
- `src/routes/perfis.tsx`
- `src/routes/acessos.tsx`

Editados:
- `src/components/admin/AdminShell.tsx` (novo grupo Usuários, item Clientes, RoleSwitcher no header, RoleGate envolvendo `children`, badges "restrito" nos itens bloqueados).
- Telas de cadastro existentes: revisão de padronização (apenas ajustes cosméticos se necessário).
- `src/routes/dashboard.tsx`: adiciona atalhos para Clientes e Usuários no bloco de "Gerenciar loja".

## Fora do escopo

- Autenticação real / reativação de `/login` como gate.
- Persistência de usuários/perfis/matriz (tudo mock em memória + localStorage do perfil ativo).
- Fluxos CRUD reais nos modais de "Novo".
