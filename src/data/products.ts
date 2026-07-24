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
    id: "terno-transpassado-marinho",
    name: "Terno Transpassado Azul Marinho",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 5290,
    image: suit,
    tagline: "Corte double-breasted, seis botões",
  },
  {
    id: "terno-transpassado-preto",
    name: "Terno Transpassado Preto",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 5390,
    image: suit,
    tagline: "Lã fria mescla noturna",
  },
  {
    id: "terno-italiano-colete-preto",
    name: "Terno Italiano com Colete Preto",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 5790,
    image: suit,
    tagline: "Caimento italiano, três peças",
  },
  {
    id: "terno-italiano-colete-marinho",
    name: "Terno Italiano com Colete Azul Marinho",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 5790,
    image: suit,
    tagline: "Caimento italiano, três peças",
  },
  {
    id: "terno-italiano-colete-cinza",
    name: "Terno Italiano com Colete Cinza Claro",
    category: "ternos",
    categoryLabel: "Ternos",
    price: 5690,
    image: suit,
    tagline: "Caimento italiano, três peças",
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
    id: "sapato-loafer-preto",
    name: "Sapato Loafer Preto",
    category: "calcados",
    categoryLabel: "Calçados",
    price: 2090,
    image: oxford,
    tagline: "Couro polido, sola de couro",
  },
  {
    id: "sapato-oxford-marrom-cafe",
    name: "Sapato Oxford Marrom Café",
    category: "calcados",
    categoryLabel: "Calçados",
    price: 2290,
    image: oxford,
    tagline: "Couro envelhecido à mão",
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
    id: "gravata-seda-detalhes-amarela",
    name: "Gravata de Seda com Detalhes Amarela",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 640,
    image: tie,
    tagline: "Padronagem em jacquard",
  },
  {
    id: "gravata-seda-detalhes-marrom",
    name: "Gravata de Seda com Detalhes Marrom",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 640,
    image: tie,
    tagline: "Padronagem em jacquard",
  },
  {
    id: "gravata-seda-detalhes-verde",
    name: "Gravata de Seda com Detalhes Verde",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 640,
    image: tie,
    tagline: "Padronagem em jacquard",
  },
  {
    id: "gravata-seda-detalhes-vermelha",
    name: "Gravata de Seda com Detalhes Vermelha",
    category: "acessorios",
    categoryLabel: "Acessórios",
    price: 640,
    image: tie,
    tagline: "Padronagem em jacquard",
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
