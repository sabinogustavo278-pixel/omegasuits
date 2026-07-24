
## 1. Usuário de teste "Gustavo"

Em `src/routes/usuarios.tsx`, adicionar linha no array `rows`:
- Nome: Gustavo · E-mail: `gustavo@omegasuits.com` · Perfil: `usuario` · Senha: `278` · Status: Ativo.

Atualizar o bloco de credenciais de teste no topo da página para listar também Gustavo (perfil Usuário, senha 278) além do administrador atual.

## 2. Configuração de perfil do usuário logado

Nova rota `src/routes/conta.tsx` (menu já indica "Conta" no header):
- Card "Avatar": upload de imagem (input file) com preview, tratamento client-side (canvas resize p/ ~400px, compressão JPEG ~0.8) e persistência mock em `localStorage` (`omega_avatar`). Segue diretriz de "upload de imagens tratadas".
- Card "Alterar senha": campos senha atual, nova senha, confirmar; validação mock, feedback de sucesso.
- Card "Dados básicos": nome + e-mail (somente leitura por enquanto, valores do usuário mock ativo).
- Usa `AdminShell` para manter navegação/perfil ativo.
- Link "Minha conta" adicionado ao `SiteHeader` (ícone usuário) e atalho no `dashboard.tsx`.

Novo helper `src/lib/mock-account.ts` com getters/setters de avatar e senha em `localStorage`.

## 3. Botão "Loja" na seção Nossas Coleções (landing)

Em `src/routes/index.tsx`, envolver o grid de produtos numa seção com kicker "Coleção" + título "Nossas Coleções" e adicionar CTA `Link` para `/ternos` (rota principal da loja) com o mesmo estilo dourado do Hero: rótulo "Visitar a loja".

## 4. Novos produtos mock

Adicionar em `src/data/products.ts` (11 novos itens) reutilizando as imagens existentes por categoria (não gerar novas imagens — mocks visuais):

Ternos (imagem `product-suit.jpg`):
- Terno Transpassado — Azul Marinho
- Terno Transpassado — Preto
- Terno Caimento Italiano com Colete — Preto
- Terno Caimento Italiano com Colete — Azul Marinho
- Terno Caimento Italiano com Colete — Cinza Claro

Calçados (imagem `product-oxford.jpg`):
- Sapato Loafer — Preto
- Sapato Oxford — Marrom Café

Acessórios (imagem `product-tie.jpg`):
- Gravata de Seda com detalhes — Amarela
- Gravata de Seda com detalhes — Marrom
- Gravata de Seda com detalhes — Verde
- Gravata de Seda com detalhes — Vermelha

Cada item recebe `id` slug, `price` coerente com a linha, `tagline` curta. Aparecem automaticamente nas rotas `/ternos`, `/calcados`, `/acessorios` e no grid da home.

Observação: se preferir imagens dedicadas por variação (cor), posso gerar depois — não incluído aqui para manter escopo.

## 5. Padronização (base de conhecimento)

Revisão das telas de gestão para garantir:
- **Cabeçalhos ordenáveis**: `DataTable` passa a aceitar `columns` como `{ label, sortKey? }[]` e renderiza botões de ordenação (asc/desc/none) com ícone. Aplicado em: `fornecedores`, `fornecedores.pedido`, `categorias`, `produtos`, `estoque`, `clientes`, `usuarios`.
- **Filtros**: cada página com tabela mantém input de busca + select de filtro (já presentes na maioria); acrescentar onde estiver faltando (`fornecedores.pedido`, `categorias`, `estoque`).
- **Botões Template · Importar · Novo**: verificar presença em todas as telas de cadastro (já padronizado via `CadastroActions`); confirmar em `clientes`, `usuarios`.
- **Upload de imagens em telas de cadastro**: adicionar campo de upload tratado (resize + compressão client-side, mock de bucket via `localStorage`/preview) em modais/futuros formulários — nesta entrega, o `CadastroActions` recebe um dialog "Novo" com campo de imagem tratada quando a entidade é visual (Produto, Categoria, Cliente, Usuário). Persistência é mock, mas o fluxo de tratamento fica pronto para migração a bucket real.

## Detalhes técnicos

- `DataTable` ordenação: estado local via `useState`; comparador genérico string/number.
- Upload tratado: helper `src/lib/image-processing.ts` — lê File, desenha em canvas com max 800px, exporta `toDataURL('image/jpeg', 0.8)`.
- Nenhuma nova dependência npm.
- Sem backend: seguem todos mocks; Cloud não é ativado nesta entrega.

## Fora do escopo

- Geração de novas imagens por cor de produto.
- Autenticação real / persistência de usuários em banco.
- Bucket real de armazenamento (pronto para plugar depois).
