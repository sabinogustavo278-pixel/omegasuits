import { useSyncExternalStore } from "react";
import { products, type Product } from "@/data/products";

export interface CartItem {
  productId: string;
  qty: number;
}

const KEY = "omega:cart";
const EVT = "omega_cart_change";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.productId && i.qty > 0) : [];
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

// Cache to keep referential stability for useSyncExternalStore
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

export function addToCart(productId: string, qty = 1) {
  const items = read();
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
  else items.push({ productId, qty });
  write(items);
}

export function updateQty(productId: string, qty: number) {
  const items = read()
    .map((i) => (i.productId === productId ? { ...i, qty } : i))
    .filter((i) => i.qty > 0);
  write(items);
}

export function removeFromCart(productId: string) {
  write(read().filter((i) => i.productId !== productId));
}

export function clearCart() {
  write([]);
}

export interface CartEntry extends CartItem {
  product: Product;
  subtotal: number;
}

export function getEntries(items: CartItem[]): CartEntry[] {
  return items
    .map((i) => {
      const product = products.find((p) => p.id === i.productId);
      if (!product) return null;
      return { ...i, product, subtotal: product.price * i.qty };
    })
    .filter((e): e is CartEntry => !!e);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, currentSnapshot, () => cache);
  const entries = getEntries(items);
  const count = entries.reduce((s, e) => s + e.qty, 0);
  const subtotal = entries.reduce((s, e) => s + e.subtotal, 0);
  return { items, entries, count, subtotal };
}
