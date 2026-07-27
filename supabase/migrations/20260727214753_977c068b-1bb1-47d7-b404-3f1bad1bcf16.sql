
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'usuario');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  telefone text,
  avatar_url text,
  status text NOT NULL DEFAULT 'ativo',
  ultimo_acesso timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ user_roles ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ route_permissions ============
CREATE TABLE public.route_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  rota text NOT NULL,
  permissao text NOT NULL CHECK (permissao IN ('total','leitura','negado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, rota)
);

GRANT SELECT ON public.route_permissions TO authenticated;
GRANT ALL ON public.route_permissions TO service_role;
ALTER TABLE public.route_permissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER route_permissions_updated_at
BEFORE UPDATE ON public.route_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RLS Policies ============
-- profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles update" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- route_permissions
CREATE POLICY "Authenticated read route permissions" ON public.route_permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert route permissions" ON public.route_permissions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update route permissions" ON public.route_permissions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete route permissions" ON public.route_permissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ Trigger de novo usuário ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'usuario');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Seed route_permissions ============
INSERT INTO public.route_permissions (role, rota, permissao) VALUES
  ('admin','/dashboard','total'), ('gerente','/dashboard','total'), ('usuario','/dashboard','total'),
  ('admin','/fornecedores','total'), ('gerente','/fornecedores','total'), ('usuario','/fornecedores','negado'),
  ('admin','/fornecedores/pedido','total'), ('gerente','/fornecedores/pedido','total'), ('usuario','/fornecedores/pedido','negado'),
  ('admin','/categorias','total'), ('gerente','/categorias','total'), ('usuario','/categorias','negado'),
  ('admin','/produtos','total'), ('gerente','/produtos','total'), ('usuario','/produtos','leitura'),
  ('admin','/estoque','total'), ('gerente','/estoque','total'), ('usuario','/estoque','leitura'),
  ('admin','/clientes','total'), ('gerente','/clientes','total'), ('usuario','/clientes','leitura'),
  ('admin','/usuarios','total'), ('gerente','/usuarios','negado'), ('usuario','/usuarios','negado'),
  ('admin','/perfis','total'), ('gerente','/perfis','negado'), ('usuario','/perfis','negado'),
  ('admin','/acessos','total'), ('gerente','/acessos','negado'), ('usuario','/acessos','negado');
