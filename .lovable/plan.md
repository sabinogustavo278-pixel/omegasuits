# Plano — Omega Suits

Landing page + catálogo + login + dashboard, com dados mockados (sem backend/banco).

## Rotas (TanStack Router)

- `src/routes/index.tsx` — Landing (header + hero + grid de produtos + footer).
- `src/routes/ternos.tsx`, `camisaria.tsx`, `calcados.tsx`, `acessorios.tsx` — Catálogos por categoria (mesma grade, dados filtrados).
- `src/routes/login.tsx` — Página de login (mock; salva flag em localStorage e redireciona a `/dashboard`).
- `src/routes/dashboard.tsx` — Área da conta do cliente (mock).

Guarda simples: `dashboard.tsx` verifica flag mock no `beforeLoad` client-side; se ausente, redireciona a `/login`. Sem Supabase.

## Estrutura visual

### Design system (src/styles.css)
- Paleta em oklch:
  - Azul marinho profundo (primária), preto, cinza escuro, branco/off-white, dourado sutil como accent.
- Tipografia via `<link>` em `__root.tsx`:
  - Títulos: **Cormorant Garamond** (serif elegante).
  - Corpo: **Inter** (sans-serif limpa).
- Tokens: `--primary` (marinho), `--accent` (dourado), `--background` (off-white), `--foreground` (grafite), `--muted`.

### Componentes reutilizáveis (`src/components/`)
- `SiteHeader.tsx` — logo "OMEGA SUITS" serifado + nav (Ternos, Camisaria, Calçados, Acessórios) + ícone conta (link `/login` ou `/dashboard`).
- `SiteFooter.tsx` — rodapé minimalista (marca, colunas curtas, copyright).
- `ProductCard.tsx` — foto (aspect ratio retrato), nome, preço em BRL, hover sutil.
- `HeroSection.tsx` — título elegante, subtítulo, botão "Ver Coleção".
- `data/products.ts` — array mock (Terno Marinho, Sapato Oxford, Gravata de Seda, + 3 extras para preencher a grade).

### Landing (`/`)
1. Header
2. Hero em tela cheia com imagem elegante de alfaiataria (gerada via imagegen) + CTA "Ver Coleção" → `/ternos`.
3. Seção "Nova Coleção" — grade 3 colunas (6 produtos mock).
4. Faixa editorial curta ("Alfaiataria sob medida desde…").
5. Footer.

### Catálogos (`/ternos`, etc.)
- Header + título da categoria + grid de produtos mock + footer.

### Login (`/login`)
- Layout centralizado, split ou card único sobre fundo escuro.
- Campos email/senha + botão "Entrar". No submit: `localStorage.setItem('omega_auth','1')` e navigate `/dashboard`.
- Link "Criar conta" (não funcional, apenas visual).

### Dashboard (`/dashboard`)
- Header + saudação "Olá, Cliente".
- Cards: Pedidos recentes (mock: 2-3 pedidos), Endereço de entrega, Wishlist, Dados da conta.
- Botão "Sair" → limpa flag e volta a `/`.

## Imagens
Gerar via `imagegen--generate_image` em `src/assets/`:
- `hero-tailoring.jpg` — foto editorial de alfaiataria.
- `product-suit.jpg`, `product-oxford.jpg`, `product-tie.jpg`, `product-shirt.jpg`, `product-belt.jpg`, `product-cufflinks.jpg`.

## SEO
- `__root.tsx`: título "Omega Suits — Alfaiataria Clássica Masculina" + description + og.
- Cada rota com `head()` próprio.

## Fora do escopo
- Sem Lovable Cloud/Supabase, sem carrinho funcional, sem checkout, sem persistência real. Tudo mockado.