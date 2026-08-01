import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">404</p>
        <h1 className="mt-4 font-serif text-5xl text-foreground">Página não encontrada</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          A peça que você procura não está mais em nosso ateliê.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">Algo saiu do prumo</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Não foi possível carregar esta página. Tente novamente.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border border-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] transition-colors hover:bg-foreground hover:text-background"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="border border-border px-6 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Omega Suits — Alfaiataria masculina clássica" },
      {
        name: "description",
        content:
          "Ternos sob medida, camisaria fina, calçados Goodyear e acessórios em seda pura. Conheça a coleção Omega Suits.",
      },
      { name: "author", content: "Omega Suits" },
      { property: "og:title", content: "Omega Suits — Alfaiataria masculina clássica" },
      {
        property: "og:description",
        content: "Ternos sob medida, camisaria fina, calçados Goodyear e acessórios em seda pura. Conheça a coleção Omega Suits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Omega Suits — Alfaiataria masculina clássica" },
      { name: "twitter:description", content: "Ternos sob medida, camisaria fina, calçados Goodyear e acessórios em seda pura. Conheça a coleção Omega Suits." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/af82db34-5c04-4658-9523-8be56a2847bd/id-preview-9608108d--efefb465-9a69-40cb-8119-47682c3fd370.lovable.app-1785611538892.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/af82db34-5c04-4658-9523-8be56a2847bd/id-preview-9608108d--efefb465-9a69-40cb-8119-47682c3fd370.lovable.app-1785611538892.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (!active) return;
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED"
        ) {
          router.invalidate();
          if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
        }
      });
      return () => sub.subscription.unsubscribe();
    })();
    return () => {
      active = false;
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
