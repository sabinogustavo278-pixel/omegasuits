-- 1) empresa_config: leitura apenas para admin/gerente
DROP POLICY IF EXISTS "empresa_config_select_authenticated" ON public.empresa_config;
DROP POLICY IF EXISTS "empresa_config_select" ON public.empresa_config;
DROP POLICY IF EXISTS "Authenticated can read empresa_config" ON public.empresa_config;
CREATE POLICY "empresa_config_select_admin_gerente" ON public.empresa_config
  FOR SELECT TO authenticated
  USING (public.is_admin_or_gerente());

-- 2) profiles (cargos): usuário vê o próprio cargo; admin/gerente veem todos
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can read profiles" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_gerente()
    OR id = (SELECT up.profile_id FROM public.user_profiles up WHERE up.id = auth.uid())
  );

-- 3) route_permissions: usuário vê as permissões do próprio cargo; admin/gerente veem todas
DROP POLICY IF EXISTS "route_permissions_select_authenticated" ON public.route_permissions;
DROP POLICY IF EXISTS "route_permissions_select" ON public.route_permissions;
DROP POLICY IF EXISTS "Authenticated can read route_permissions" ON public.route_permissions;
CREATE POLICY "route_permissions_select_own_or_admin" ON public.route_permissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_gerente()
    OR profile_id = (SELECT up.profile_id FROM public.user_profiles up WHERE up.id = auth.uid())
  );

-- 4) Funções internas: remover execução por anônimo/público
REVOKE EXECUTE ON FUNCTION public.baixar_estoque_pedido_venda() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aplicar_estoque_pedido_compra() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.proteger_cargo_usuario() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mask_secret(text) FROM PUBLIC, anon, authenticated;