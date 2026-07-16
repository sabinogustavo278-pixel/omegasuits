import suit from "@/assets/product-suit.jpg";
import oxford from "@/assets/product-oxford.jpg";
import tie from "@/assets/product-tie.jpg";
import shirt from "@/assets/product-shirt.jpg";
import belt from "@/assets/product-belt.jpg";
import cufflinks from "@/assets/product-cufflinks.jpg";

export type ProductCategory = "ternos" | "camisaria" | "calcados" | "acessorios";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  image: string;
  tagline?: string;
}

export const products: Product[] = [
  {
    id: "terno-marinho-classico",
    name: "Terno Marinho Clássico",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 4890,
    image: suit,
    tagline: "Lã Super 130's italiana",
  },
  {
    id: "sapato-oxford-couro",
    name: "Sapato Oxford Havana",
    category: "calcados",
    categoryLabel: "Calçados",
    price: 2190,
    image: oxford,
    tagline: "Couro bovino Goodyear welted",
  },
  {
    id: "gravata-seda-marinho",
    name: "Gravata de Seda Marinho",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 590,
    image: tie,
    tagline: "Seda pura tecida em Como",
  },
  {
    id: "camisa-social-branca",
    name: "Camisa Social Alvo",
    category: "camisaria",
    categoryLabel: "Camisaria",
    price: 690,
    image: shirt,
    tagline: "Algodão egípcio 120 fios",
  },
  {
    id: "cinto-couro-marrom",
    name: "Cinto Couro Marrom",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 890,
    image: belt,
    tagline: "Couro vegetal com fivela banhada",
  },
  {
    id: "abotoaduras-prata",
    name: "Abotoaduras em Prata",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 1290,
    image: cufflinks,
    tagline: "Prata 925 lapidada à mão",
  },
];

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
