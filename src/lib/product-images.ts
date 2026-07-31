import ternoMarinho from "@/assets/p-terno-marinho.jpg";
import ternoTranspassadoPreto from "@/assets/p-terno-transpassado-preto.jpg";
import ternoTranspassadoMarinho from "@/assets/p-terno-transpassado-marinho.jpg";
import ternoColeteCinza from "@/assets/p-terno-colete-cinza.jpg";
import ternoColetePreto from "@/assets/p-terno-colete-preto.jpg";
import ternoColeteMarinho from "@/assets/p-terno-colete-marinho.jpg";
import camisaBranca from "@/assets/p-camisa-branca.jpg";
import camisaSocialAzul from "@/assets/p-camisa-social-azul.jpg";
import camisaSocialListrada from "@/assets/p-camisa-social-listrada.jpg";
import oxfordHavana from "@/assets/p-oxford-havana.jpg";
import oxfordCafe from "@/assets/p-oxford-cafe.jpg";
import loaferPreto from "@/assets/p-loafer-preto.jpg";
import gravataMarinho from "@/assets/p-gravata-marinho.jpg";
import gravataAmarela from "@/assets/p-gravata-amarela.jpg";
import gravataMarrom from "@/assets/p-gravata-marrom.jpg";
import gravataVerde from "@/assets/p-gravata-verde.jpg";
import gravataVermelha from "@/assets/p-gravata-vermelha.jpg";
import cintoMarrom from "@/assets/p-cinto-marrom.jpg";
import cintoPreto from "@/assets/p-cinto-preto.jpg";
import abotoaduras from "@/assets/p-abotoaduras.jpg";

const norm = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Imagem de catálogo escolhida pelo nome/cor da peça. Usada apenas quando o
 * produto ainda não tem `imagem_url` no banco — assim que a foto real é
 * enviada ao bucket, ela assume o lugar automaticamente.
 */
export function fallbackImage(name: string, cor?: string | null): string {
  const n = norm(`${name} ${cor ?? ""}`);
  const has = (...terms: string[]) => terms.every((t) => n.includes(norm(t)));

  if (n.includes("abotoadura")) return abotoaduras;
  if (n.includes("cinto")) return has("cinto", "preto") ? cintoPreto : cintoMarrom;
  if (n.includes("gravata")) {
    if (n.includes("amarel")) return gravataAmarela;
    if (n.includes("marrom")) return gravataMarrom;
    if (n.includes("verde")) return gravataVerde;
    if (n.includes("vermelh")) return gravataVermelha;
    return gravataMarinho;
  }
  if (n.includes("loafer")) return loaferPreto;
  if (n.includes("oxford") || n.includes("sapato")) {
    if (n.includes("cafe") || n.includes("marrom")) return oxfordCafe;
    if (n.includes("preto")) return loaferPreto;
    return oxfordHavana;
  }
  if (n.includes("camiseta")) return n.includes("listr") ? camisetaListras : camisetaAzul;
  if (n.includes("camisa")) return camisaBranca;
  if (n.includes("colete")) {
    if (n.includes("cinza")) return ternoColeteCinza;
    if (n.includes("preto")) return ternoColetePreto;
    return ternoColeteMarinho;
  }
  if (n.includes("transpassado")) {
    return n.includes("preto") ? ternoTranspassadoPreto : ternoTranspassadoMarinho;
  }
  return ternoMarinho;
}
