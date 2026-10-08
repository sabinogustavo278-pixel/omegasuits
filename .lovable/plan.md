## 1. Envio do GitHub
- Pelo seu print, o envio alterou apenas o README (texto de apresentação). Nenhum código foi trocado, então não é preciso restaurar nada. O aviso laranja pode ser dispensado.
- Vou só confirmar que o site abre e conecta ao banco da loja normalmente.

## 2. Senhas vazadas
- Ignorado: recurso exclusivo do plano Pro do Supabase.

## 3. Funções internas
- Retirar de usuários logados a permissão de chamar diretamente as funções internas sinalizadas que não precisam disso.
- Funções usadas pelas regras de acesso (verificação de cargo) continuam funcionando; o aviso delas fica registrado como aceito, com justificativa.
- Conferir login, painel e checkout depois.

## 4. Atualização dos pacotes (16 avisos)
- Atualizar só as versões dos pacotes com falhas conhecidas, sem trocar bibliotecas nem mudar telas ou o fluxo de compra.
- Conferir que o site compila e abre normalmente.

## Detalhes técnicos
- Consultar `pg_proc`/grants das funções SECURITY DEFINER; `REVOKE EXECUTE ... FROM authenticated` nas que são só gatilhos; manter `has_profile`/`is_admin_or_gerente`/`list_meus_pedidos`/`list_pedidos_cliente` (usadas em RLS/RPC).
- Pacotes: `security--dependency_scan`, atualizar dentro da mesma versão principal, marcar achados como resolvidos.
