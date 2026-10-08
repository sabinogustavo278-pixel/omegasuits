## 1. Restaurar a versão estável
A restauração não pode ser feita por mim escrevendo código (isso misturaria versões). Você faz em 2 cliques:
- Abra o Histórico (botão abaixo) e escolha a última versão da Lovable de antes do envio do GitHub (antes da mensagem "Preciso que você arrume esses erros..."), ou clique no botão de reverter abaixo dessa mensagem no chat.
- Depois, eu confiro se o site está conectado ao banco certo da loja.

## 2. Senhas vazadas
- Ignorado: recurso exclusivo do plano Pro do Supabase. Fica registrado como limitação aceita.

## 3. Funções internas
- Retirar de usuários logados a permissão de chamar diretamente as 4 funções internas sinalizadas, mantendo as que o próprio site usa (ex.: verificação de cargo usada pelas regras de acesso) funcionando via regras do banco.
- Conferir login, painel e checkout após a mudança.

## 4. Atualização dos pacotes (16 avisos)
- Atualizar apenas as versões dos pacotes com falhas conhecidas, sem trocar bibliotecas nem mudar telas ou o fluxo de compra.
- Conferir que o site compila e abre normalmente.

## Detalhes técnicos
- Listar funções SECURITY DEFINER com EXECUTE para `authenticated`; revogar das que são apenas gatilhos/internas. Para `has_role`/funções usadas em RLS ou chamadas via RPC pelo app, manter EXECUTE (necessário) e marcar o aviso como aceito com justificativa.
- Pacotes: `security--dependency_scan`, então `bun update` dos afetados dentro da mesma versão principal; marcar achados como resolvidos.
- Executar somente após a restauração, para não aplicar mudanças sobre a versão errada.
