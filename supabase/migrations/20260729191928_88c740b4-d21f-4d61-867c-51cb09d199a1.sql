
-- Funções de leitura (RPC). SECURITY INVOKER: respeitam as políticas de RLS existentes.

CREATE OR REPLACE FUNCTION public.list_fornecedores()
RETURNS SETOF public.fornecedores
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT * FROM public.fornecedores ORDER BY razao_social $$;

CREATE OR REPLACE FUNCTION public.list_clientes()
RETURNS SETOF public.clientes
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT * FROM public.clientes ORDER BY nome $$;

CREATE OR REPLACE FUNCTION public.list_categorias()
RETURNS TABLE (
  id uuid, nome text, slug text, categoria_pai_id uuid, categoria_pai text,
  descricao text, ordem integer, status text, imagem_url text,
  total_produtos bigint, created_at timestamptz
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT c.id, c.nome, c.slug, c.categoria_pai_id, p.nome, c.descricao, c.ordem, c.status,
         c.imagem_url,
         (SELECT count(*) FROM public.produtos pr WHERE pr.categoria_id = c.id),
         c.created_at
  FROM public.categorias c
  LEFT JOIN public.categorias p ON p.id = c.categoria_pai_id
  ORDER BY c.ordem, c.nome
$$;

CREATE OR REPLACE FUNCTION public.list_produtos()
RETURNS TABLE (
  id uuid, sku text, nome text, descricao text, categoria_id uuid, categoria text,
  fornecedor_id uuid, fornecedor text, preco numeric, preco_promocional numeric,
  custo numeric, peso numeric, tamanho text, cor text, material text,
  status text, destaque boolean, imagem_url text, estoque integer, created_at timestamptz
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT p.id, p.sku, p.nome, p.descricao, p.categoria_id, c.nome, p.fornecedor_id, f.razao_social,
         p.preco, p.preco_promocional, p.custo, p.peso, p.tamanho, p.cor, p.material,
         p.status, p.destaque, p.imagem_url,
         COALESCE((SELECT e.quantidade FROM public.estoque e WHERE e.produto_id = p.id LIMIT 1), 0),
         p.created_at
  FROM public.produtos p
  LEFT JOIN public.categorias c ON c.id = p.categoria_id
  LEFT JOIN public.fornecedores f ON f.id = p.fornecedor_id
  ORDER BY p.nome
$$;

CREATE OR REPLACE FUNCTION public.list_produto_imagens(_produto_id uuid)
RETURNS SETOF public.produtos_imagens
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT * FROM public.produtos_imagens WHERE produto_id = _produto_id ORDER BY ordem $$;

CREATE OR REPLACE FUNCTION public.list_estoque()
RETURNS TABLE (
  id uuid, produto_id uuid, sku text, produto text, imagem_url text,
  quantidade integer, quantidade_minima integer, localizacao text,
  ultima_movimentacao timestamptz, situacao text
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT e.id, e.produto_id, p.sku, p.nome, p.imagem_url, e.quantidade, e.quantidade_minima,
         e.localizacao, e.ultima_movimentacao,
         CASE WHEN e.quantidade = 0 THEN 'Ruptura'
              WHEN e.quantidade <= e.quantidade_minima THEN 'Crítico'
              ELSE 'OK' END
  FROM public.estoque e
  LEFT JOIN public.produtos p ON p.id = e.produto_id
  ORDER BY p.nome
$$;

CREATE OR REPLACE FUNCTION public.list_pedidos_compra()
RETURNS TABLE (
  id uuid, numero text, fornecedor_id uuid, fornecedor text, data_pedido date,
  data_entrega_prevista date, data_entrega_real date, status text,
  valor_total numeric, condicao_pagamento text, observacoes text,
  total_itens bigint, created_at timestamptz
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT pc.id, pc.numero, pc.fornecedor_id, f.razao_social, pc.data_pedido,
         pc.data_entrega_prevista, pc.data_entrega_real, pc.status, pc.valor_total,
         pc.condicao_pagamento, pc.observacoes,
         (SELECT count(*) FROM public.pedidos_compra_itens i WHERE i.pedido_id = pc.id),
         pc.created_at
  FROM public.pedidos_compra pc
  LEFT JOIN public.fornecedores f ON f.id = pc.fornecedor_id
  ORDER BY pc.data_pedido DESC NULLS LAST, pc.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.list_pedidos_venda()
RETURNS TABLE (
  id uuid, numero text, cliente_id uuid, cliente text, data_pedido timestamptz,
  status text, subtotal numeric, frete numeric, desconto numeric, valor_total numeric,
  metodo_pagamento text, total_itens bigint
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT pv.id, pv.numero, pv.cliente_id, c.nome, pv.data_pedido, pv.status,
         pv.subtotal, pv.frete, pv.desconto, pv.valor_total, pv.metodo_pagamento,
         (SELECT count(*) FROM public.pedidos_venda_itens i WHERE i.pedido_id = pv.id)
  FROM public.pedidos_venda pv
  LEFT JOIN public.clientes c ON c.id = pv.cliente_id
  ORDER BY pv.data_pedido DESC
$$;

CREATE OR REPLACE FUNCTION public.dashboard_metrics()
RETURNS TABLE (
  total_produtos bigint, total_clientes bigint, total_fornecedores bigint,
  pedidos_compra_abertos bigint, pedidos_venda_pendentes bigint,
  skus_criticos bigint, skus_ruptura bigint, valor_compras_abertas numeric
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.produtos),
    (SELECT count(*) FROM public.clientes),
    (SELECT count(*) FROM public.fornecedores),
    (SELECT count(*) FROM public.pedidos_compra WHERE status IN ('rascunho','enviado','aprovado')),
    (SELECT count(*) FROM public.pedidos_venda WHERE status = 'pendente'),
    (SELECT count(*) FROM public.estoque WHERE quantidade > 0 AND quantidade <= quantidade_minima),
    (SELECT count(*) FROM public.estoque WHERE quantidade = 0),
    COALESCE((SELECT sum(valor_total) FROM public.pedidos_compra WHERE status IN ('rascunho','enviado','aprovado')), 0)
$$;

REVOKE EXECUTE ON FUNCTION
  public.list_fornecedores(), public.list_clientes(), public.list_categorias(),
  public.list_produtos(), public.list_produto_imagens(uuid), public.list_estoque(),
  public.list_pedidos_compra(), public.list_pedidos_venda(), public.dashboard_metrics()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  public.list_fornecedores(), public.list_clientes(), public.list_categorias(),
  public.list_produtos(), public.list_produto_imagens(uuid), public.list_estoque(),
  public.list_pedidos_compra(), public.list_pedidos_venda(), public.dashboard_metrics()
TO authenticated;

-- Vitrine pública (respeita as políticas: só linhas publicadas)
GRANT EXECUTE ON FUNCTION public.list_produtos(), public.list_categorias(), public.list_produto_imagens(uuid) TO anon;
