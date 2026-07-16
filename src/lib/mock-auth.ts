const KEY = "omega_auth";

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
};

export const signIn = () => {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, "1");
};

export const signOut = () => {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
};
