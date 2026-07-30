## 1. Rota /fornecedores/pedido (causa confirmada)

No roteamento atual, `fornecedores.pedido.tsx` fica **aninhada** dentro de `fornecedores.tsx`, e a página de Fornecedores não renderiza `<Outlet />` — por isso a URL de pedido mostra o cadastro de fornecedores.

Correção: transformar em rota irmã (`fornecedores_.pedido.tsx`) e reescrever a tela como um **Pedido de Compra** de verdade:
- seleção de fornecedor via RPC `list_fornecedores`;
- itens do pedido: escolher produto (via `list_produtos`), quantidade e preço unitário, com adicionar/remover linhas;
- subtotal por item e valor total calculados na tela;
- ao salvar: grava em `pedidos_compra` e os itens em `pedidos_compra_itens` (com `pedido_id`), atualizando `valor_total`;
- lista dos pedidos existentes via `list_pedidos_compra`, com filtro, ordenação, edição e exclusão.

## 2. Formulários em branco (Produtos, Clientes, Fornecedores, Categorias)

O código do modal renderiza os campos, então a causa exata ainda **não está confirmada**. Primeiro passo: reproduzir clicando em "Novo" nas 4 telas e ler console/erros. Hipóteses a verificar, na ordem:
- perfil ativo caindo em modo somente-leitura/gate, esvaziando o corpo do modal;
- lista de campos dependente de RPCs (`list_categorias`/`list_fornecedores`) que falham sem sessão, deixando o formulário sem conteúdo útil;
- erro de render dentro do modal derrubando a árvore.

Depois de identificado, corrigir na origem e garantir que o modal sempre renderize os inputs, com estado de carregamento nos selects em vez de vazio.

## 3. Template e Importação

- Corrigir o download: anexar o link ao DOM antes do clique e liberar a URL depois, com fallback de abertura em nova aba (o preview em iframe pode bloquear downloads diretos).
- Completar as colunas dos templates para refletirem **todas** as colunas gravável de cada tabela (incluindo vínculos como `categoria_id`, `fornecedor_id`, e campos de endereço em clientes/fornecedores).
- Importação: ler CSV/XLSX, e em vez de apenas inserir, fazer **upsert** — se o registro já existe (chave natural: `sku` em produtos, `cnpj` em fornecedores, `cpf`/`email` em clientes, `slug`/`nome` em categorias), atualizar; se não, inserir. Mostrar resumo "X inseridos, Y atualizados" e erros por linha.

## 4. Validações mínimas nos cadastros

Marcar como obrigatórios apenas os essenciais e deixar o resto opcional:
- Produtos: Nome, Preço, Fornecedor;
- Clientes: Nome;
- Fornecedores: Razão social, CNPJ;
- Categorias: Nome.
Campos obrigatórios recebem indicação visual e bloqueio de envio com mensagem clara.

## 5. Cadastro sem confirmação de e-mail

Habilitar auto-confirmação de e-mail na configuração do Auth do projeto e ajustar a tela de login para entrar direto após criar a conta (remover a mensagem "verifique seu e-mail" e o redirecionamento por link).

## 6. Meu Perfil

Nova rota `/meu-perfil`, com item no menu para usuários logados (header da loja e menu lateral do painel):
- dados do usuário atual (nome, e-mail e avatar vindos do Auth/`user_profiles`);
- seção de histórico de compras consultando `pedidos_venda` do cliente, via nova função SQL (RPC) que lista os pedidos com número, data, status, valor e quantidade de itens.

A rota é registrada no gerenciamento de acessos com o perfil Administrador sempre ativo, e o menu lateral continua exibindo apenas rotas liberadas.

## 7. Dados da Empresa

Nova rota `/empresa` no painel (apenas visual, sem banco): formulário com Nome, CNPJ, Telefone e Endereço, no padrão da identidade (marinho/carvão/marfim, dourado, Cormorant + Inter), também registrada no gerenciamento de acessos e na sidebar.

## Detalhes técnicos

- Nova migration apenas para a função SQL de histórico de compras do cliente (leitura via RPC, conforme a diretriz do projeto), com permissão para usuários autenticados.
- Ajustes concentrados em `src/components/admin/CrudManager.tsx`, `src/lib/sheet.ts`, `src/lib/db.ts` (upsert), `src/lib/mock-roles.ts` (novas rotas na matriz), `src/components/admin/AdminShell.tsx`, `src/components/SiteHeader.tsx`.
- Correção silenciosa do aviso de hidratação do contador da sacola no header.
