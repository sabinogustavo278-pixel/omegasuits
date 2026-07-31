import { formatPrice } from "@/data/products";

export interface StatusOption {
  value: string;
  label: string;
}

/** Status padrão dos pedidos de compra. */
export const PEDIDO_COMPRA_STATUS: StatusOption[] = [
  { value: "pendente", label: "Pendente" },
  { value: "recebido", label: "Recebido" },
  { value: "cancelado", label: "Cancelado" },
];

export type PrintRow = Record<string, unknown>;

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const dateBr = (v: unknown) =>
  v ? new Date(`${String(v).slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR") : "—";

function linhaEndereco(r: PrintRow) {
  return [r.endereco, [r.cidade, r.estado].filter(Boolean).join("/"), r.cep]
    .filter((p) => p && String(p).trim() !== "")
    .join(" — ");
}

/** Monta o documento do pedido de compra com o cabeçalho da empresa. */
export function buildPedidoCompraHtml({
  empresa,
  pedido,
  fornecedor,
  itens,
}: {
  empresa: PrintRow | null;
  pedido: PrintRow;
  fornecedor: PrintRow | null;
  itens: PrintRow[];
}): string {
  const total = itens.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
  const rows = itens
    .map(
      (i) => `<tr>
        <td>${esc(i.sku ?? "—")}</td>
        <td>${esc(i.produto ?? "—")}</td>
        <td class="num">${esc(i.quantidade ?? 0)}</td>
        <td class="num">${esc(formatPrice(Number(i.preco_unitario ?? 0)))}</td>
        <td class="num">${esc(formatPrice(Number(i.subtotal ?? 0)))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>Pedido de compra ${esc(pedido.numero ?? "")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root { --marinho:#16233c; --carvao:#2b2b2b; --marfim:#f7f4ee; --dourado:#b08d57; }
  * { box-sizing:border-box; }
  body { margin:0; padding:32px; background:#fff; color:var(--carvao); font-family:Inter,Arial,sans-serif; font-size:12px; }
  h1,h2,.serif { font-family:"Cormorant Garamond",Georgia,serif; font-weight:600; margin:0; }
  header { display:flex; justify-content:space-between; gap:24px; border-bottom:2px solid var(--marinho); padding-bottom:16px; }
  .brand { font-size:26px; color:var(--marinho); letter-spacing:.12em; }
  .eyebrow { font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:var(--dourado); }
  .doc { text-align:right; }
  .doc .num { font-size:20px; color:var(--marinho); font-family:"Cormorant Garamond",Georgia,serif; }
  section { margin-top:24px; }
  .box { border:1px solid #ddd8cf; background:var(--marfim); padding:14px 16px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th { text-align:left; font-size:9px; letter-spacing:.25em; text-transform:uppercase; color:#6b6b6b; border-bottom:1px solid #ddd8cf; padding:8px 6px; }
  td { padding:8px 6px; border-bottom:1px solid #efece6; }
  td.num, th.num { text-align:right; }
  .total { margin-top:16px; text-align:right; font-family:"Cormorant Garamond",Georgia,serif; font-size:22px; color:var(--marinho); }
  .obs { margin-top:20px; white-space:pre-wrap; }
  footer { margin-top:40px; border-top:1px solid #ddd8cf; padding-top:12px; font-size:10px; color:#7a7a7a; }
  @media print { body { padding:0; } }
</style></head>
<body>
  <header>
    <div>
      <p class="eyebrow">Alfaiataria</p>
      <p class="brand serif">${esc(empresa?.nome_fantasia || empresa?.razao_social || "Omega Suits")}</p>
      <p>${esc(empresa?.razao_social ?? "")}</p>
      <p>CNPJ: ${esc(empresa?.cnpj ?? "—")}${
        empresa?.inscricao_estadual ? ` · IE: ${esc(empresa.inscricao_estadual)}` : ""
      }</p>
      <p>${esc(linhaEndereco(empresa ?? {}))}</p>
      <p>${esc(empresa?.telefone ?? "")}${empresa?.email ? ` · ${esc(empresa.email)}` : ""}</p>
    </div>
    <div class="doc">
      <p class="eyebrow">Pedido de compra</p>
      <p class="num">Nº ${esc(pedido.numero ?? "—")}</p>
      <p>Emissão: ${dateBr(pedido.data_pedido)}</p>
      <p>Previsão: ${dateBr(pedido.data_entrega_prevista)}</p>
      <p>Status: ${esc(
        PEDIDO_COMPRA_STATUS.find((s) => s.value === pedido.status)?.label ?? pedido.status,
      )}</p>
    </div>
  </header>

  <section class="grid">
    <div class="box">
      <p class="eyebrow">Fornecedor</p>
      <p class="serif" style="font-size:16px;color:var(--marinho)">${esc(
        fornecedor?.razao_social ?? pedido.fornecedor ?? "—",
      )}</p>
      <p>CNPJ: ${esc(fornecedor?.cnpj ?? "—")}</p>
      <p>${esc(linhaEndereco(fornecedor ?? {}))}</p>
      <p>${esc(fornecedor?.telefone ?? "")}${fornecedor?.email ? ` · ${esc(fornecedor.email)}` : ""}</p>
    </div>
    <div class="box">
      <p class="eyebrow">Contato</p>
      <p>${esc(fornecedor?.contato_nome ?? "—")}</p>
      <p class="eyebrow" style="margin-top:10px">Itens</p>
      <p>${itens.length} item(ns)</p>
    </div>
  </section>

  <section>
    <p class="eyebrow">Itens do pedido (preço de custo)</p>
    <table>
      <thead><tr>
        <th>SKU</th><th>Produto</th><th class="num">Qtd.</th>
        <th class="num">Custo unit.</th><th class="num">Subtotal</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="5">Sem itens.</td></tr>`}</tbody>
    </table>
    <p class="total">Total: ${esc(formatPrice(total))}</p>
    ${pedido.observacoes ? `<p class="obs"><strong>Observações:</strong> ${esc(pedido.observacoes)}</p>` : ""}
  </section>

  <footer>Documento gerado em ${new Date().toLocaleString("pt-BR")} · ${esc(
    empresa?.razao_social ?? "Omega Suits",
  )}</footer>
</body></html>`;
}

/**
 * Abre o documento para impressão. Usa um iframe oculto para funcionar mesmo
 * dentro do iframe do preview; se falhar, abre em nova aba.
 */
export function printPedidoCompra(html: string) {
  try {
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc) throw new Error("sem documento");
    doc.open();
    doc.write(html);
    doc.close();
    window.setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 30_000);
    }, 400);
    return;
  } catch {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
