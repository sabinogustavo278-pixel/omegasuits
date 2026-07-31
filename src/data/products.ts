export type ProductCategory = "ternos" | "camisaria" | "calcados" | "acessorios";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  image: string;
  tagline?: string;
  /** Tamanhos disponíveis expandidos a partir da faixa cadastrada no banco. */
  sizes: string[];
}

export const categoryNames: Record<ProductCategory, string> = {
  ternos: "Ternos",
  camisaria: "Camisaria",
  calcados: "Calçados",
  acessorios: "Acessórios",
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
