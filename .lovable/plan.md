## Diagnóstico (verificado no banco)

- Os 20 produtos existem com preços atualizados, mas **apenas 1 tem categoria vinculada** (Abotoaduras → Acessórios); os outros 19 estão com `categoria_id` nulo.
- **Nenhum produto tem `imagem_url`**; o código descarta produtos sem imagem e, com a lista vazia, cai no catálogo mock de `src/data/products.ts` — daí a vitrine desatualizada.
- O código procura `categoria_slug`, campo que a função `list_produtos` não retorna → filtro de categoria nunca funciona.
- Categorias: Ternos, Camisas, Calçados, Acessórios (sem `slug`). As 4 "Gravata de Seda Detalhada" já têm `cor` distinta (Amarela, Marrom, Verde, Vermelho) e um produto está com status `Ativo` em vez de `publicado`.
- `tamanho` está preenchido como faixa: ternos `44 ao 56`, sapatos `36 ao 47`, camisas/camisetas `P ao XGG`, gravatas `único`; cintos e abotoaduras sem tamanho.

## O que será feito

### 1. Corrigir os dados no banco
- Preencher `slug` das categorias: `ternos`, `camisaria` (categoria "Camisas"), `calcados`, `acessorios`.
- Vincular cada produto à categoria pelo nome: Terno/Transpassado → Ternos; Camisa/Camiseta → Camisas; Sapato → Calçados; Gravata/Cinto/Abotoaduras → Acessórios.
- Renomear as gravatas duplicadas usando a cor: "Gravata de Seda Amarela", "Marrom", "Verde", "Vermelha".
- Normalizar status `Ativo` → `publicado`.
- Atualizar `list_produtos` para devolver `categoria_slug`, `tamanho` e `cor` (leitura da vitrine segue via RPC).

### 2. Vitrine ligada ao banco real
- `src/lib/catalog.ts`: classificar pelo `categoria_slug`, remover o fallback de mocks, não descartar produtos sem foto.
- Home e `/ternos`, `/camisaria`, `/calcados`, `/acessorios` listam somente produtos publicados do banco, com preço atual (promocional quando houver).
- Filtro real por categoria no topo, com contagem de itens e estados de carregando / “nenhum item nesta categoria”.

### 3. Seletor de tamanhos
- A faixa do banco é expandida em opções clicáveis: `44 ao 56` → 44, 46, 48, 50, 52, 54, 56; `36 ao 47` → 36…47; `P ao XGG` → P, M, G, GG, XGG; `único` → "Tamanho único" (pré-selecionado); sem tamanho → nenhum seletor.
- Botões de tamanho no card/página do produto; "Adicionar à sacola" fica desabilitado até escolher o tamanho.
- O carrinho passa a guardar `produto + tamanho` como itens distintos, e o tamanho escolhido aparece no resumo da sacola e no checkout.

### 4. Imagens definitivas geradas por IA
Fotos de estúdio verticais, fundo neutro, paleta marinho/carvão/marfim — uma por peça: terno marinho, transpassado preto, colete cinza claro, camisa social branca, camiseta azul claro, camiseta branca listrada, Oxford havana, Oxford marrom café, loafer preto, gravatas (marinho, amarela, marrom, verde, vermelha), cinto marrom, cinto preto e abotoaduras em prata. Cada produto recebe sua imagem pelo nome/cor; ao subir fotos reais no bucket, elas assumem o lugar sem mudar código.

## Detalhes técnicos
- Migration: `CREATE OR REPLACE FUNCTION public.list_produtos()`; updates de dados em `categorias.slug`, `produtos.categoria_id`, `produtos.nome` e `produtos.status`.
- Frontend: `src/lib/catalog.ts` (mapeamento, expansão de tamanhos, fallback de imagem), `src/components/ProductCard.tsx` (seletor), `src/lib/mock-cart.ts` (chave produto+tamanho), `src/routes/checkout.tsx`, `src/components/CategoryPage.tsx`, `src/routes/index.tsx`. `src/data/products.ts` fica só com tipos e `formatPrice`.
- Imagens em `src/assets/`, importadas como ES6.
