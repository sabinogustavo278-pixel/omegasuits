const LETTERS = ["PP", "P", "M", "G", "GG", "XGG"];

/**
 * Expande a faixa de tamanhos cadastrada no banco em opções selecionáveis.
 * Exemplos: "44 ao 56" → 44,46,...,56 · "36 ao 47" → 36..47 · "P ao XGG" → P..XGG
 */
export function expandSizes(raw?: string | null): string[] {
  const value = String(raw ?? "").trim();
  if (!value) return [];

  const lower = value.toLowerCase();
  if (lower === "único" || lower === "unico" || lower === "un") return ["Único"];

  const parts = value.split(/\s*(?:ao|a|até|-|\/)\s*/i).filter(Boolean);

  if (parts.length === 2) {
    const [a, b] = parts;
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb) && nb > na) {
      const diff = nb - na;
      const step = na >= 40 && diff % 2 === 0 ? 2 : 1;
      const out: string[] = [];
      for (let n = na; n <= nb; n += step) out.push(String(n));
      return out;
    }
    const ia = LETTERS.indexOf(a.toUpperCase());
    const ib = LETTERS.indexOf(b.toUpperCase());
    if (ia >= 0 && ib > ia) return LETTERS.slice(ia, ib + 1);
  }

  // Lista explícita ("P, M, G") ou valor único.
  const list = value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 1 ? list : [value];
}
