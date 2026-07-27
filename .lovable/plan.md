# Descritivo de Campos por Tela — Modelagem do Banco

Abaixo, o descritivo funcional dos campos de cada tela do painel Omega Suits, pronto para servir de base à modelagem no banco de dados. Todas as tabelas terão também os campos padrão: `id` (UUID), `created_at`, `updated_at` e, quando aplicável, `created_by` (referência ao usuário).

---

## 1. Usuários (`/usuarios`)
Cadastro das pessoas com acesso ao painel.

- **nome** — nome completo do usuário
- **email** — e-mail de login (único)
- **senha** — hash da senha (nunca em texto puro)
- **perfil / role** — vínculo com a tabela de perfis (admin, gerente, usuario)
- **avatar** — imagem de perfil (armazenada em bucket, guardar URL/caminho)
- **status** — Ativo / Pausado
- **ultimo_acesso** — data/hora do último login
- **telefone** *(opcional)*

## 2. Perfis (`/perfis`)
Definição dos perfis de acesso.

- **nome** — Administrador, Gerente, Usuário
- **descricao** — texto curto sobre o perfil
- **nivel** — código/enum (`admin`, `gerente`, `usuario`)

## 3. Acessos por Rota (`/acessos`)
Matriz de permissões perfil × rota.

- **perfil_id** — referência ao perfil
- **rota** — caminho da rota (ex.: `/produtos`)
- **permissao** — `total`, `leitura`, `negado`

---

## 4. Clientes (`/clientes`)
Cadastro de clientes da loja.

- **nome** — nome completo
- **email** — e-mail de contato
- **telefone** — telefone/celular
- **cpf** — documento
- **endereco** — logradouro, número, complemento
- **cidade** e **uf**
- **cep**
- **observacoes** — campo livre
- **avatar/foto** — imagem opcional (bucket)
- **status** — Ativo / Pausado
- **ultima_compra** — data (derivado de pedidos)
- **total_investido** — soma de compras (derivado)

---

## 5. Fornecedores (`/fornecedores`)
Cadastro de fornecedores.

- **razao_social**
- **nome_fantasia**
- **cnpj**
- **email**
- **telefone**
- **contato_responsavel**
- **endereco**, **cidade**, **uf**, **cep**
- **categoria_fornecimento** — tecidos, calçados, acessórios etc.
- **logo/imagem** — bucket
- **observacoes**
- **status** — Ativo / Inativo

## 6. Pedidos de Compra (`/fornecedores/pedido`)
Pedidos feitos aos fornecedores.

Cabeçalho:
- **numero** — identificador do pedido (ex.: PC-2025-0142)
- **fornecedor_id** — referência
- **data_emissao**
- **data_previsao_entrega**
- **status** — Rascunho / Enviado / Recebido
- **total** — valor total (derivado dos itens)
- **observacao**

Itens do pedido (tabela filha):
- **pedido_id**
- **sku / produto_id**
- **quantidade**
- **custo_unitario**
- **subtotal**

---

## 7. Categorias (`/categorias`)
Categorias de produtos da loja.

- **nome** — Ternos, Camisaria, Calçados, Acessórios…
- **slug** — usado nas rotas
- **descricao**
- **imagem** — bucket
- **ordem_exibicao**
- **status** — Ativa / Inativa

## 8. Produtos (`/produtos`)
Catálogo de produtos.

- **sku** — código único
- **nome**
- **descricao**
- **categoria_id** — referência
- **preco**
- **preco_promocional** *(opcional)*
- **imagens** — múltiplas imagens (bucket), com imagem principal
- **tecido / material**
- **cor**
- **tamanhos_disponiveis**
- **peso**
- **status** — Ativo / Inativo / Esgotado
- **destaque** — booleano (aparece em coleções)

## 9. Estoque (`/estoque`)
Movimentações e saldo por SKU/depósito.

Depósitos:
- **nome** — Ateliê SP, CD Barueri, Cofre…
- **endereco**

Saldo (view/tabela agregada):
- **produto_id / sku**
- **deposito_id**
- **saldo** — quantidade total
- **reservado** — quantidade reservada
- **disponivel** — saldo − reservado (derivado)
- **status** — OK / Crítico / Ruptura (derivado por regra)
- **ultima_movimentacao**

Movimentações (histórico):
- **produto_id / sku**
- **deposito_id**
- **tipo** — entrada / saída / ajuste / reserva
- **quantidade**
- **custo_unitario**
- **data**
- **origem** — pedido de compra, venda, ajuste manual
- **observacao**

---

## 10. Checkout / Pedidos de Venda (`/checkout`)
Compras realizadas pelos clientes.

Cabeçalho do pedido:
- **numero_pedido**
- **cliente_id** — referência
- **data_pedido**
- **status** — Aguardando pagamento / Pago / Enviado / Entregue / Cancelado
- **subtotal**, **frete**, **desconto**, **total**
- **forma_pagamento** — cartão, pix, boleto
- **dados_pagamento** — últimos dígitos, bandeira (nunca dados sensíveis completos)

Endereço de entrega (pode ser tabela ou embutido):
- **cep**, **logradouro**, **numero**, **complemento**, **bairro**, **cidade**, **uf**
- **destinatario**, **telefone_contato**

Itens do pedido:
- **pedido_id**
- **produto_id / sku**
- **quantidade**
- **preco_unitario**
- **subtotal**

---

## 11. Conta do Usuário Logado (`/conta`)
Não é uma nova tabela — reutiliza `usuarios`:
- **avatar** (upload, bucket)
- **senha_atual** e **nova_senha** (fluxo de alteração)

---

## Observações de modelagem

- Todas as imagens (avatars, produtos, categorias, fornecedores) devem ser armazenadas em **buckets de storage**, guardando no banco apenas o caminho/URL. O tratamento client-side já existe em `src/lib/image-processing.ts`.
- Enums recomendados: `perfil` (admin/gerente/usuario), `status_generico` (ativo/pausado/inativo), `status_pedido_compra`, `status_pedido_venda`, `status_estoque`, `tipo_movimentacao_estoque`.
- Relacionamentos-chave: usuários→perfis; clientes→pedidos de venda; produtos→categoria; produtos↔depósitos (via saldo); pedidos de compra→fornecedores→itens; pedidos de venda→cliente→itens.
- Cada entidade principal deve ter RLS quando o backend for ativado, restringindo escrita aos perfis definidos na matriz de acessos.

Este descritivo é apenas documental — nenhum arquivo será alterado. Se aprovar, no próximo passo posso gerar a migração SQL correspondente (com GRANTs e RLS) para as tabelas listadas.
