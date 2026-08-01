## O que eu verifiquei antes de planejar

- A rota `/api/public/stripe/webhook` **já existe** (`src/routes/api/public/stripe/webhook.ts`) e está registrada na árvore de rotas. Ou seja, o código do webhook não está faltando.
- Chamando a rota localmente, ela responde **503 "Stripe não configurado"** (não 404). Isso acontece porque ela lê as chaves do Stripe usando a credencial administrativa do banco, e essa leitura está falhando no ambiente do servidor.
- Na tabela `stripe_config` existe 1 registro com Secret Key (107 caracteres) e Webhook Secret (38 caracteres) preenchidos — então o problema não é falta de chave cadastrada.
- O projeto **não está publicado** (não há URL de produção). Se no painel do Stripe a URL aponta para o endereço de preview ou para uma URL de Edge Function do Supabase, o retorno 404 é esperado.

Conclusão: o 404 vem da URL configurada no Stripe / ausência de publicação; o 503 é um problema real de leitura das chaves. Vou tratar os dois.

## 1. Webhook estável

- Trocar a fonte do Webhook Secret e da Secret Key: ler primeiro dos secrets do projeto (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) e só cair para a tabela `stripe_config` como alternativa. Assim o webhook deixa de depender da credencial administrativa do banco para simplesmente validar a assinatura.
- Deixar de responder 503 quando a configuração falha: registrar o erro em log e responder de forma que o Stripe reenvie o evento (retentativa), em vez de descartar.
- Confirmar o tratamento do evento `checkout.session.completed`: validar assinatura (HMAC com comparação segura + janela de 5 minutos), localizar o pedido por `metadata.pedido_id`/`client_reference_id`, marcar como pago, registrar em `pagamentos` com status aprovado e deixar o gatilho do banco dar baixa no estoque. Isso já existe e será mantido; ajusto apenas idempotência e logs.
- Publicar o projeto e indicar a URL estável correta para colar no Stripe: `https://project--efefb465-9a69-40cb-8119-47682c3fd370.lovable.app/api/public/stripe/webhook`.
- Testar com um POST assinado localmente para provar que assinatura válida → 200 e pedido aprovado; assinatura inválida → 401.

## 2. Auditoria (somente leitura, sem mudar o fluxo de compra)

Revisão de: uso do cliente administrativo do Supabase (onde ele é usado sem necessidade), políticas de acesso das tabelas sensíveis (`stripe_config`, `pagamentos`, `clientes`, `user_profiles`), rotas públicas, validação de entrada nas funções de servidor, chaves expostas no frontend e vazamento de módulos de servidor para o pacote do navegador. Também rodo o linter de segurança do banco.

Entrego um relatório curto no chat, separando: (a) corrigido agora, (b) recomendado mas fora de escopo por mexer no fluxo de compra.

## 3. Melhorias pontuais (baixo risco)

Aplico apenas o que não altera comportamento visível de compra/navegação:

- Nunca retornar valores de chaves do Stripe ao navegador (confirmar mascaramento em todos os caminhos).
- Endurecer a validação de entrada nas funções de servidor que ainda aceitam dados sem checagem de tipo/limite.
- Garantir que módulos com credenciais de servidor sejam sempre importados dentro dos handlers.
- Ajustes de performance sem efeito funcional: seleção de colunas específicas em consultas que hoje trazem tudo, e remoção de consultas inúteis (ex.: uma contagem descartada na geração de número de pedido).

Não vou tocar em: `checkout.dados.tsx`, criação de sessão do Stripe, carrinho, seletor de tamanhos, redirecionamentos de login ou navegação da vitrine.

## Detalhes técnicos

- `src/lib/checkout.server.ts`: `getStripeKeys()` passa a priorizar `process.env` (lido dentro do handler) com fallback para `stripe_config`.
- `src/routes/api/public/stripe/webhook.ts`: mantém verificação HMAC com `timingSafeEqual`; troca 503 por 500 nos casos de configuração para habilitar retentativa do Stripe; adiciona guarda de idempotência antes de inserir em `pagamentos`.
- Se as chaves passarem a vir de secrets, peço a você para salvá-las pelo formulário seguro (não vou pedir que cole valores no chat).
- Verificação final: `tsgo` + POST assinado contra o servidor local.
