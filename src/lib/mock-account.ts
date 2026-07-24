import { useEffect, useState } from "react";

const AVATAR_KEY = "omega_avatar";
const PASSWORD_KEY = "omega_password";
const EVT = "omega_account_change";

export function getAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AVATAR_KEY);
}

export function setAvatar(dataUrl: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AVATAR_KEY, dataUrl);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function clearAvatar() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AVATAR_KEY);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getPassword(): string {
  if (typeof window === "undefined") return "omega#2026";
  return window.localStorage.getItem(PASSWORD_KEY) ?? "omega#2026";
}

export function setPassword(pw: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSWORD_KEY, pw);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useAvatar(): string | null {
  const [avatar, setState] = useState<string | null>(null);
  useEffect(() => {
    setState(getAvatar());
    const h = () => setState(getAvatar());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return avatar;
}
