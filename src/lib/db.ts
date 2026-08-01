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
  | "list_pedidos_cliente"
  | "dashboard_metrics"
  | "list_produto_imagens"
  | "get_empresa_config"
  | "proximo_numero_pedido_compra"
  | "list_pedido_compra_itens"
  | "faturamento_por_mes"
  | "produtos_por_mes"
  | "get_stripe_config"
  | "list_pagamentos";

export type Row = Record<string, unknown>;

export async function callRpc<T = Row>(name: RpcName, args?: Row): Promise<T[]> {
  const client = supabase as unknown as {
    rpc: (n: string, a?: Row) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

/** RPC que devolve um valor escalar (texto, número). */
export async function callRpcValue<T = string>(name: RpcName, args?: Row): Promise<T | null> {
  const client = supabase as unknown as {
    rpc: (n: string, a?: Row) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return (data ?? null) as T | null;
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
  | "produtos_imagens"
  | "empresa_config"
  | "stripe_config"
  | "pagamentos";

type QueryLike = {
  insert: (v: Row | Row[]) => Promise<{ error: { message: string } | null }>;
  update: (v: Row) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
  delete: () => { in: (c: string, v: string[]) => Promise<{ error: { message: string } | null }> };
  select: (c: string) => {
    in: (
      c: string,
      v: string[],
    ) => Promise<{ data: Row[] | null; error: { message: string } | null }>;
  };
};

function table(name: TableName) {
  return (supabase as unknown as { from: (t: string) => QueryLike }).from(name);
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

/**
 * Importa linhas fazendo upsert por chave natural: registros existentes são
 * atualizados, novos são inseridos.
 */
export async function upsertByKey(
  name: TableName,
  keyColumn: string,
  rows: Row[],
): Promise<{ inserted: number; updated: number }> {
  const withKey = rows.filter((r) => String(r[keyColumn] ?? "").trim() !== "");
  const withoutKey = rows.filter((r) => String(r[keyColumn] ?? "").trim() === "");

  const keys = withKey.map((r) => String(r[keyColumn]));
  const existing = new Map<string, string>();
  if (keys.length > 0) {
    const { data, error } = await table(name).select(`id, ${keyColumn}`).in(keyColumn, keys);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) existing.set(String(row[keyColumn]), String(row.id));
  }

  const toInsert = [...withoutKey];
  let updated = 0;
  for (const row of withKey) {
    const id = existing.get(String(row[keyColumn]));
    if (id) {
      await updateRow(name, id, row);
      updated += 1;
    } else {
      toInsert.push(row);
    }
  }
  if (toInsert.length > 0) await insertRows(name, toInsert);
  return { inserted: toInsert.length, updated };
}


export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/row-level security|permission denied|violates row-level/i.test(msg)) {
    return "Sem permissão. Entre com um usuário Administrador ou Gerente para gravar.";
  }
  if (/JWT|not authenticated/i.test(msg)) return "Sessão expirada. Faça login novamente.";
  return msg;
}

/** Insere um registro e devolve o id gerado. */
export async function insertOne(name: TableName, values: Row): Promise<string> {
  const client = supabase as unknown as {
    from: (t: string) => {
      insert: (v: Row) => {
        select: (c: string) => {
          single: () => Promise<{ data: Row | null; error: { message: string } | null }>;
        };
      };
    };
  };
  const { data, error } = await client.from(name).insert(values).select("id").single();
  if (error) throw new Error(error.message);
  return String(data?.id ?? "");
}
