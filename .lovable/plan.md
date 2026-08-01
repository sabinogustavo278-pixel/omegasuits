## Objetivo

Trocar o checkout simulado por Stripe Checkout real, coletar os dados do cliente antes do pagamento, dar baixa no estoque quando o pagamento for confirmado e criar a página de acompanhamento de pedidos do usuário logado.

## 1. Banco de dados (uma migration)

- `clientes`: garantir vínculo com o usuário logado (`user_id` referenciando o usuário autenticado) e campos de endereço já existentes (endereço, cidade, estado, cep, cpf, telefone) — com política para o cliente ler/gravar apenas o próprio registro.
- `pedidos_venda`: novos campos `stripe_session_id`, `stripe_payment_intent_id`, `status_entrega` e `estoque_baixado` (controle de idempotência).
- Trilha de status de entrega padronizada: `aguardando_pagamento` → `pago` → `em_preparacao` → `enviado` → `entregue`, além de `cancelado`.
- Nova função SQL `list_meus_pedidos()` (security definer, filtrando pelo usuário logado) devolvendo número, data, valor, status de pagamento, status de entrega e itens.
- Função/trigger `baixar_estoque_pedido_venda()`: ao marcar o pedido como pago, subtrai as quantidades vendidas em `estoque`, registra em `estoque_movimentacoes` e marca `estoque_baixado` para não repetir.
- GRANTs e RLS conforme o padrão do projeto.

## 2. Fluxo de compra

1. **Sacola → `/checkout`**: revisão dos itens (mantida). O botão passa a ser “Continuar para pagamento”.
2. Se o visitante não estiver logado, é enviado para `/login` (com retorno ao checkout).
3. **Nova rota `/checkout/dados`**: formulário de complemento cadastral (nome, CPF, telefone, CEP, endereço, cidade, UF). Salva/atualiza o registro em `clientes` vinculado ao usuário.
4. Ao salvar, cria o pedido em `pedidos_venda` + itens com status `aguardando_pagamento` e redireciona para o Stripe Checkout.
5. **Retorno**: `/checkout/sucesso` (confirma o pagamento, limpa a sacola, leva ao acompanhamento) e `/checkout/cancelado`.

Os campos de cartão do checkout atual são removidos — os dados do cartão passam a ser digitados no ambiente seguro do Stripe.

## 3. Backend

- `src/lib/checkout.functions.ts` (server functions autenticadas):
  - `salvarDadosCliente` — upsert do cliente do usuário logado.
  - `criarSessaoCheckout` — valida os itens/preços contra a tabela `produtos`, grava o pedido, cria a Stripe Checkout Session e devolve a URL.
  - `confirmarPedido` — consulta a sessão no Stripe na volta e atualiza o pedido (fallback caso o webhook atrase).
- `src/routes/api/public/stripe/webhook.ts` — recebe `checkout.session.completed` / `payment_intent.succeeded`, valida a assinatura com o Webhook Secret, grava em `pagamentos`, marca o pedido como pago (o que dispara a baixa de estoque).

As chaves continuam sendo lidas de `stripe_config` no servidor; nada sensível vai ao navegador.

## 4. Acompanhamento de pedidos

- Nova rota `/meus-pedidos`: lista os pedidos do usuário logado com uma linha do tempo visual (Pagamento → Em preparação → Enviado → Entregue), itens, valores e filtro por status. Leitura via RPC.
- No painel de gestão, o Histórico de Pedidos de Venda ganha a alteração de `status_entrega` (para o admin mover o pedido a caminho/entregue).
- Login: perfil `usuario` passa a ser direcionado para `/meus-pedidos`; admin/gerente seguem para `/dashboard`.
- Rota `/meus-pedidos` adicionada ao gerenciamento de acessos (Administrador sempre ativo) e à navegação.

## 5. Configuração de pagamentos — o que falta para testar

Do seu lado, na tela **Configurações Stripe**, com a conta em modo teste:

- **Publishable Key** (`pk_test_...`) e **Secret Key** (`sk_test_...`) — Stripe Dashboard → Developers → API keys.
- **Webhook Secret** (`whsec_...`) — criado após eu publicar o endpoint; eu te passo a URL do webhook para cadastrar no Stripe e você cola o secret aqui.
- Cartão de teste (não precisa cadastrar nada): `4242 4242 4242 4242`, validade futura qualquer, CVC `123`, CEP qualquer. Recusa: `4000 0000 0000 0002`.

Nenhum dado de cartão é guardado no sistema.
