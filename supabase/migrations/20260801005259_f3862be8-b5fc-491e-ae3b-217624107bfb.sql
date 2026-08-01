ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS clientes_user_id_key ON public.clientes(user_id) WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "clientes_self_select" ON public.clientes;
CREATE POLICY "clientes_self_select" ON public.clientes
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_gerente());
DROP POLICY IF EXISTS "clientes_self_insert" ON public.clientes;
CREATE POLICY "clientes_self_insert" ON public.clientes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_admin_or_gerente());
DROP POLICY IF EXISTS "clientes_self_update" ON public.clientes;
CREATE POLICY "clientes_self_update" ON public.clientes
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_gerente())
  WITH CHECK (user_id = auth.uid() OR public.is_admin_or_gerente());

ALTER TABLE public.pedidos_venda
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS status_entrega text NOT NULL DEFAULT 'aguardando_pagamento',
  ADD COLUMN IF NOT EXISTS estoque_baixado boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS pedidos_venda_stripe_session_idx ON public.pedidos_venda(stripe_session_id);

DROP POLICY IF EXISTS "pedidos_venda_self_select" ON public.pedidos_venda;
CREATE POLICY "pedidos_venda_self_select" ON public.pedidos_venda
  FOR SELECT TO authenticated USING (
    public.is_admin_or_gerente()
    OR cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "pedidos_venda_itens_self_select" ON public.pedidos_venda_itens;
CREATE POLICY "pedidos_venda_itens_self_select" ON public.pedidos_venda_itens
  FOR SELECT TO authenticated USING (
    public.is_admin_or_gerente()
    OR pedido_id IN (
      SELECT pv.id FROM public.pedidos_venda pv
      JOIN public.clientes c ON c.id = pv.cliente_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.baixar_estoque_pedido_venda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item record;
BEGIN
  IF NEW.status = 'pago' AND COALESCE(OLD.estoque_baixado, false) = false THEN
    FOR item IN
      SELECT produto_id, sum(quantidade)::integer AS qtd
      FROM public.pedidos_venda_itens
      WHERE pedido_id = NEW.id
      GROUP BY produto_id
    LOOP
      UPDATE public.estoque
         SET quantidade = GREATEST(quantidade - item.qtd, 0),
             ultima_movimentacao = now(),
             updated_at = now()
       WHERE produto_id = item.produto_id;

      INSERT INTO public.estoque_movimentacoes (produto_id, tipo, quantidade, motivo, referencia_id)
      VALUES (item.produto_id, 'saida', item.qtd,
              'Venda paga ' || COALESCE(NEW.numero, ''), NEW.id);
    END LOOP;

    NEW.estoque_baixado := true;
    IF NEW.status_entrega = 'aguardando_pagamento' THEN
      NEW.status_entrega := 'em_preparacao';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_baixar_estoque_pedido_venda ON public.pedidos_venda;
CREATE TRIGGER trg_baixar_estoque_pedido_venda
  BEFORE UPDATE ON public.pedidos_venda
  FOR EACH ROW EXECUTE FUNCTION public.baixar_estoque_pedido_venda();

DROP TRIGGER IF EXISTS trg_aplicar_estoque_pedido_compra ON public.pedidos_compra;
CREATE TRIGGER trg_aplicar_estoque_pedido_compra
  BEFORE UPDATE ON public.pedidos_compra
  FOR EACH ROW EXECUTE FUNCTION public.aplicar_estoque_pedido_compra();

CREATE OR REPLACE FUNCTION public.list_meus_pedidos()
RETURNS TABLE(
  id uuid, numero text, data_pedido timestamptz, status text, status_entrega text,
  subtotal numeric, frete numeric, desconto numeric, valor_total numeric,
  metodo_pagamento text, endereco_entrega text, cidade_entrega text, estado_entrega text,
  cep_entrega text, total_itens bigint, itens jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.id, pv.numero, pv.data_pedido, pv.status, pv.status_entrega,
         pv.subtotal, pv.frete, pv.desconto, pv.valor_total, pv.metodo_pagamento,
         pv.endereco_entrega, pv.cidade_entrega, pv.estado_entrega, pv.cep_entrega,
         (SELECT count(*) FROM public.pedidos_venda_itens i WHERE i.pedido_id = pv.id),
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
                    'produto', p.nome, 'sku', p.sku, 'imagem_url', p.imagem_url,
                    'quantidade', i.quantidade, 'preco_unitario', i.preco_unitario,
                    'subtotal', i.subtotal) ORDER BY p.nome)
           FROM public.pedidos_venda_itens i
           LEFT JOIN public.produtos p ON p.id = i.produto_id
           WHERE i.pedido_id = pv.id
         ), '[]'::jsonb)
  FROM public.pedidos_venda pv
  JOIN public.clientes c ON c.id = pv.cliente_id
  WHERE auth.uid() IS NOT NULL AND c.user_id = auth.uid()
  ORDER BY pv.data_pedido DESC
$$;

REVOKE ALL ON FUNCTION public.list_meus_pedidos() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_meus_pedidos() FROM anon;
GRANT EXECUTE ON FUNCTION public.list_meus_pedidos() TO authenticated;