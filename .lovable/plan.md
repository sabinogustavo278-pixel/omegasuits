## Criar os 4 buckets públicos

Vou tentar novamente criar os buckets como públicos agora:

1. `fornecedores` — logos
2. `produtos` — imagem principal + galeria
3. `categorias` — banners
4. `clientes` — avatares

Se a política `cloud_block_public_buckets` ainda estiver ativa, os tools falharão de novo com `public_buckets_blocked` e vou avisar. Se estiver liberada, os 4 são criados públicos e as policies de escrita restritas a Admin/Gerente (já aplicadas na migration anterior) passam a valer.
