import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/mock-roles";
import { useSession } from "@/lib/mock-auth";

export async function fetchRoleForUser(userId: string): Promise<Role> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("role", { ascending: true });
  if (error || !data || data.length === 0) return "usuario";
  const roles = data.map((r) => r.role as Role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("gerente")) return "gerente";
  return "usuario";
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
