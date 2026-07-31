DROP FUNCTION IF EXISTS public.list_produtos();

CREATE FUNCTION public.list_produtos()
 RETURNS TABLE(id uuid, sku text, nome text, descricao text, categoria_id uuid, categoria text, categoria_slug text, fornecedor_id uuid, fornecedor text, preco numeric, preco_promocional numeric, custo numeric, peso numeric, tamanho text, cor text, material text, status text, destaque boolean, imagem_url text, estoque integer, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.sku, p.nome, p.descricao, p.categoria_id, c.nome, c.slug, p.fornecedor_id, f.razao_social,
         p.preco, p.preco_promocional, p.custo, p.peso, p.tamanho, p.cor, p.material,
         p.status, p.destaque, p.imagem_url,
         COALESCE((SELECT e.quantidade FROM public.estoque e WHERE e.produto_id = p.id LIMIT 1), 0),
         p.created_at
  FROM public.produtos p
  LEFT JOIN public.categorias c ON c.id = p.categoria_id
  LEFT JOIN public.fornecedores f ON f.id = p.fornecedor_id
  ORDER BY p.nome
$function$;

REVOKE EXECUTE ON FUNCTION public.list_produtos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_produtos() TO anon, authenticated, service_role;