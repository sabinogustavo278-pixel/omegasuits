## Migration completa das tabelas de negócio

Vou criar uma única migration com todas as 11 tabelas do `.lovable/plan.md`, respeitando a ordem de FKs, com GRANTs, RLS, políticas, triggers de `updated_at` e buckets de Storage.

### Ordem de criação (respeita FKs)

1. `categorias` (self-FK `categoria_pai_id`)
2. `fornecedores`
3. `produtos` (FK → categorias, fornecedores)
4. `produtos_imagens` (FK → produtos)
5. `estoque` (FK → produtos, unique)
6. `estoque_movimentacoes` (FK → produtos, user_profiles)
7. `clientes`
8. `pedidos_compra` (FK → fornecedores)
9. `pedidos_compra_itens` (FK → pedidos_compra, produtos)
10. `pedidos_venda` (FK → clientes)
11. `pedidos_venda_itens` (FK → pedidos_venda, produtos)

Campos exatos conforme `.lovable/plan.md` — sem alterações.

### Regras de acesso (RLS)

- **Leitura pública (`anon`)** apenas em `categorias`, `produtos` e `produtos_imagens` quando `status = 'publicado'` (necessário para a loja pública funcionar sem login).
- **Escrita** em todas as tabelas restrita a `authenticated` com `has_profile(auth.uid(), 'Administrador')` OU `has_profile(auth.uid(), 'Gerente')`.
- **Leitura autenticada** em todas as tabelas de gestão (fornecedores, estoque, pedidos_compra, clientes) restrita a Administrador/Gerente.
- **`clientes` e `pedidos_venda`**: quando o cliente estiver vinculado a `auth.uid()` (futuro), o próprio cliente lê os seus; por ora, apenas Admin/Gerente. Deixo pronto para expansão sem quebrar depois.
- `service_role` recebe `GRANT ALL` em todas.

### Storage buckets (públicos para leitura, escrita restrita)

Criados via `storage.buckets` + policies:
- `fornecedores`, `produtos`, `categorias`, `clientes` — todos públicos para leitura (`SELECT`), upload/update/delete apenas por Admin/Gerente autenticado.

### Detalhes técnicos

- Cada tabela: `id uuid PK default gen_random_uuid()`, `created_at`, `updated_at` com trigger reutilizando `public.update_updated_at_column()` (já existe).
- `numero` em `pedidos_compra` e `pedidos_venda`: `text unique` (geração fica a cargo do app).
- `subtotal` nos itens: coluna comum (não generated) para manter compatibilidade com inserts do front.
- FKs com `ON DELETE`: `RESTRICT` em produtos/categorias/fornecedores referenciados por pedidos (evita apagar histórico); `CASCADE` em itens de pedido, `produtos_imagens` e `estoque` quando o pai é removido.
- Índices em todas as FKs e em `status` de produtos/pedidos.
- Sem seeds de dados — apenas estrutura, como pedido.

### Após aplicar

- Vou rodar o linter do Supabase e corrigir avisos relacionados a esta migration.
- Os tipos em `src/integrations/supabase/types.ts` serão regenerados automaticamente; o código do front que hoje usa mocks (produtos, clientes, fornecedores) continua funcionando e pode ser migrado para o banco em passos seguintes.

Confirma que posso disparar a migration exatamente assim?
