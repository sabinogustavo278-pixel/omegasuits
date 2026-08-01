## Diagnóstico

Os logs do servidor não mostram nenhum erro na criação da sessão de checkout — a sessão do Stripe é criada normalmente. O travamento acontece no último passo do fluxo, no navegador.

Em `src/routes/checkout.dados.tsx` o pagamento termina com:

```text
window.location.href = url;   // url = checkout.stripe.com/...
```

O app roda dentro do iframe do preview do Lovable, e o Stripe Checkout não permite ser carregado em iframe. Resultado: a navegação é bloqueada, nada acontece na tela, e como `setEnviando(false)` só existe no `catch`, o botão fica com o spinner "Redirecionando" indefinidamente.

## Correção

Em `src/routes/checkout.dados.tsx`, na função `submit`:

1. Navegar a janela de topo em vez do iframe: usar `window.top?.location.assign(url)` com fallback para `window.location.assign(url)` quando não houver iframe.
2. Se a navegação de topo não for permitida (erro de cross-origin), abrir o Stripe em nova aba (`window.open(url, "_blank")`).
3. Sempre liberar o estado do botão depois de disparar o redirecionamento (`setEnviando(false)`), e mostrar um link visível "Abrir pagamento seguro do Stripe" com a URL da sessão, caso o navegador bloqueie o pop-up — assim o usuário nunca fica preso na tela.

## Detalhe técnico

Nenhuma mudança de banco, server function ou lógica de negócio: a sessão, o pedido e o webhook continuam iguais. A alteração é apenas na camada de apresentação/redirecionamento do checkout.
