import { useSyncExternalStore } from "react";
import { type Product } from "@/data/products";

export interface CartItem {
  productId: string;
  size: string;
  qty: number;
  /** Snapshot do produto no momento em que foi adicionado à sacola. */
  name: string;
  categoryLabel: string;
  price: number;
  image: string;
}

const KEY = "omega:cart";
const EVT = "omega_cart_change";

const lineKey = (productId: string, size: string) => `${productId}::${size}`;

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed)
      ? parsed.filter((i) => i && i.productId && i.qty > 0 && typeof i.price === "number")
      : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

let cache: CartItem[] = read();
let cacheKey = "";
function currentSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cache;
  const raw = window.localStorage.getItem(KEY) ?? "";
  if (raw !== cacheKey) {
    cacheKey = raw;
    cache = read();
  }
  return cache;
}

export function addToCart(product: Product, size: string, qty = 1) {
  const items = read();
  const idx = items.findIndex((i) => lineKey(i.productId, i.size) === lineKey(product.id, size));
  if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
  else
    items.push({
      productId: product.id,
      size,
      qty,
      name: product.name,
      categoryLabel: product.categoryLabel,
      price: product.price,
      image: product.image,
    });
  write(items);
}

export function updateQty(productId: string, size: string, qty: number) {
  const items = read()
    .map((i) =>
      lineKey(i.productId, i.size) === lineKey(productId, size) ? { ...i, qty } : i,
    )
    .filter((i) => i.qty > 0);
  write(items);
}

export function removeFromCart(productId: string, size: string) {
  write(read().filter((i) => lineKey(i.productId, i.size) !== lineKey(productId, size)));
}

export function clearCart() {
  write([]);
}

export interface CartEntry extends CartItem {
  key: string;
  subtotal: number;
}

export function getEntries(items: CartItem[]): CartEntry[] {
  return items.map((i) => ({
    ...i,
    key: lineKey(i.productId, i.size),
    subtotal: i.price * i.qty,
  }));
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, currentSnapshot, () => cache);
  const entries = getEntries(items);
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const subtotal = entries.reduce((s, e) => s + e.subtotal, 0);
  return { items, entries, count, subtotal };
}
