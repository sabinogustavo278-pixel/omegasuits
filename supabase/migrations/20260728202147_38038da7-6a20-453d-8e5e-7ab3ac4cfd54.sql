
-- 1. Drop existing policies, triggers, functions, tables tied to old model
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.route_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Backup old profiles (user data) and drop
ALTER TABLE public.profiles RENAME TO user_profiles_old;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP TYPE IF EXISTS public.app_role;

-- 2. New profiles = role catalog
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Seed 3 cargos
INSERT INTO public.profiles (name, description) VALUES
  ('Administrador', 'Acesso total ao sistema, gerenciamento completo.'),
  ('Gerente', 'Acesso a relatórios, produtos, estoque e fornecedores.'),
  ('Usuário', 'Acesso básico para consultas e operações.');

-- 3. New user_profiles = user data
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  telefone text,
  status text NOT NULL DEFAULT 'ativo',
  ultimo_acesso timestamptz,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Migrate data from backup (default cargo = Usuário)
INSERT INTO public.user_profiles (id, name, email, avatar_url, telefone, status, ultimo_acesso, profile_id, created_at, updated_at)
SELECT
  o.id,
  o.nome,
  o.email,
  o.avatar_url,
  o.telefone,
  COALESCE(o.status, 'ativo'),
  o.ultimo_acesso,
  (SELECT id FROM public.profiles WHERE name = 'Usuário'),
  o.created_at,
  o.updated_at
FROM public.user_profiles_old o;

DROP TABLE public.user_profiles_old;

-- 4. has_profile security definer function
CREATE OR REPLACE FUNCTION public.has_profile(_user_id uuid, _profile_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.profiles p ON p.id = up.profile_id
    WHERE up.id = _user_id AND p.name = _profile_name
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_profile(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_profile(uuid, text) TO authenticated;

-- 5. RLS on profiles (cargos)
CREATE POLICY "Authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_profile(auth.uid(), 'Administrador'))
  WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));

-- 6. RLS on user_profiles
CREATE POLICY "Users read own user_profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins read all user_profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Users update own user_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update all user_profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (public.has_profile(auth.uid(), 'Administrador'))
  WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins insert user_profiles" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins delete user_profiles" ON public.user_profiles
  FOR DELETE TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));

-- 7. route_permissions rebuild
CREATE TABLE public.route_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rota text NOT NULL,
  permissao text NOT NULL CHECK (permissao IN ('total','leitura','negado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, rota)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_permissions TO authenticated;
GRANT ALL ON public.route_permissions TO service_role;

ALTER TABLE public.route_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read route_permissions" ON public.route_permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert route_permissions" ON public.route_permissions
  FOR INSERT TO authenticated WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins update route_permissions" ON public.route_permissions
  FOR UPDATE TO authenticated
  USING (public.has_profile(auth.uid(), 'Administrador'))
  WITH CHECK (public.has_profile(auth.uid(), 'Administrador'));
CREATE POLICY "Admins delete route_permissions" ON public.route_permissions
  FOR DELETE TO authenticated USING (public.has_profile(auth.uid(), 'Administrador'));

-- Seed route permissions
WITH cargos AS (
  SELECT id, name FROM public.profiles
)
INSERT INTO public.route_permissions (profile_id, rota, permissao)
SELECT c.id, r.rota, r.permissao FROM cargos c
CROSS JOIN LATERAL (VALUES
  ('/dashboard', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'negado' END),
  ('/fornecedores', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'negado' END),
  ('/fornecedores/pedido', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'negado' END),
  ('/categorias', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'negado' END),
  ('/produtos', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'leitura' END),
  ('/estoque', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'negado' END),
  ('/clientes', CASE c.name WHEN 'Administrador' THEN 'total' WHEN 'Gerente' THEN 'total' ELSE 'leitura' END),
  ('/usuarios', CASE c.name WHEN 'Administrador' THEN 'total' ELSE 'negado' END),
  ('/perfis', CASE c.name WHEN 'Administrador' THEN 'total' ELSE 'leitura' END),
  ('/acessos', CASE c.name WHEN 'Administrador' THEN 'total' ELSE 'leitura' END)
) AS r(rota, permissao);

-- 8. updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_route_permissions_updated_at BEFORE UPDATE ON public.route_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_profile_id uuid;
BEGIN
  SELECT id INTO default_profile_id FROM public.profiles WHERE name = 'Usuário' LIMIT 1;

  INSERT INTO public.user_profiles (id, name, email, profile_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    default_profile_id
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
