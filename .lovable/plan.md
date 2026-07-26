## Correções de navegação e autenticação

### 1. Botão "Entrar" no cabeçalho da loja
Em `src/components/SiteHeader.tsx`, substituir o link "Conta" por um comportamento condicional:
- Se não autenticado (`isAuthenticated()` de `mock-auth`): mostrar link **"Entrar"** → `/login`.
- Se autenticado: manter o ícone/link "Conta" → `/conta`.
- Usar hook local com `useEffect` + listener de `storage` para reagir a login/logout (mesmo padrão de `useActiveRole`).

### 2. Proteger a rota `/conta`
Em `src/routes/conta.tsx`, adicionar `beforeLoad` que verifica `isAuthenticated()` e, se falso, faz `throw redirect({ to: "/login" })`. Como `isAuthenticated` lê `localStorage`, o guard só roda no cliente (rota já é client-side no template atual); adicionar guard também dentro do componente como fallback de SSR (retornar `null` + `navigate` em `useEffect`).

### 3. Redirecionamento por perfil após login
Em `src/routes/login.tsx`, no `handleSubmit`:
- Chamar `signIn()`.
- Ler `getActiveRole()` de `mock-roles`.
- Se `usuario` → `navigate({ to: "/" })`.
- Se `admin` ou `gerente` → `navigate({ to: "/dashboard" })`.

### Notas técnicas
- Nenhuma mudança em backend, dados ou outras rotas.
- `mock-auth.ts` e `mock-roles.ts` já expõem tudo o que é necessário; não precisam ser alterados.
- O `AdminShell` continua acessível sem login (escopo atual mantido); apenas `/conta` passa a exigir sessão.