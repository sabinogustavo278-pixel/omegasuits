import * as XLSX from "xlsx";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exporta um template (cabeçalhos + linhas opcionais) em CSV. */
export function exportCsv(filename: string, columns: string[], rows: Array<Record<string, unknown>> = []) {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const r of rows) lines.push(columns.map((c) => escape(r[c])).join(","));
  triggerDownload(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), filename);
}

/** Exporta um template (cabeçalhos + linhas opcionais) em XLSX. */
export function exportXlsx(filename: string, columns: string[], rows: Array<Record<string, unknown>> = []) {
  const data = rows.length
    ? rows.map((r) => Object.fromEntries(columns.map((c) => [c, r[c] ?? ""])))
    : [Object.fromEntries(columns.map((c) => [c, ""]))];
  const sheet = XLSX.utils.json_to_sheet(data, { header: columns });
  if (!rows.length) XLSX.utils.sheet_add_aoa(sheet, [columns], { origin: "A1" });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Template");
  const out = XLSX.write(book, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  triggerDownload(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
  );
}

/** Lê um arquivo CSV ou XLSX e devolve as linhas como objetos. */
export async function parseSheet(file: File): Promise<Array<Record<string, string>>> {
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: "array" });
  const first = book.SheetNames[0];
  if (!first) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[first], {
    defval: "",
    raw: false,
  });
  return rows.map((r) =>
    Object.fromEntries(
      Object.entries(r).map(([k, v]) => [String(k).trim(), String(v ?? "").trim()]),
    ),
  );
}
