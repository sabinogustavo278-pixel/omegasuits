-- 1. Empresa config
CREATE TABLE IF NOT EXISTS public.empresa_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL DEFAULT '',
  nome_fantasia text,
  cnpj text,
  inscricao_estadual text,
  email text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresa_config TO authenticated;
GRANT ALL ON public.empresa_config TO service_role;

ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empresa_config leitura auth" ON public.empresa_config;
CREATE POLICY "empresa_config leitura auth" ON public.empresa_config
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "empresa_config insert admin/gerente" ON public.empresa_config;
CREATE POLICY "empresa_config insert admin/gerente" ON public.empresa_config
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_gerente());

DROP POLICY IF EXISTS "empresa_config update admin/gerente" ON public.empresa_config;
CREATE POLICY "empresa_config update admin/gerente" ON public.empresa_config
  FOR UPDATE TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());

DROP POLICY IF EXISTS "empresa_config delete admin/gerente" ON public.empresa_config;
CREATE POLICY "empresa_config delete admin/gerente" ON public.empresa_config
  FOR DELETE TO authenticated USING (public.is_admin_or_gerente());

DROP TRIGGER IF EXISTS update_empresa_config_updated_at ON public.empresa_config;
CREATE TRIGGER update_empresa_config_updated_at
  BEFORE UPDATE ON public.empresa_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.empresa_config (razao_social, nome_fantasia, cnpj, telefone, endereco, cidade, estado, cep)
SELECT 'Omega Suits Alfaiataria Ltda.', 'Omega Suits', '12.345.678/0001-90', '(11) 4000-1962',
       'Rua Haddock Lobo, 1620 — Jardins', 'São Paulo', 'SP', '01414-002'
WHERE NOT EXISTS (SELECT 1 FROM public.empresa_config);

CREATE OR REPLACE FUNCTION public.get_empresa_config()
RETURNS SETOF public.empresa_config
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$ SELECT * FROM public.empresa_config ORDER BY created_at LIMIT 1 $$;

GRANT EXECUTE ON FUNCTION public.get_empresa_config() TO authenticated;

-- 2. Status padrão dos pedidos de compra
UPDATE public.pedidos_compra
   SET status = 'pendente'
 WHERE status NOT IN ('pendente','recebido','cancelado');

ALTER TABLE public.pedidos_compra ALTER COLUMN status SET DEFAULT 'pendente';
ALTER TABLE public.pedidos_compra ADD COLUMN IF NOT EXISTS estoque_aplicado boolean NOT NULL DEFAULT false;

UPDATE public.pedidos_compra SET estoque_aplicado = true WHERE status = 'recebido';

CREATE OR REPLACE FUNCTION public.dashboard_metrics()
RETURNS TABLE(total_produtos bigint, total_clientes bigint, total_fornecedores bigint, pedidos_compra_abertos bigint, pedidos_venda_pendentes bigint, skus_criticos bigint, skus_ruptura bigint, valor_compras_abertas numeric)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*) FROM public.produtos),
    (SELECT count(*) FROM public.clientes),
    (SELECT count(*) FROM public.fornecedores),
    (SELECT count(*) FROM public.pedidos_compra WHERE status = 'pendente'),
    (SELECT count(*) FROM public.pedidos_venda WHERE status = 'pendente'),
    (SELECT count(*) FROM public.estoque WHERE quantidade > 0 AND quantidade <= quantidade_minima),
    (SELECT count(*) FROM public.estoque WHERE quantidade = 0),
    COALESCE((SELECT sum(valor_total) FROM public.pedidos_compra WHERE status = 'pendente'), 0)
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_metrics() TO authenticated;

-- 3. Próximo número de pedido por fornecedor
CREATE OR REPLACE FUNCTION public.proximo_numero_pedido_compra(_fornecedor_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  ultimo integer;
BEGIN
  SELECT COALESCE(max(NULLIF(regexp_replace(COALESCE(numero,''), '\D', '', 'g'), '')::bigint), 0)
    INTO ultimo
    FROM public.pedidos_compra
   WHERE _fornecedor_id IS NULL OR fornecedor_id = _fornecedor_id;

  RETURN 'PC-' || lpad((COALESCE(ultimo, 0) + 1)::text, 5, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.proximo_numero_pedido_compra(uuid) TO authenticated;

-- 4. Itens de um pedido de compra
CREATE OR REPLACE FUNCTION public.list_pedido_compra_itens(_pedido_id uuid)
RETURNS TABLE(id uuid, produto_id uuid, sku text, produto text, imagem_url text, quantidade integer, preco_unitario numeric, subtotal numeric)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT i.id, i.produto_id, p.sku, p.nome, p.imagem_url, i.quantidade, i.preco_unitario, i.subtotal
  FROM public.pedidos_compra_itens i
  LEFT JOIN public.produtos p ON p.id = i.produto_id
  WHERE i.pedido_id = _pedido_id
  ORDER BY p.nome
$$;

GRANT EXECUTE ON FUNCTION public.list_pedido_compra_itens(uuid) TO authenticated;

-- 5. Automação de estoque ao receber pedido
CREATE OR REPLACE FUNCTION public.aplicar_estoque_pedido_compra()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item record;
BEGIN
  IF NEW.status = 'recebido' AND COALESCE(OLD.estoque_aplicado, false) = false THEN
    FOR item IN
      SELECT produto_id, sum(quantidade)::integer AS qtd
      FROM public.pedidos_compra_itens
      WHERE pedido_id = NEW.id
      GROUP BY produto_id
    LOOP
      UPDATE public.estoque
         SET quantidade = quantidade + item.qtd,
             ultima_movimentacao = now(),
             updated_at = now()
       WHERE produto_id = item.produto_id;

      IF NOT FOUND THEN
        INSERT INTO public.estoque (produto_id, quantidade, quantidade_minima, ultima_movimentacao)
        VALUES (item.produto_id, item.qtd, 0, now());
      END IF;

      INSERT INTO public.estoque_movimentacoes (produto_id, tipo, quantidade, motivo, referencia_id)
      VALUES (item.produto_id, 'entrada', item.qtd,
              'Recebimento do pedido de compra ' || COALESCE(NEW.numero, ''), NEW.id);
    END LOOP;

    NEW.estoque_aplicado := true;
    NEW.data_entrega_real := COALESCE(NEW.data_entrega_real, CURRENT_DATE);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_aplicar_estoque_pedido_compra ON public.pedidos_compra;
CREATE TRIGGER trg_aplicar_estoque_pedido_compra
  BEFORE UPDATE OF status ON public.pedidos_compra
  FOR EACH ROW EXECUTE FUNCTION public.aplicar_estoque_pedido_compra();

-- 6. Gráficos do dashboard
CREATE OR REPLACE FUNCTION public.faturamento_por_mes()
RETURNS TABLE(mes date, rotulo text, total numeric, pedidos bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  WITH meses AS (
    SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month')::date AS mes
  )
  SELECT m.mes,
         to_char(m.mes, 'MM/YYYY'),
         COALESCE(sum(pv.valor_total), 0),
         count(pv.id)
  FROM meses m
  LEFT JOIN public.pedidos_venda pv
    ON date_trunc('month', pv.data_pedido)::date = m.mes
   AND pv.status <> 'cancelado'
  GROUP BY m.mes
  ORDER BY m.mes
$$;

GRANT EXECUTE ON FUNCTION public.faturamento_por_mes() TO authenticated;

CREATE OR REPLACE FUNCTION public.produtos_por_mes()
RETURNS TABLE(mes date, rotulo text, total bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  WITH meses AS (
    SELECT generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month')::date AS mes
  )
  SELECT m.mes,
         to_char(m.mes, 'MM/YYYY'),
         count(p.id)
  FROM meses m
  LEFT JOIN public.produtos p
    ON date_trunc('month', p.created_at)::date = m.mes
  GROUP BY m.mes
  ORDER BY m.mes
$$;

GRANT EXECUTE ON FUNCTION public.produtos_por_mes() TO authenticated;