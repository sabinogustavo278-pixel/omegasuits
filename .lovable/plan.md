## Objetivo

Executar uma compra real de teste com o cartão `4242 4242 4242 4242` e confirmar três coisas: retorno correto para `/checkout/sucesso`, o pedido visível em `/meus-pedidos` e o estoque decrementado.

## Situação atual (verificada)

- As chaves do Stripe já estão salvas em modo teste (publishable `pk_test_...`, secret key e webhook secret presentes).
- Ainda não existe nenhum pedido em `pedidos_venda` (0 registros), então qualquer pedido novo é o do teste.
- O app não está publicado; o webhook do Stripe pode não alcançar o ambiente de preview. A confirmação também acontece pelo caminho de retorno (`confirmarPedido`), que consulta a sessão no Stripe — portanto o teste funciona mesmo sem o webhook.

## Passos do teste

1. Registrar o estoque atual dos produtos que serão comprados (consulta antes/depois para comparar).
2. Automatizar o fluxo no navegador com sessão autenticada: vitrine → escolher tamanho → adicionar à sacola → `/checkout` → `/checkout/dados` (preencher CPF, telefone, CEP, endereço) → “Continuar para pagamento”.
3. Na página hospedada do Stripe, preencher `4242 4242 4242 4242`, validade futura, CVC `123` e concluir o pagamento, com captura de tela em cada etapa.
4. Verificar o retorno em `/checkout/sucesso`: número do pedido exibido, sacola limpa e status “Pagamento aprovado”.
5. Abrir `/meus-pedidos` e confirmar que o pedido aparece com a linha do tempo no estágio correto.
6. Conferir no banco: `pedidos_venda.status = 'pago'`, `estoque_baixado = true`, registro em `pagamentos`, movimentação em `estoque_movimentacoes` e a quantidade em `estoque` reduzida exatamente pela quantidade comprada.

## Se algo falhar

Diagnostico e corrijo na sequência: logs da função de servidor para erros do Stripe, resposta do webhook, e o caminho de fallback de confirmação. Só ajusto código depois de identificar a causa pelos logs/telas.

## Observação

O teste cria um pedido e um pagamento de teste reais no banco e no Stripe (modo teste). Posso remover o pedido de teste depois, se você quiser.
