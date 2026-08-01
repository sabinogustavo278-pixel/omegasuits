import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoleForUser } from "@/lib/user-role";
import heroImg from "@/assets/hero-tailoring.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Omega Suits" },
      { name: "description", content: "Acesse sua conta Omega Suits." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome },
            emailRedirectTo:
              typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        // Sem dupla confirmação: entra direto após criar a conta.
        if (!data.session) {
          const signIn = await supabase.auth.signInWithPassword({ email, password });
          if (signIn.error) {
            setInfo(
              "Conta criada. Se o acesso não abrir automaticamente, entre com seu e-mail e senha.",
            );
            setMode("signin");
            return;
          }
          await routeByRole(signIn.data.user.id);
          return;
        }
        await routeByRole(data.user!.id);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await routeByRole(data.user.id);
      }
    } catch (err) {
      setError((err as Error).message ?? "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  async function routeByRole(userId: string) {
    const role = await fetchRoleForUser(userId);
    if (role === "admin" || role === "gerente") {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/meus-pedidos" });
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-charcoal md:block">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/50 to-charcoal/90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-3xl tracking-[0.2em]">OMEGA</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.5em] text-accent">
              Suits · Est. 1962
            </span>
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Ateliê</p>
            <p className="mt-4 max-w-md font-serif text-3xl leading-tight">
              “O bem vestir é a linguagem discreta de quem sabe onde deseja chegar.”
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center bg-background px-6 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 flex flex-col items-center leading-none md:hidden">
            <span className="font-serif text-2xl tracking-[0.2em] text-foreground">OMEGA</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.5em] text-accent">
              Suits
            </span>
          </Link>

          <p className="text-[10px] uppercase tracking-[0.4em] text-accent">
            {mode === "signup" ? "Nova conta" : "Bem-vindo"}
          </p>
          <h1 className="mt-3 font-serif text-4xl text-foreground">
            {mode === "signup" ? "Crie sua conta" : "Acesse sua conta"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Cadastre-se para acompanhar pedidos, provas e peças reservadas."
              : "Entre para acompanhar seus pedidos, provas e peças reservadas."}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {mode === "signup" ? (
              <div>
                <label
                  htmlFor="nome"
                  className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  placeholder="Seu nome completo"
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                placeholder="voce@omegasuits.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="border border-red-600/30 bg-red-500/10 px-4 py-3 text-xs text-red-700">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-foreground">
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-foreground bg-foreground py-4 text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60"
            >
              {loading
                ? "Aguarde…"
                : mode === "signup"
                  ? "Criar conta"
                  : "Entrar"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
                setInfo(null);
              }}
              className="hover:text-foreground"
            >
              {mode === "signup" ? "Já tenho conta" : "Criar conta"}
            </button>
            <Link to="/" className="hover:text-foreground">
              ← Voltar à loja
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
