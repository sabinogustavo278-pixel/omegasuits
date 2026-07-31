# Objetivo

Implementar as 8 mudanças de negócio (banco + frontend) em uma única passagem.

## 1. Banco de dados (uma migration)

- **`empresa_config`**: nova tabela de linha única (razão social, nome fantasia, CNPJ, inscrição estadual, e-mail, telefone, endereço, cidade, estado, CEP, logo_url) com grants, RLS (leitura para autenticados; escrita só Administrador/Gerente), trigger de `updated_at` e um INSERT inicial com os dados atuais exibidos na tela `/empresa`.
- **RPC `get_empresa_config()`** para leitura via SQL, seguindo o padrão das outras telas.
- **Status de pedidos de compra**: padronizar em `pendente`, `recebido`, `cancelado`. A migration converte os registros existentes (`rascunho`/`enviado`/`aprovado` → `pendente`) e altera o default da coluna para `pendente`. `dashboard_metrics()` passa a contar pedidos abertos como `status = 'pendente'`.
- **RPC `proximo_numero_pedido_compra(_fornecedor_id uuid)`**: retorna o próximo número sequencial baseado no último pedido daquele fornecedor (prefixo `PC-` + sequência com zeros).
- **RPC `list_pedido_compra_itens(_pedido_id uuid)`**: itens do pedido com SKU, nome do produto, quantidade, custo unitário e subtotal (para o histórico e o documento impresso).
- **Trigger de estoque**: função `SECURITY DEFINER` em `AFTER UPDATE OF status ON pedidos_compra` que, na transição para `recebido` (e só nela), soma as quantidades dos itens em `estoque` (criando a linha do produto se não existir), grava `ultima_movimentacao` e registra em `estoque_movimentacoes` (tipo `entrada`, referência do pedido). Uma flag/coluna `estoque_aplicado` evita dupla contagem se o status oscilar.
- **RPCs de gráficos**: `faturamento_por_mes()` (soma de `valor_total` de `pedidos_venda` agrupada por mês, últimos 12 meses) e `produtos_por_mes()` (contagem de `produtos` por mês de criação, últimos 12 meses).

## 2. Tela de Pedido de Compra (`/fornecedores/pedido`)

- Preço unitário passa a usar **estritamente `produtos.custo`** (sem fallback para `preco`); produto sem custo entra com valor vazio para digitação manual.
- Ao escolher o fornecedor, o número é preenchido automaticamente via `proximo_numero_pedido_compra` (permanece editável).
- Remoção do campo **Condição de Pagamento** do formulário.
- Select de **Status** com apenas Pendente / Recebido / Cancelado (filtro da listagem idem).
- Botão **Imprimir/Gerar documento** do pedido: cabeçalho com os dados de `empresa_config`, dados do fornecedor, itens com custo e total, em layout de impressão (marinho/carvão/marfim, Cormorant + Inter).

## 3. Nova tela `/pedidos-compra/historico`

- Lista os pedidos (RPC `list_pedidos_compra`) com filtro por texto, fornecedor e status, ordenação por cabeçalho de coluna, expansão dos itens e ação de **alterar status** (Pendente/Recebido/Cancelado) com confirmação ao marcar Recebido, avisando que o estoque será atualizado.
- Rota adicionada ao `ACCESS_MATRIX` (`admin: full`, `gerente: full`, `usuario: read`) e ao menu lateral, respeitando as permissões por perfil.

## 4. Tela `/empresa`

Passa a ler e gravar `empresa_config` de verdade (via RPC na leitura), substituindo os valores estáticos, com upload de logo tratada para o bucket existente.

## 5. Correção dos downloads de template (Clientes e Fornecedores)

Centralizar em `src/lib/sheet.ts` um `triggerDownload` mais robusto: `URL.createObjectURL(blob)` + âncora com `download`, e fallback automático de `window.open(url, "_blank")` quando o clique é bloqueado pelo iframe do preview — aplicado tanto ao CSV quanto ao XLSX, usado por todas as telas de cadastro.

## 6. Dashboard analítico (`/dashboard`)

Dois gráficos reais com Recharts (já instalado), alimentados pelas novas RPCs: **Faturamento de pedidos por mês (R$)** em barras/linha e **Quantidade de produtos por mês** em barras, com estados de carregamento/erro e cores do design system.

## Detalhes técnicos

- Toda leitura de tela continua via RPC (`callRpc`), com os novos nomes adicionados ao union type em `src/lib/db.ts`.
- A soma no estoque fica no banco (trigger), não no frontend, garantindo consistência mesmo em alterações feitas fora da tela.
- Após a migration, o `types.ts` é regenerado e as telas são ajustadas na sequência.
