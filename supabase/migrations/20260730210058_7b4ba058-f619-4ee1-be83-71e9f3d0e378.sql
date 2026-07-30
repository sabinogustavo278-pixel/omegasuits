CREATE OR REPLACE FUNCTION public.list_pedidos_cliente()
RETURNS TABLE(
  id uuid,
  numero text,
  data_pedido timestamp with time zone,
  status text,
  subtotal numeric,
  frete numeric,
  desconto numeric,
  valor_total numeric,
  metodo_pagamento text,
  total_itens bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.id, pv.numero, pv.data_pedido, pv.status, pv.subtotal, pv.frete, pv.desconto,
         pv.valor_total, pv.metodo_pagamento,
         (SELECT count(*) FROM public.pedidos_venda_itens i WHERE i.pedido_id = pv.id)
  FROM public.pedidos_venda pv
  JOIN public.clientes c ON c.id = pv.cliente_id
  WHERE auth.uid() IS NOT NULL
    AND lower(c.email) = lower((SELECT up.email FROM public.user_profiles up WHERE up.id = auth.uid()))
  ORDER BY pv.data_pedido DESC
$$;

REVOKE ALL ON FUNCTION public.list_pedidos_cliente() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_pedidos_cliente() FROM anon;
GRANT EXECUTE ON FUNCTION public.list_pedidos_cliente() TO authenticated;