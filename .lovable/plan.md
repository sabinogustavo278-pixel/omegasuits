## Objetivo

Inverter a semântica do banco conforme o padrão do curso:
- `profiles` passa a ser o **catálogo de cargos** (Administrador, Gerente, Usuário).
- `user_profiles` passa a ser a **tabela de dados dos usuários**, ligada a um cargo via `profile_id`.
- `route_permissions` referencia o cargo via `profile_id`.

## 1. Migração SQL (uma única migration)

### Preparação
- Dropar policies que dependem de `has_role` / `app_role` em todas as tabelas atuais.
- Dropar trigger `on_auth_user_created` e função `handle_new_user` (serão recriados).
- Dropar tabelas `user_roles` e `route_permissions` (reconstruídas com nova FK).
- Dropar função `has_role(uuid, app_role)`.
- Renomear tabela atual `profiles` → `user_profiles_old` (backup temporário dos dados de usuário existentes) e depois dropar após migrar linhas.

### Nova `public.profiles` (catálogo de cargos)
Colunas:
- `id uuid PK default gen_random_uuid()`
- `name text not null unique`
- `description text`
- `created_at`, `updated_at` + trigger de updated_at

Seed dos 3 cargos:
- Administrador — "Acesso total ao sistema, gerenciamento completo."
- Gerente — "Acesso a relatórios, produtos, estoque e fornecedores."
- Usuário — "Acesso básico para consultas e operações."

### Nova `public.user_profiles` (dados dos usuários)
Colunas:
- `id uuid PK` referenciando `auth.users(id) ON DELETE CASCADE`
- `name text`
- `email text`
- `avatar_url text`
- `telefone text`, `status text default 'ativo'`, `ultimo_acesso timestamptz` (mantém campos usados hoje pelas telas)
- `profile_id uuid not null references public.profiles(id) ON DELETE RESTRICT`
- `created_at`, `updated_at` + trigger

Migração de dados: copiar linhas de `user_profiles_old` para a nova `user_profiles`, atribuindo `profile_id` do cargo "Usuário" como default (não há como recuperar roles individuais sem consultar `user_roles`; se houver linhas em `user_roles`, mapear pelo nome do role para o novo `profile_id`).

### Nova `public.route_permissions`
Colunas:
- `id uuid PK`
- `profile_id uuid not null references public.profiles(id) ON DELETE CASCADE`
- `rota text not null`
- `permissao text not null check in ('total','leitura','negado')`
- `unique(profile_id, rota)`
- `created_at`, `updated_at`

Reseed da matriz atual (dashboard, fornecedores, produtos, clientes, usuários, perfis, acessos, estoque, categorias) usando os UUIDs dos 3 cargos.

### Segurança
- Nova função `has_profile(_user_id uuid, _profile_name text) returns boolean security definer` que faz join `user_profiles → profiles.name`.
- Revogar `EXECUTE` de `public` e `anon`; conceder apenas a `authenticated`.
- GRANTs em cada tabela nova (SELECT/INSERT/UPDATE/DELETE para `authenticated`, ALL para `service_role`; `anon` apenas em `profiles` se necessário para tela de cadastro).
- RLS:
  - `profiles`: leitura para `authenticated`; escrita só admin (via `has_profile(auth.uid(), 'Administrador')`).
  - `user_profiles`: usuário lê/atualiza o próprio; admin lê/atualiza todos.
  - `route_permissions`: leitura para `authenticated`; escrita só admin.

### Novo trigger `handle_new_user`
No signup, insere em `user_profiles` com `profile_id` = id do cargo "Usuário" (lookup por nome). Nome e email vêm de `raw_user_meta_data`.

### Drop do enum
Remover `app_role` ao final (não há mais dependências).

## 2. Frontend — ajustes necessários

Após a migração, `src/integrations/supabase/types.ts` será regenerado e várias telas quebram. Ajustes:

- **`src/lib/mock-roles.ts`**: manter tipo `Role` como string (`"admin" | "gerente" | "usuario"`) mapeando para os nomes de cargo no banco (`Administrador`, `Gerente`, `Usuário`). Matriz local `ACCESS_MATRIX` continua sendo a fonte usada por `RoleGate`.
- **`src/lib/user-role.ts`**: substituir consulta em `user_roles` por join `user_profiles → profiles.name`, e mapear nome → `Role`.
- **`src/routes/login.tsx`**: `signUp` continua igual; o trigger cuida do vínculo com o cargo padrão.
- **`src/routes/conta.tsx`**: substituir referências a `profiles.nome/email` por `user_profiles.name/email`.
- **`src/routes/usuarios.tsx`**: se buscar usuários do banco, usar `user_profiles` com join em `profiles`.
- **`src/routes/perfis.tsx`** e **`src/routes/acessos.tsx`**: podem continuar usando a matriz local (fora do escopo trocar para leitura dinâmica).

Nada mais no frontend precisa mudar — `RoleGate`, `AdminShell`, `SiteHeader` só dependem do hook `useCurrentRole`.

## 3. Fora de escopo
- Ler `route_permissions` dinamicamente no frontend.
- Tela para gerenciar CRUD de cargos em `/perfis` a partir da tabela `profiles`.
- Demais tabelas de negócio (clientes, produtos, etc).

## 4. Verificação
- Migration aplica sem erro; linter Supabase sem novos alertas.
- `bun run build` ok após regeneração de `types.ts`.
- Fluxo manual: signup cria linha em `user_profiles` com `profile_id` do cargo "Usuário"; login redireciona conforme o cargo; `/conta` mostra nome/email vindos de `user_profiles`.

## Detalhes técnicos

```text
profiles (cargos)
  id ─────────────┐
  name (unique)   │
  description     │
                  │
user_profiles     │
  id → auth.users │
  name, email,    │
  avatar_url,     │
  profile_id ─────┤
                  │
route_permissions │
  profile_id ─────┘
  rota
  permissao
```

- FK `user_profiles.profile_id` com `ON DELETE RESTRICT` (não permite apagar cargo em uso).
- FK `route_permissions.profile_id` com `ON DELETE CASCADE` (apagar cargo remove suas permissões).
- Toda migração roda como um único bloco transacional para evitar estado intermediário quebrado.
