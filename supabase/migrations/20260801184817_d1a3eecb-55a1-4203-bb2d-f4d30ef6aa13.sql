CREATE OR REPLACE FUNCTION public.proteger_cargo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.profile_id IS DISTINCT FROM OLD.profile_id
     AND NOT public.has_profile(auth.uid(), 'Administrador')
     AND auth.uid() IS NOT NULL THEN
    NEW.profile_id := OLD.profile_id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.proteger_cargo_usuario() FROM anon, authenticated;

DROP TRIGGER IF EXISTS proteger_cargo_usuario ON public.user_profiles;
CREATE TRIGGER proteger_cargo_usuario
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.proteger_cargo_usuario();