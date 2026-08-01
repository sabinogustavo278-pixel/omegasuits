DROP POLICY IF EXISTS "buckets negocio leitura publica" ON storage.objects;

CREATE POLICY "vitrine leitura publica"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = ANY (ARRAY['produtos'::text, 'categorias'::text]));

CREATE POLICY "arquivos internos leitura admin/gerente"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = ANY (ARRAY['clientes'::text, 'fornecedores'::text])
  AND public.is_admin_or_gerente()
);