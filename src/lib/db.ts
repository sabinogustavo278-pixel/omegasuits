import { supabase } from "@/integrations/supabase/client";

/** Todas as leituras das telas passam por funções SQL (RPC) no Postgres. */
type RpcName =
  | "list_fornecedores"
  | "list_clientes"
  | "list_categorias"
  | "list_produtos"
  | "list_estoque"
  | "list_pedidos_compra"
  | "list_pedidos_venda"
  | "dashboard_metrics"
  | "list_produto_imagens";

export type Row = Record<string, unknown>;

export async function callRpc<T = Row>(name: RpcName, args?: Row): Promise<T[]> {
  const client = supabase as unknown as {
    rpc: (n: string, a?: Row) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export type TableName =
  | "fornecedores"
  | "clientes"
  | "categorias"
  | "produtos"
  | "estoque"
  | "estoque_movimentacoes"
  | "pedidos_compra"
  | "pedidos_compra_itens"
  | "pedidos_venda"
  | "pedidos_venda_itens"
  | "produtos_imagens";

function table(name: TableName) {
  return (supabase as unknown as {
    from: (t: string) => {
      insert: (v: Row | Row[]) => Promise<{ error: { message: string } | null }>;
      update: (v: Row) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
      delete: () => { in: (c: string, v: string[]) => Promise<{ error: { message: string } | null }> };
    };
  }).from(name);
}

export async function insertRows(name: TableName, values: Row | Row[]) {
  const { error } = await table(name).insert(values);
  if (error) throw new Error(error.message);
}

export async function updateRow(name: TableName, id: string, values: Row) {
  const { error } = await table(name).update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRows(name: TableName, ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await table(name).delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/row-level security|permission denied|violates row-level/i.test(msg)) {
    return "Sem permissão. Entre com um usuário Administrador ou Gerente para gravar.";
  }
  if (/JWT|not authenticated/i.test(msg)) return "Sessão expirada. Faça login novamente.";
  return msg;
}
