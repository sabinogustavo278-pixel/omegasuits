## Descritivo de campos por tela (para modelagem do banco)

Abaixo estão os campos de cada tela de cadastro/gestão do sistema, para criar as tabelas no Supabase. Autenticação (profiles/user_profiles/route_permissions) já está no banco — este documento cobre apenas as tabelas de negócio que ainda faltam.

Convenção comum a todas as tabelas: `id uuid PK`, `created_at timestamptz`, `updated_at timestamptz` (com trigger), e `imagem_url text` quando houver upload de imagem (bucket no Storage).

---

### 1. Fornecedores — `/fornecedores`
Tabela: `fornecedores`
- `razao_social` text — Razão Social (obrigatório)
- `nome_fantasia` text
- `cnpj` text unique — CNPJ (obrigatório)
- `inscricao_estadual` text
- `email` text
- `telefone` text
- `contato_nome` text — Nome do contato principal
- `endereco` text
- `cidade` text
- `estado` text (UF, 2 chars)
- `cep` text
- `categoria` text — Ex.: Tecidos, Calçados, Acessórios
- `status` text default 'ativo' — ativo | inativo
- `observacoes` text
- `imagem_url` text — Logo/foto do fornecedor

### 2. Pedidos de Compra — `/fornecedores/pedido`
Tabela: `pedidos_compra`
- `numero` text unique — Número do pedido
- `fornecedor_id` uuid FK → fornecedores
- `data_pedido` date
- `data_entrega_prevista` date
- `data_entrega_real` date
- `status` text — rascunho | enviado | recebido | cancelado
- `valor_total` numeric(12,2)
- `condicao_pagamento` text
- `observacoes` text

Tabela: `pedidos_compra_itens` (itens do pedido)
- `pedido_id` uuid FK → pedidos_compra
- `produto_id` uuid FK → produtos
- `quantidade` int
- `preco_unitario` numeric(12,2)
- `subtotal` numeric(12,2)

### 3. Categorias — `/categorias`
Tabela: `categorias`
- `nome` text (obrigatório)
- `slug` text unique
- `categoria_pai_id` uuid FK → categorias (self-reference, nullable)
- `descricao` text
- `ordem` int
- `status` text — publicado | rascunho
- `imagem_url` text

### 4. Produtos — `/produtos`
Tabela: `produtos`
- `sku` text unique — Código do produto
- `nome` text (obrigatório)
- `descricao` text
- `categoria_id` uuid FK → categorias
- `fornecedor_id` uuid FK → fornecedores (nullable)
- `preco` numeric(12,2)
- `preco_promocional` numeric(12,2)
- `custo` numeric(12,2)
- `peso` numeric(8,3) — em kg
- `tamanho` text — P, M, G, 38, 40, etc.
- `cor` text
- `material` text
- `status` text — publicado | rascunho | esgotado
- `destaque` boolean default false
- `imagem_url` text — imagem principal

Tabela: `produtos_imagens` (galeria)
- `produto_id` uuid FK → produtos
- `imagem_url` text
- `ordem` int

### 5. Estoque — `/estoque`
Tabela: `estoque`
- `produto_id` uuid FK → produtos (unique)
- `quantidade` int default 0
- `quantidade_minima` int default 0 — alerta de baixo estoque
- `localizacao` text — Prateleira/depósito
- `ultima_movimentacao` timestamptz

Tabela: `estoque_movimentacoes` (histórico)
- `produto_id` uuid FK → produtos
- `tipo` text — entrada | saida | ajuste
- `quantidade` int
- `motivo` text — compra, venda, perda, ajuste
- `referencia_id` uuid — id do pedido/venda relacionado
- `usuario_id` uuid FK → user_profiles

### 6. Clientes — `/clientes`
Tabela: `clientes`
- `nome` text (obrigatório)
- `cpf` text unique
- `email` text
- `telefone` text
- `data_nascimento` date
- `endereco` text
- `cidade` text
- `estado` text
- `cep` text
- `status` text default 'ativo' — ativo | inativo
- `total_pedidos` int default 0
- `valor_total_gasto` numeric(12,2) default 0
- `ultima_compra` timestamptz
- `observacoes` text
- `imagem_url` text — avatar

### 7. Checkout / Vendas — `/checkout`
Tabela: `pedidos_venda`
- `numero` text unique
- `cliente_id` uuid FK → clientes (nullable p/ guest checkout)
- `data_pedido` timestamptz default now()
- `status` text — pendente | pago | enviado | entregue | cancelado
- `subtotal` numeric(12,2)
- `frete` numeric(12,2)
- `desconto` numeric(12,2)
- `valor_total` numeric(12,2)
- `metodo_pagamento` text — cartao | pix | boleto
- `endereco_entrega` text
- `cidade_entrega` text, `estado_entrega` text, `cep_entrega` text
- `observacoes` text

Tabela: `pedidos_venda_itens`
- `pedido_id` uuid FK → pedidos_venda
- `produto_id` uuid FK → produtos
- `quantidade` int
- `preco_unitario` numeric(12,2)
- `subtotal` numeric(12,2)

---

### Storage buckets sugeridos
- `fornecedores` — logos
- `produtos` — imagens principal + galeria
- `categorias` — banners
- `clientes` — avatares
- `avatars` — avatares de user_profiles (já usado em /conta)

### Ordem sugerida de criação (respeitando FKs)
1. `categorias` (self-FK)
2. `fornecedores`
3. `produtos` → `produtos_imagens`
4. `estoque` → `estoque_movimentacoes`
5. `clientes`
6. `pedidos_compra` → `pedidos_compra_itens`
7. `pedidos_venda` → `pedidos_venda_itens`

### RLS (resumo)
- Leitura pública (`anon`) apenas em `produtos`, `categorias`, `produtos_imagens` com `status = 'publicado'` (necessário para a loja).
- Escrita restrita a `authenticated` com `has_profile(auth.uid(), 'Administrador')` ou `'Gerente'`.
- `clientes` e `pedidos_venda`: cliente pode ler/editar apenas os próprios (quando autenticado); admin/gerente veem tudo.

---

Este documento é apenas o descritivo. Confirme quais tabelas você quer que eu crie primeiro (recomendo começar por `categorias` + `fornecedores` + `produtos` + `estoque`, que são a base do catálogo) e eu preparo a migration.