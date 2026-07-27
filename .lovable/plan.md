## Objetivo
Trocar o mock de login por Supabase Auth real e criar apenas as tabelas de autenticação/permissão: `profiles`, `user_roles` e `route_permissions`.

## 1. Migração SQL (uma única migration)

**Enum de perfis**
- `app_role`: `admin`, `gerente`, `usuario`.

**`public.profiles`** (dados do usuário logado)
- `id uuid PK` referenciando `auth.users(id) ON DELETE CASCADE`
- `nome text`, `email text`, `telefone text`, `avatar_url text`, `status text default 'ativo'`, `ultimo_acesso timestamptz`
- `created_at`, `updated_at` + trigger de updated_at
- Trigger `on_auth_user_created` → cria linha em `profiles` e em `user_roles` (default `usuario`) a partir dos metadados do signup.

**`public.user_roles`** (roles separadas do profile — obrigatório por segurança)
- `id uuid PK`, `user_id uuid → auth.users`, `role app_role`, unique(user_id, role).
- Função `has_role(_user_id uuid, _role app_role) returns boolean security definer`.

**`public.route_permissions`** (matriz perfil × rota)
- `id uuid PK`, `role app_role`, `rota text`, `permissao text check in ('total','leitura','negado')`, unique(role, rota).
- Seed com a matriz atual do `mock-roles.ts` (dashboard, fornecedores, produtos, clientes, usuários, perfis, acessos, estoque, categorias, conta).

**GRANTs + RLS** (segue o padrão da base de conhecimento):
- `profiles`: usuário lê/atualiza o próprio; admin lê/atualiza todos (via `has_role`).
- `user_roles`: usuário lê as próprias; só admin insere/atualiza/remove.
- `route_permissions`: leitura para `authenticated`; escrita só admin.

## 2. Frontend — Login real

**Client Supabase**: já existe (`@/integrations/supabase/client`).

**Substituir `src/lib/mock-auth.ts`** por hooks baseados em Supabase:
- `useSession()` — assina `onAuthStateChange` e expõe `user`, `loading`.
- `useIsAuthenticated()` — mantém a mesma API para não quebrar `SiteHeader`.
- `useCurrentRole()` — busca role via `user_roles` (query cached).
- `signOut()` — `supabase.auth.signOut()`.

**`src/routes/login.tsx`**
- Formulário passa a chamar `supabase.auth.signInWithPassword({ email, password })`.
- Adicionar aba/link "Criar conta" com `supabase.auth.signUp` (nome + email + senha; salva `nome` em `options.data` para o trigger popular `profiles`).
- Após login, lê role do usuário e redireciona: `admin`/`gerente` → `/dashboard`, `usuario` → `/`.
- Exibe erros do Supabase.

**`src/routes/__root.tsx`**
- Registrar um único `onAuthStateChange` no efeito raiz que invalida o router em `SIGNED_IN`/`SIGNED_OUT`/`USER_UPDATED`.

**`src/routes/conta.tsx`**
- Trocar guard `beforeLoad` mockado por checagem de sessão via `supabase.auth.getUser()` no client (usando `useEffect` + redirect), mantendo comportamento atual.
- Alteração de senha passa a chamar `supabase.auth.updateUser({ password })`.

**`src/lib/mock-roles.ts`**
- Manter arquivo, mas `getActiveRole()`/`useActiveRole()` passam a ler do Supabase (`user_roles`) com fallback `usuario` para deslogados. `RoleSwitcher` fica oculto (ou removido do header) — a role real vem do banco. Ainda usado internamente pelo `RoleGate` e `AdminShell`.
- `canAccess()` continua consultando a matriz local; **não** trocamos para consultar `route_permissions` agora (fora do escopo — só criamos a tabela).

## 3. Fora de escopo (próximas etapas)
- Ler `route_permissions` dinamicamente no frontend.
- Demais tabelas de negócio (clientes, produtos, fornecedores, estoque, pedidos).
- Upload de avatar para bucket.

## 4. Verificação
- `bun run build` ok.
- Fluxo manual: signup → aparece em `profiles` e `user_roles`; login redireciona conforme role; `/conta` redireciona quando deslogado; logout limpa sessão.

## Detalhes técnicos
- Usar `emailRedirectTo: window.location.origin` no `signUp`.
- Confirmação de email do Supabase: assumir **desativada** (padrão do dev) para o usuário de teste funcionar direto. Se estiver ativa, o signup exige confirmação por email.
- Não usar `service_role` no frontend. Trigger `handle_new_user` roda como `security definer`.
- Após a migration, o arquivo `src/integrations/supabase/types.ts` é regenerado automaticamente — só então os hooks tipados de `profiles`/`user_roles` funcionam.