export const ENTREGA_ETAPAS = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "em_preparacao", label: "Em preparação" },
  { value: "enviado", label: "A caminho" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export function entregaLabel(status: string): string {
  return ENTREGA_ETAPAS.find((e) => e.value === status)?.label ?? status;
}

export const PAGAMENTO_STATUS = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
] as const;
