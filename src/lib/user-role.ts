import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/mock-roles";
import { useSession } from "@/lib/mock-auth";

function mapProfileNameToRole(name: string | null | undefined): Role {
  switch (name) {
    case "Administrador":
      return "admin";
    case "Gerente":
      return "gerente";
    default:
      return "usuario";
  }
}

export async function fetchRoleForUser(userId: string): Promise<Role> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("profile:profiles(name)")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return "usuario";
  // data.profile can be object or array depending on generated types
  const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile;
  return mapProfileNameToRole(profile?.name);
}

export function useCurrentRole(): { role: Role; loading: boolean } {
  const { session, loading: sLoading } = useSession();
  const [role, setRole] = useState<Role>("usuario");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sLoading) return;
    if (!session) {
      setRole("usuario");
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchRoleForUser(session.user.id).then((r) => {
      if (!mounted) return;
      setRole(r);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [session, sLoading]);

  return { role, loading };
}
