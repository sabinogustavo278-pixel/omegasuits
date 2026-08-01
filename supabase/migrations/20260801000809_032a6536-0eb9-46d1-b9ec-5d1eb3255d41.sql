CREATE TABLE public.stripe_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publishable_key text NOT NULL DEFAULT '',
  secret_key text NOT NULL DEFAULT '',
  webhook_secret text NOT NULL DEFAULT '',
  modo_teste boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_config TO authenticated;
GRANT ALL ON public.stripe_config TO service_role;
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_config select admin" ON public.stripe_config
  FOR SELECT TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "stripe_config insert admin" ON public.stripe_config
  FOR INSERT TO authenticated WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "stripe_config update admin" ON public.stripe_config
  FOR UPDATE TO authenticated USING (public.has_profile(auth.uid(), 'Administrador')) WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "stripe_config delete admin" ON public.stripe_config
  FOR DELETE TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));

CREATE TRIGGER update_stripe_config_updated_at
  BEFORE UPDATE ON public.stripe_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid REFERENCES public.pedidos_venda(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  data_pagamento timestamptz NOT NULL DEFAULT now(),
  valor numeric NOT NULL DEFAULT 0,
  moeda text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pendente',
  metodo text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pagamentos_data_idx ON public.pagamentos (data_pagamento DESC);
CREATE INDEX pagamentos_status_idx ON public.pagamentos (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagamentos admin/gerente all" ON public.pagamentos
  FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.mask_secret(_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _value IS NULL OR length(_value) = 0 THEN ''
    WHEN length(_value) <= 8 THEN repeat('•', length(_value))
    ELSE left(_value, 7) || repeat('•', 8) || right(_value, 4)
  END
$$;

CREATE OR REPLACE FUNCTION public.get_stripe_config()
RETURNS TABLE(
  id uuid,
  publishable_key text,
  secret_key_mask text,
  webhook_secret_mask text,
  tem_secret_key boolean,
  tem_webhook_secret boolean,
  modo_teste boolean,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT s.id, s.publishable_key,
         public.mask_secret(s.secret_key),
         public.mask_secret(s.webhook_secret),
         length(coalesce(s.secret_key, '')) > 0,
         length(coalesce(s.webhook_secret, '')) > 0,
         s.modo_teste, s.updated_at
  FROM public.stripe_config s
  ORDER BY s.created_at
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.list_pagamentos(
  _status text DEFAULT NULL,
  _data_inicio date DEFAULT NULL,
  _data_fim date DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  data_pagamento timestamptz,
  cliente_id uuid,
  cliente text,
  imagem_url text,
  pedido_id uuid,
  pedido text,
  valor numeric,
  moeda text,
  status text,
  metodo text,
  stripe_payment_intent_id text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT pg.id, pg.data_pagamento, pg.cliente_id, c.nome, c.imagem_url,
         pg.pedido_id, pv.numero, pg.valor, pg.moeda, pg.status, pg.metodo,
         pg.stripe_payment_intent_id, pg.created_at
  FROM public.pagamentos pg
  LEFT JOIN public.clientes c ON c.id = pg.cliente_id
  LEFT JOIN public.pedidos_venda pv ON pv.id = pg.pedido_id
  WHERE (_status IS NULL OR _status = '' OR pg.status = _status)
    AND (_data_inicio IS NULL OR pg.data_pagamento >= _data_inicio::timestamptz)
    AND (_data_fim IS NULL OR pg.data_pagamento < (_data_fim + 1)::timestamptz)
  ORDER BY pg.data_pagamento DESC
$$;

REVOKE ALL ON FUNCTION public.mask_secret(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_stripe_config() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_pagamentos(text, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mask_secret(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stripe_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_pagamentos(text, date, date) TO authenticated;