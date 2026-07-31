## Objetivo

Preparar a estrutura administrativa para o Stripe: novo grupo no menu lateral, tela de configuração das chaves e tela de histórico de pagamentos com filtros reais.

## 1. Menu lateral

Novo grupo **Gestão de Pagamentos** em `AdminShell`, com dois itens:
- Configurações Stripe → `/pagamentos/configuracoes`
- Histórico de Pagamentos → `/pagamentos/historico`

Ambas as rotas entram na matriz de acessos (`/acessos`): Administrador com acesso total sempre ativo; Gerente somente leitura no histórico e sem acesso às chaves; Usuário sem acesso. O menu continua exibindo apenas o que o perfil pode ver.

## 2. Página "Configurações Stripe"

Formulário limpo, no padrão marinho/carvão/marfim com dourado, com três campos: Publishable Key, Secret Key e Webhook Secret, mais o botão **Salvar Chaves**.

Ponto importante de segurança: a **Secret Key** e o **Webhook Secret** não podem ficar guardados em tabela do banco — qualquer pessoa com acesso ao banco (ou uma falha de permissão) passaria a poder movimentar dinheiro na sua conta Stripe. Então:

- **Publishable Key** (é pública por natureza): salva numa tabela de configuração `stripe_config`, visível e editável na tela.
- **Secret Key** e **Webhook Secret**: salvos no cofre de segredos do projeto (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Ao clicar em "Salvar Chaves", abre-se o formulário seguro para você colar os valores; eles ficam disponíveis apenas para o código de servidor, nunca voltam para a tela. A tela mostra apenas o indicador "configurada / não configurada" e um botão "Substituir".

Também incluo o ambiente (Teste / Produção) e a data da última atualização na tabela de configuração.

## 3. Página "Histórico de Pagamentos"

Tabela moderna no padrão das outras telas (cabeçalho com classificação, thumbnail do cliente, filtro de texto) com as colunas: **Data, Cliente, Pedido, Valor R$, Status**.

Como ainda não há transações vindas do Stripe, crio a tabela `pagamentos` no banco, ligada a `pedidos_venda` e `clientes`, com status (aprovado, pendente, recusado, estornado), valor, data e as referências do Stripe (payment intent / charge) já previstas para a integração futura. A leitura da tela é feita por RPC (`list_pagamentos`), seguindo o padrão do sistema.

## 4. Filtros funcionais

No topo do histórico:
- **Status**: Todos / Aprovado / Pendente / Recusado / Estornado
- **Período**: Data Inicial e Data Final

Os filtros são passados como parâmetros para a RPC e a tabela é atualizada automaticamente a cada mudança (sem botão "aplicar"). Cartões de resumo acima da tabela (total aprovado, pendente, estornado) respeitam os mesmos filtros.

## Detalhes técnicos

- Migration: `stripe_config` (linha única, publishable key + ambiente) e `pagamentos` (FKs para `pedidos_venda` e `clientes`), com GRANTs e RLS restrita a Administrador/Gerente; RPCs `get_stripe_config` e `list_pagamentos(_status, _data_inicio, _data_fim)`.
- Novas rotas: `src/routes/pagamentos.configuracoes.tsx` e `src/routes/pagamentos.historico.tsx`, cada uma com `head()` próprio.
- `src/lib/db.ts`: novos nomes de RPC e tabela.
- Nenhuma cobrança/checkout Stripe é implementada nesta etapa — apenas a estrutura administrativa.
