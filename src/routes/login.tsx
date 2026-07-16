import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/mock-auth";
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

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    signIn();
    navigate({ to: "/dashboard" });
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

          <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Bem-vindo</p>
          <h1 className="mt-3 font-serif text-4xl text-foreground">Acesse sua conta</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre para acompanhar seus pedidos, provas e peças reservadas.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full border border-foreground bg-foreground py-4 text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-transparent hover:text-foreground"
            >
              Entrar
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Esqueci a senha
            </a>
            <a href="#" className="hover:text-foreground">
              Criar conta
            </a>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              ← Voltar à loja
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
