
CREATE OR REPLACE FUNCTION public.is_admin_or_gerente()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_profile(auth.uid(), 'Administrador') OR public.has_profile(auth.uid(), 'Gerente')
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_gerente() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_gerente() TO authenticated;

CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE,
  categoria_pai_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  descricao text, ordem int DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_categorias_pai ON public.categorias(categoria_pai_id);
CREATE INDEX idx_categorias_status ON public.categorias(status);
GRANT SELECT ON public.categorias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias TO authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias publicas leitura anon" ON public.categorias FOR SELECT TO anon USING (status = 'publicado');
CREATE POLICY "categorias leitura auth" ON public.categorias FOR SELECT TO authenticated USING (status = 'publicado' OR public.is_admin_or_gerente());
CREATE POLICY "categorias admin/gerente insert" ON public.categorias FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "categorias admin/gerente update" ON public.categorias FOR UPDATE TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "categorias admin/gerente delete" ON public.categorias FOR DELETE TO authenticated USING (public.is_admin_or_gerente());
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL, nome_fantasia text,
  cnpj text UNIQUE NOT NULL, inscricao_estadual text,
  email text, telefone text, contato_nome text,
  endereco text, cidade text, estado text, cep text,
  categoria text, status text NOT NULL DEFAULT 'ativo',
  observacoes text, imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fornecedores_status ON public.fornecedores(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fornecedores TO authenticated;
GRANT ALL ON public.fornecedores TO service_role;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fornecedores admin/gerente all" ON public.fornecedores FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE, nome text NOT NULL, descricao text,
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  preco numeric(12,2), preco_promocional numeric(12,2), custo numeric(12,2),
  peso numeric(8,3), tamanho text, cor text, material text,
  status text NOT NULL DEFAULT 'rascunho',
  destaque boolean NOT NULL DEFAULT false,
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria_id);
CREATE INDEX idx_produtos_fornecedor ON public.produtos(fornecedor_id);
CREATE INDEX idx_produtos_status ON public.produtos(status);
GRANT SELECT ON public.produtos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos publicos leitura anon" ON public.produtos FOR SELECT TO anon USING (status = 'publicado');
CREATE POLICY "produtos leitura auth" ON public.produtos FOR SELECT TO authenticated USING (status = 'publicado' OR public.is_admin_or_gerente());
CREATE POLICY "produtos admin/gerente insert" ON public.produtos FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "produtos admin/gerente update" ON public.produtos FOR UPDATE TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "produtos admin/gerente delete" ON public.produtos FOR DELETE TO authenticated USING (public.is_admin_or_gerente());
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.produtos_imagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  imagem_url text NOT NULL, ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_produtos_imagens_produto ON public.produtos_imagens(produto_id);
GRANT SELECT ON public.produtos_imagens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produtos_imagens TO authenticated;
GRANT ALL ON public.produtos_imagens TO service_role;
ALTER TABLE public.produtos_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtos_imagens leitura anon" ON public.produtos_imagens FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.produtos p WHERE p.id = produto_id AND p.status = 'publicado'));
CREATE POLICY "produtos_imagens leitura auth" ON public.produtos_imagens FOR SELECT TO authenticated USING (public.is_admin_or_gerente() OR EXISTS (SELECT 1 FROM public.produtos p WHERE p.id = produto_id AND p.status = 'publicado'));
CREATE POLICY "produtos_imagens admin/gerente write" ON public.produtos_imagens FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_produtos_imagens_updated_at BEFORE UPDATE ON public.produtos_imagens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL UNIQUE REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL DEFAULT 0,
  quantidade_minima int NOT NULL DEFAULT 0,
  localizacao text, ultima_movimentacao timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque TO authenticated;
GRANT ALL ON public.estoque TO service_role;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque admin/gerente all" ON public.estoque FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estoque_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  tipo text NOT NULL, quantidade int NOT NULL, motivo text,
  referencia_id uuid,
  usuario_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_estoque_mov_produto ON public.estoque_movimentacoes(produto_id);
CREATE INDEX idx_estoque_mov_usuario ON public.estoque_movimentacoes(usuario_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque_movimentacoes TO authenticated;
GRANT ALL ON public.estoque_movimentacoes TO service_role;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque_mov admin/gerente all" ON public.estoque_movimentacoes FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_estoque_mov_updated_at BEFORE UPDATE ON public.estoque_movimentacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL, cpf text UNIQUE, email text, telefone text,
  data_nascimento date, endereco text, cidade text, estado text, cep text,
  status text NOT NULL DEFAULT 'ativo',
  total_pedidos int NOT NULL DEFAULT 0,
  valor_total_gasto numeric(12,2) NOT NULL DEFAULT 0,
  ultima_compra timestamptz, observacoes text, imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_clientes_status ON public.clientes(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes admin/gerente all" ON public.clientes FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pedidos_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  data_pedido date, data_entrega_prevista date, data_entrega_real date,
  status text NOT NULL DEFAULT 'rascunho',
  valor_total numeric(12,2), condicao_pagamento text, observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pc_fornecedor ON public.pedidos_compra(fornecedor_id);
CREATE INDEX idx_pc_status ON public.pedidos_compra(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_compra TO authenticated;
GRANT ALL ON public.pedidos_compra TO service_role;
ALTER TABLE public.pedidos_compra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc admin/gerente all" ON public.pedidos_compra FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_pc_updated_at BEFORE UPDATE ON public.pedidos_compra FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pedidos_compra_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos_compra(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade int NOT NULL, preco_unitario numeric(12,2) NOT NULL, subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pci_pedido ON public.pedidos_compra_itens(pedido_id);
CREATE INDEX idx_pci_produto ON public.pedidos_compra_itens(produto_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_compra_itens TO authenticated;
GRANT ALL ON public.pedidos_compra_itens TO service_role;
ALTER TABLE public.pedidos_compra_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pci admin/gerente all" ON public.pedidos_compra_itens FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_pci_updated_at BEFORE UPDATE ON public.pedidos_compra_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pedidos_venda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  data_pedido timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pendente',
  subtotal numeric(12,2), frete numeric(12,2), desconto numeric(12,2),
  valor_total numeric(12,2), metodo_pagamento text,
  endereco_entrega text, cidade_entrega text, estado_entrega text, cep_entrega text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pv_cliente ON public.pedidos_venda(cliente_id);
CREATE INDEX idx_pv_status ON public.pedidos_venda(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_venda TO authenticated;
GRANT ALL ON public.pedidos_venda TO service_role;
ALTER TABLE public.pedidos_venda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pv admin/gerente all" ON public.pedidos_venda FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_pv_updated_at BEFORE UPDATE ON public.pedidos_venda FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pedidos_venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos_venda(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade int NOT NULL, preco_unitario numeric(12,2) NOT NULL, subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pvi_pedido ON public.pedidos_venda_itens(pedido_id);
CREATE INDEX idx_pvi_produto ON public.pedidos_venda_itens(produto_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_venda_itens TO authenticated;
GRANT ALL ON public.pedidos_venda_itens TO service_role;
ALTER TABLE public.pedidos_venda_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pvi admin/gerente all" ON public.pedidos_venda_itens FOR ALL TO authenticated USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE TRIGGER update_pvi_updated_at BEFORE UPDATE ON public.pedidos_venda_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "buckets negocio leitura publica" ON storage.objects FOR SELECT TO public USING (bucket_id IN ('fornecedores','produtos','categorias','clientes'));
CREATE POLICY "buckets negocio insert admin/gerente" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('fornecedores','produtos','categorias','clientes') AND public.is_admin_or_gerente());
CREATE POLICY "buckets negocio update admin/gerente" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('fornecedores','produtos','categorias','clientes') AND public.is_admin_or_gerente()) WITH CHECK (bucket_id IN ('fornecedores','produtos','categorias','clientes') AND public.is_admin_or_gerente());
CREATE POLICY "buckets negocio delete admin/gerente" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('fornecedores','produtos','categorias','clientes') AND public.is_admin_or_gerente());
