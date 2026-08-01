## Objetivo

Estrutura administrativa para o Stripe: novo grupo no menu lateral, tela de Configurações Stripe (com chaves, modo teste e teste de conexão) e tela de Histórico de Pagamentos com filtros reais.

## 1. Menu lateral

Novo grupo **Gestão de Pagamentos** em `AdminShell`:
- Configurações Stripe → `/pagamentos/configuracoes`
- Histórico de Pagamentos → `/pagamentos/historico`

Ambas entram na matriz de acessos (`/acessos`): Administrador total (sempre ativo); Gerente somente leitura no histórico e sem acesso às chaves; Usuário sem acesso. A sidebar segue exibindo apenas o que o perfil pode ver.

## 2. Página "Configurações Stripe"

Formulário limpo (marinho/carvão/marfim + dourado) com:
- **Publishable Key** — campo de texto normal.
- **Secret Key** — campo tipo senha com ícone de olho (mostrar/ocultar).
- **Webhook Secret** — campo tipo senha com ícone de olho (mostrar/ocultar).
- **Toggle "Modo Teste"** — liga/desliga; grava o ambiente (`teste` / `producao`).
- Rodapé com três ações lado a lado: **Salvar Chaves**, **Testar Conexão** e indicador da última atualização.

Conforme pedido, os três campos ficam na tabela `stripe_config`. Registro obrigatório: as chaves ficam gravadas no banco, então a proteção depende inteiramente da RLS — a tabela só é legível/gravável por Administrador (e nunca por visitante anônimo), e o Gerente não tem acesso a esta tela. Ainda assim, quem tiver acesso direto ao banco verá a Secret Key; recomendo usar chaves de teste (`sk_test_...`) enquanto o projeto está em desenvolvimento e, quando for para produção, mover a Secret Key para o cofre de segredos. Ao carregar a tela, a Secret Key e o Webhook Secret vêm mascarados (`sk_test_••••1234`) e só são reenviados ao banco se você digitar um novo valor.

**Testar Conexão**: chama uma server function (`createServerFn`) que valida a Secret Key gravada contra a API do Stripe (`GET /v1/balance`) e retorna sucesso com o nome/ID da conta e o modo detectado (teste ou produção), ou a mensagem de erro do Stripe. A chave nunca trafega de volta para o navegador. A função também avisa se o modo detectado não bate com o toggle "Modo Teste".

## 3. Página "Histórico de Pagamentos"

Tabela no padrão do sistema (classificação no cabeçalho, thumbnail do cliente, filtro de texto) com as colunas **Data, Cliente, Pedido, Valor R$, Status**.

Crio a tabela `pagamentos` (FKs para `pedidos_venda` e `clientes`), com status (aprovado, pendente, recusado, estornado), valor, moeda, método e as referências do Stripe (payment intent / charge) já previstas. Leitura via RPC `list_pagamentos`.

## 4. Filtros funcionais

No topo do histórico:
- **Status**: Todos / Aprovado / Pendente / Recusado / Estornado
- **Período**: Data Inicial e Data Final

Passados como parâmetros da RPC, atualizando a tabela automaticamente a cada mudança. Cartões de resumo (total aprovado, pendente, estornado) respeitam os mesmos filtros.

## Detalhes técnicos

- Migration: `stripe_config` (linha única: `publishable_key`, `secret_key`, `webhook_secret`, `modo_teste boolean`, `updated_at`) e `pagamentos`, com GRANTs, RLS restrita e trigger de `updated_at`; RPC `get_stripe_config` devolvendo as chaves sensíveis já mascaradas, e `list_pagamentos(_status, _data_inicio, _data_fim)`.
- Server function `testarConexaoStripe` em `src/lib/stripe.functions.ts`, lendo a chave do banco no servidor.
- Novas rotas: `src/routes/pagamentos.configuracoes.tsx` e `src/routes/pagamentos.historico.tsx`, cada uma com `head()` próprio.
- `src/lib/db.ts`: novos nomes de RPC e tabela.
- Nenhum checkout/cobrança Stripe nesta etapa — apenas a estrutura administrativa.
