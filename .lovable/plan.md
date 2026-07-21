# Plano — Módulos de Gerenciamento (Fornecedores e Loja)

Adicionar área administrativa com rotas dedicadas para cada tela, seguindo a identidade Omega (marinho/carvão/marfim, dourado, Cormorant + Inter). Dados 100% mockados (sem backend), coerente com o restante do projeto.

## Rotas novas (uma página = uma rota)

```
src/routes/
  admin.tsx                      -> layout admin (sidebar + Outlet)
  admin.index.tsx                -> /admin (visão geral simples)
  admin.fornecedores.tsx         -> /admin/fornecedores (Cadastro)
  admin.fornecedores.pedidos.tsx -> /admin/fornecedores/pedidos (Pedido de compra)
  admin.categorias.tsx           -> /admin/categorias
  admin.produtos.tsx             -> /admin/produtos
  admin.estoque.tsx              -> /admin/estoque
```

Acesso protegido pelo mock-auth existente (redireciona para `/login` se não autenticado), igual ao dashboard.

## Layout administrativo

`AdminShell` com:
- Sidebar esquerda com dois grupos: **Fornecedores** (Cadastro, Pedido) e **Loja** (Categorias, Produtos, Estoque).
- Topbar com título da tela, breadcrumb sutil e usuário.
- Conteúdo em card marfim sobre fundo carvão claro, detalhes em dourado.

## Padrão obrigatório em toda tela de cadastro

Cabeçalho da página com três botões, sempre na mesma ordem:
1. **Template** — baixa um modelo (mock: gera CSV vazio via Blob).
2. **Importar** — abre modal para upload (mock: apenas visual).
3. **Novo** — abre drawer/modal com formulário da entidade.

Componentizado em `src/components/admin/CadastroActions.tsx` para reuso nas 5 telas de cadastro (Fornecedores, Pedido, Categorias, Produtos, Estoque).

## Conteúdo de cada tela

### Fornecedores — Cadastro (`/admin/fornecedores`)
- Ações: Template · Importar · Novo Fornecedor.
- Tabela: Razão social, CNPJ, Contato, Cidade/UF, Categoria, Status.
- Filtros: busca + status. Linhas mock (Vitali Tecidos, Como Silks, Northampton Leather, etc.).

### Fornecedores — Pedido (`/admin/fornecedores/pedidos`)
- Ações: Template · Importar · Novo Pedido.
- Tabela: Nº do pedido, Fornecedor, Emissão, Previsão, Itens, Total, Status (Rascunho, Enviado, Recebido).
- Card lateral com resumo (Em aberto, Recebidos no mês).

### Loja — Categorias (`/admin/categorias`)
- Ações: Template · Importar · Nova Categoria.
- Lista hierárquica (Ternos → Marinho/Grafite; Camisaria; Calçados; Acessórios) com contagem de produtos.

### Loja — Produtos (`/admin/produtos`)
- Ações: Template · Importar · Novo Produto.
- Tabela: Imagem, SKU, Nome, Categoria, Preço, Estoque, Status. Reutiliza mock em `src/data/products.ts` acrescentando SKU/estoque.

### Loja — Estoque (`/admin/estoque`)
- Ações: Template · Importar · Nova Movimentação.
- Tabela: SKU, Produto, Depósito, Saldo, Reservado, Disponível, Última movimentação.
- Cards no topo: Total em peças, SKUs críticos, Rupturas.

## Design tokens
Reaproveita variáveis já em `src/styles.css` (marinho, dourado, marfim). Nenhum token novo; apenas classes utilitárias.

## SEO / head()
Cada rota com `head()` próprio (title/description) — ex.: "Fornecedores — Omega Suits Admin".

## Detalhes técnicos
- Layout `admin.tsx` usa `useEffect` + `isAuthenticated()` (mesmo padrão do `dashboard.tsx`) e renderiza `<Outlet />`.
- `CadastroActions` recebe props `onTemplate`, `onImport`, `onNew` e labels opcionais.
- Formulários "Novo …" usam `Sheet`/`Dialog` do shadcn (já disponível).
- Sem alteração no header público do site; a área admin não aparece no menu principal — acesso via `/admin` a partir do dashboard (adicionar link "Gerenciar loja" no dashboard).

## Fora do escopo
- Sem persistência real, sem CRUD funcional, sem validação server-side, sem paginação real. Estado local com `useState` apenas.
