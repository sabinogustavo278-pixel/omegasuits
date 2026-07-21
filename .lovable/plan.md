## Correções na área de gerenciamento

Remover auth guard e reorganizar as rotas para o nível raiz, sem prefixo `/admin`.

### Novas rotas (nível raiz)

```
src/routes/
  dashboard.tsx              -> /dashboard       (já existe, será ajustado)
  fornecedores.tsx           -> /fornecedores    (cadastro)
  fornecedores.pedido.tsx    -> /fornecedores/pedido
  categorias.tsx             -> /categorias
  produtos.tsx               -> /produtos
  estoque.tsx                -> /estoque
```

Observação: o plano anterior mencionava só `/fornecedores`, `/fornecedores/pedido`, `/categorias` e `/produtos`. Mantenho `/estoque` porque a tela já existe e faz parte do grupo Loja — se preferir remover também, é só sinalizar.

### Arquivos a excluir

- `src/routes/admin.tsx`
- `src/routes/admin.index.tsx`
- `src/routes/admin.fornecedores.tsx`
- `src/routes/admin.fornecedores.pedidos.tsx`
- `src/routes/admin.categorias.tsx`
- `src/routes/admin.produtos.tsx`
- `src/routes/admin.estoque.tsx`

### Ajustes de código

1. **`AdminShell.tsx`**
   - Remover `useEffect` + `isAuthenticated()` + redirect para `/login`. Sem auth guard.
   - Remover botão "Sair" (ou transformar em link para `/`, sem `signOut`).
   - Atualizar `groups` para novos caminhos: `/fornecedores`, `/fornecedores/pedido`, `/categorias`, `/produtos`, `/estoque`.
   - Link do logo passa a apontar para `/dashboard` (nova "visão geral").

2. **`dashboard.tsx`**
   - Remover `useEffect` + `isAuthenticated()` — acesso direto pela URL.
   - Remover botão "Sair".
   - Renderizar via `AdminShell` para virar a "visão geral" do painel (atalhos + KPIs que estavam em `admin.index.tsx`), preservando o conteúdo atual de "Minha conta" abaixo — ou substituir totalmente pela visão geral. **Decisão adotada**: transformar `/dashboard` na visão geral do painel (padrão das outras telas admin, com sidebar). O conteúdo antigo "Minha conta / Pedidos recentes / Wishlist" sai. Se preferir manter o conteúdo de conta, sinalize.

3. **Novas rotas raiz** (`fornecedores.tsx`, `fornecedores.pedido.tsx`, `categorias.tsx`, `produtos.tsx`, `estoque.tsx`)
   - Mesmo conteúdo das versões `admin.*` atuais, apenas com `createFileRoute` apontando para o novo path.

4. **`CadastroActions`, `DataTable`**: sem alterações.

5. **Links internos**: atualizar qualquer `to="/admin/..."` (em `admin.index.tsx` → agora `dashboard.tsx`, e no header do `AdminShell`) para as novas URLs.

### Fora de escopo

- Não altero `/login` nem `mock-auth.ts` (ficam intocados, apenas não são mais usados como gate).
- Não altero as rotas públicas do site (`/`, `/ternos`, etc.).