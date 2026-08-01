import { useEffect, useState } from "react";

export type Role = "admin" | "gerente" | "usuario";

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Administrador", description: "Acesso total ao sistema, incluindo usuários e permissões." },
  { value: "gerente", label: "Gerente", description: "Gestão completa da loja: fornecedores, catálogo, estoque e clientes." },
  { value: "usuario", label: "Usuário", description: "Consulta operacional: dashboard, catálogo, estoque e clientes." },
];

export type Access = "full" | "read" | "none";

// Matriz padrão rota → perfil → nível
export const ACCESS_MATRIX: Record<string, Record<Role, Access>> = {
  "/dashboard":            { admin: "full", gerente: "full", usuario: "full" },
  "/fornecedores":         { admin: "full", gerente: "full", usuario: "none" },
  "/fornecedores/pedido":  { admin: "full", gerente: "full", usuario: "none" },
  "/pedidos-compra/historico": { admin: "full", gerente: "full", usuario: "none" },

  "/categorias":           { admin: "full", gerente: "full", usuario: "none" },
  "/produtos":             { admin: "full", gerente: "full", usuario: "read" },
  "/estoque":              { admin: "full", gerente: "full", usuario: "read" },
  "/clientes":             { admin: "full", gerente: "full", usuario: "read" },
  "/usuarios":             { admin: "full", gerente: "none", usuario: "none" },
  "/perfis":               { admin: "full", gerente: "none", usuario: "none" },
  "/acessos":              { admin: "full", gerente: "none", usuario: "none" },
  "/empresa":              { admin: "full", gerente: "read", usuario: "none" },
  "/meu-perfil":           { admin: "full", gerente: "full", usuario: "full" },
  "/pagamentos/configuracoes": { admin: "full", gerente: "none", usuario: "none" },
  "/pagamentos/historico":     { admin: "full", gerente: "read", usuario: "none" },
};

const KEY = "omega_role";
const EVT = "omega_role_change";

export function getActiveRole(): Role {
  if (typeof window === "undefined") return "admin";
  const v = window.localStorage.getItem(KEY) as Role | null;
  return v && ["admin", "gerente", "usuario"].includes(v) ? v : "admin";
}

export function setActiveRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getAccess(path: string, role: Role): Access {
  return ACCESS_MATRIX[path]?.[role] ?? "full";
}

export function canAccess(path: string, role: Role): boolean {
  return getAccess(path, role) !== "none";
}

export function isReadOnly(path: string, role: Role): boolean {
  return getAccess(path, role) === "read";
}

export function useActiveRole(): Role {
  const [role, setRole] = useState<Role>("admin");
  useEffect(() => {
    setRole(getActiveRole());
    const h = () => setRole(getActiveRole());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return role;
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}
