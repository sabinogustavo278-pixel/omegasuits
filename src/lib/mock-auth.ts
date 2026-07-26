import { useEffect, useState } from "react";

const KEY = "omega_auth";
const EVT = "omega_auth_change";

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
};

export const signIn = () => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, "1");
    window.dispatchEvent(new CustomEvent(EVT));
  }
};

export const signOut = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(EVT));
  }
};

export function useIsAuthenticated(): boolean {
  const [auth, setAuth] = useState(false);
  useEffect(() => {
    const sync = () => setAuth(isAuthenticated());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return auth;
}
