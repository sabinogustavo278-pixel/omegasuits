## Criar os 4 buckets como públicos

Tentei criar `fornecedores` com `public: true` primeiro e o workspace rejeitou com `public_buckets_blocked` — existe uma política de segurança do workspace (`cloud_block_public_buckets`) que bloqueia qualquer bucket público. Sem desativar essa política, o tool retorna erro antes mesmo de criar o bucket, não é algo que eu consiga contornar por SQL ou por outro tool.

### Ação necessária de você (uma vez)

No workspace do Lovable: **Settings → Privacy & Security → desabilitar "Block public buckets"** (só admin/owner do workspace consegue).

### O que eu faço em seguida

Assim que a política estiver desativada, na próxima mensagem eu executo, em sequência:

1. `supabase--storage_create_bucket` para `fornecedores`, `produtos`, `categorias`, `clientes` — todos com `public: true`.
2. Confirmação de que aparecem no dashboard.

As policies de escrita em `storage.objects` (INSERT/UPDATE/DELETE restritas a Admin/Gerente) já foram aplicadas na migration anterior, então não precisam ser recriadas — só faltam os buckets.

Me confirma quando tiver liberado a política que eu crio os 4 buckets públicos.
