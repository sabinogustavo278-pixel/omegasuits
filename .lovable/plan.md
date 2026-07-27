## Objetivo

1. Criar a página de checkout de compras com carrinho mock.
2. Revisar as telas existentes para reforçar o padrão da base de conhecimento (paleta marinho/carvão/marfim + dourado, Cormorant/Inter, sidebar filtrada por perfil, cadastros com Template/Importar/Novo, tabelas com filtro e ordenação, upload de imagem tratada).

## Escopo

### 1. Carrinho + Checkout

- `src/lib/mock-cart.ts`: estado do carrinho em `localStorage` (chave `omega:cart`) com hook `useCart` via `useSyncExternalStore` (add, remove, updateQty, clear, itens, subtotal). Dispara evento para sincronizar o header.
- `ProductCard`: botão discreto "Adicionar à sacola" abaixo do preço.
- `SiteHeader`: ícone de sacola com contador, linkando para `/checkout`.
- Nova rota `src/routes/checkout.tsx`:
  - SiteHeader/SiteFooter, tipografia Cormorant nos títulos, acentos dourados.
  - Coluna esquerda: itens do carrinho (thumb, nome, categoria, preço, seletor de qty, remover) + estado vazio elegante com link para a loja.
  - Coluna direita: resumo (subtotal, frete cortesia, total), campo de cupom (mock), botão "Finalizar compra".
  - Formulário de entrega (nome, e-mail, endereço, CEP) e pagamento (número do cartão, validade, CVV) com máscaras simples inline e validação leve.
  - Ao confirmar: modal "Pedido recebido" com número mock e limpa o carrinho.
  - `head()` próprio; sem OG image.

### 2. Alinhamento ao padrão da base de conhecimento

Ajustes de padrão nas telas existentes, sem alterar lógica de negócio:

- `AdminShell`: filtrar itens da sidebar pela matriz `mock-roles` — rotas restritas ao perfil ativo somem em vez de aparecerem esmaecidas com badge "Restrito".
- Cadastros que ainda não têm campo de imagem tratada — `fornecedores`, `categorias`, `clientes`, `usuarios`: adicionar upload no painel "Novo" usando `processImageFile` (armazenado como data URL mock, simulando bucket).
- Verificação de todas as telas de cadastro/tabela: garantir presença de `CadastroActions` (Template · Importar · Novo), campo de filtro e cabeçalhos ordenáveis via `useTableSort`; completar onde faltar.
- Ajustes visuais menores para consistência (bordas, spacings e uso do dourado como acento).

## Detalhes técnicos

- Máscaras (cartão, validade, CVV, CEP): funções inline em `checkout.tsx`, sem novas libs.
- Nenhuma dependência nova; nada de Cloud/DB — pedidos apenas confirmados via modal.
- `routeTree.gen.ts` regenera automaticamente após criar `checkout.tsx`.

## Fora de escopo
- Persistência de pedidos, integração real de pagamento.
- Geração de novas imagens de produtos.
- Alterações em rotas administrativas além dos ajustes de padrão listados.
