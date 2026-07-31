## Objetivo

Os itens SKU018 e SKU019 estão cadastrados como "Camiseta" mas deveriam ser camisas sociais, como a "Camisa Social Alvo" (SKU015). Corrigir nomenclatura, descrição e imagens.

## O que muda

### 1. Dados no banco (tabela `produtos`)
- SKU019: nome "Camiseta Azul Claro" → **"Camisa Social Azul Claro"**, descrição → "Camisa social de algodão premium, colarinho italiano"
- SKU018: nome "Camiseta Branca com Listras" → **"Camisa Social Listrada"**, descrição → "Camisa social de algodão premium com listras finas"
- Categoria (Camisaria) e tamanhos (P ao XGG) permanecem iguais.

### 2. Imagens
Gerar 2 novas fotos de catálogo no mesmo padrão premium das demais (fundo sóbrio, luz de estúdio):
- Camisa social azul claro, manga longa, colarinho engomado, punhos com abotoadura
- Camisa social branca com listras finas verticais, manga longa, colarinho clássico

As imagens antigas de camiseta (`p-camiseta-azul.jpg`, `p-camiseta-listras.jpg`) são substituídas pelos novos arquivos de camisa social.

### 3. Código
- `src/lib/product-images.ts`: atualizar o mapeamento para reconhecer "camisa social azul", "camisa social listrada" e "camisa social alvo"/branca, apontando cada um para a imagem correta. Remover as regras baseadas em "camiseta".

A vitrine e o catálogo já leem nome/descrição direto da RPC, então refletem a mudança automaticamente.

## Detalhes técnicos

- Alteração de dados via ferramenta de insert/update (não é migration de schema).
- Imagens salvas em `src/assets/` e resolvidas pelo fallback, já que `imagem_url` desses produtos está nulo no banco.
