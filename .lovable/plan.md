## Objetivo

Substituir os dados mockados das telas de gestão por dados reais do Supabase (11 tabelas) e ligar o upload de imagens aos 4 buckets públicos (`fornecedores`, `produtos`, `categorias`, `clientes`).

## Camada de dados

- Criar `src/lib/crud.functions.ts` com server functions genéricas protegidas (`requireSupabaseAuth`) para listar, criar, atualizar e excluir registros (incluindo exclusão em lote), respeitando as policies Admin/Gerente já existentes.
- Criar `src/lib/queries.ts` com `queryOptions` por entidade (categorias, produtos, estoque, movimentações, fornecedores, pedidos de compra + itens, pedidos de venda + itens, clientes, imagens de produto) e invalidações após cada mutação.
- Rotas administrativas continuam públicas (sem auth guard, como definido antes); a leitura usa o cliente do browser e as gravações passam pelas server functions autenticadas — quem não estiver logado vê a lista mas recebe aviso ao gravar.

## Upload de imagens

- Novo `src/lib/storage.ts`: comprime a imagem (reaproveitando `image-processing.ts`), envia ao bucket correspondente e devolve a URL pública para gravar em `imagem_url`.
- Suporte a múltiplas imagens em Produtos, gravando as extras em `produtos_imagens` (com ordem).

## Telas (padrão único, aplicado a todas as páginas de cadastro)

Fornecedores, Fornecedores/Pedido, Categorias, Produtos, Estoque, Clientes:

- Lista real vinda do banco, com estados de carregando/vazio/erro.
- Thumbnail da imagem em cada linha.
- Ordenação por cabeçalho (mantida), filtros de busca e status.
- Ações por linha: **Editar** (modal preenchido) e **Excluir** (com confirmação).
- Checkbox por linha + seleção múltipla para exclusão em lote.
- Botões **Template** (CSV **e XLSX**, colunas reais da tabela), **Importar** (lê CSV/XLSX e insere de verdade, com resumo de sucesso/erro) e **Novo** (grava no banco + upload de imagem).

## Componentes

- `CadastroActions`: passa a receber colunas/handlers reais de gravação e importação; template ganha exportação XLSX (biblioteca `xlsx`).
- `DataTable`: ganha coluna de seleção, barra de ações em massa e slot de ações por linha.
- `Dashboard`: métricas calculadas a partir de contagens reais (produtos, clientes, pedidos, estoque crítico).
- Vitrine da loja (`/`, `/ternos`, `/camisaria`, `/calcados`, `/acessorios`) passa a ler `produtos` publicados do banco, com fallback para as imagens locais quando o produto não tiver imagem.

## Detalhes técnicos

- Server functions em `src/lib/*.functions.ts` (nunca em `src/server/`), lendo `process.env` dentro do handler.
- Cache via TanStack Query; loaders usam `ensureQueryData` onde a rota já tiver loader.
- Nenhuma alteração de schema é necessária — as tabelas, FKs, RLS e buckets já existem.

## Fora de escopo

- Checkout gravando pedidos reais (segue mockado até você pedir).
- Relatórios e movimentação automática de estoque por pedido.
