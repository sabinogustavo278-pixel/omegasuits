export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          categoria_pai_id: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          ordem: number | null
          slug: string | null
          status: string
          updated_at: string
        }
        Insert: {
          categoria_pai_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          ordem?: number | null
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          categoria_pai_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          ordem?: number | null
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          imagem_url: string | null
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          total_pedidos: number
          ultima_compra: string | null
          updated_at: string
          user_id: string | null
          valor_total_gasto: number
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          total_pedidos?: number
          ultima_compra?: string | null
          updated_at?: string
          user_id?: string | null
          valor_total_gasto?: number
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          total_pedidos?: number
          ultima_compra?: string | null
          updated_at?: string
          user_id?: string | null
          valor_total_gasto?: number
        }
        Relationships: []
      }
      empresa_config: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          logo_url: string | null
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          id: string
          localizacao: string | null
          produto_id: string
          quantidade: number
          quantidade_minima: number
          ultima_movimentacao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          localizacao?: string | null
          produto_id: string
          quantidade?: number
          quantidade_minima?: number
          ultima_movimentacao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          localizacao?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_minima?: number
          ultima_movimentacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          created_at: string
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          referencia_id: string | null
          tipo: string
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id: string
          quantidade: number
          referencia_id?: string | null
          tipo: string
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          referencia_id?: string | null
          tipo?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          categoria: string | null
          cep: string | null
          cidade: string | null
          cnpj: string
          contato_nome: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          imagem_url: string | null
          inscricao_estadual: string | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem_url?: string | null
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagem_url?: string | null
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_pagamento: string
          id: string
          metodo: string | null
          moeda: string
          observacoes: string | null
          pedido_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string
          id?: string
          metodo?: string | null
          moeda?: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string
          id?: string
          metodo?: string | null
          moeda?: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_venda"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          condicao_pagamento: string | null
          created_at: string
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          data_pedido: string | null
          estoque_aplicado: boolean
          fornecedor_id: string | null
          id: string
          numero: string | null
          observacoes: string | null
          status: string
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          condicao_pagamento?: string | null
          created_at?: string
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido?: string | null
          estoque_aplicado?: boolean
          fornecedor_id?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          condicao_pagamento?: string | null
          created_at?: string
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido?: string | null
          estoque_aplicado?: boolean
          fornecedor_id?: string | null
          id?: string
          numero?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra_itens: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_venda: {
        Row: {
          cep_entrega: string | null
          cidade_entrega: string | null
          cliente_id: string | null
          created_at: string
          data_pedido: string
          desconto: number | null
          endereco_entrega: string | null
          estado_entrega: string | null
          estoque_baixado: boolean
          frete: number | null
          id: string
          metodo_pagamento: string | null
          numero: string | null
          observacoes: string | null
          status: string
          status_entrega: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number | null
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          cep_entrega?: string | null
          cidade_entrega?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pedido?: string
          desconto?: number | null
          endereco_entrega?: string | null
          estado_entrega?: string | null
          estoque_baixado?: boolean
          frete?: number | null
          id?: string
          metodo_pagamento?: string | null
          numero?: string | null
          observacoes?: string | null
          status?: string
          status_entrega?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number | null
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          cep_entrega?: string | null
          cidade_entrega?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pedido?: string
          desconto?: number | null
          endereco_entrega?: string | null
          estado_entrega?: string | null
          estoque_baixado?: boolean
          frete?: number | null
          id?: string
          metodo_pagamento?: string | null
          numero?: string | null
          observacoes?: string | null
          status?: string
          status_entrega?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number | null
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_venda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_venda_itens: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_venda_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_venda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria_id: string | null
          cor: string | null
          created_at: string
          custo: number | null
          descricao: string | null
          destaque: boolean
          fornecedor_id: string | null
          id: string
          imagem_url: string | null
          material: string | null
          nome: string
          peso: number | null
          preco: number | null
          preco_promocional: number | null
          sku: string | null
          status: string
          tamanho: string | null
          updated_at: string
        }
        Insert: {
          categoria_id?: string | null
          cor?: string | null
          created_at?: string
          custo?: number | null
          descricao?: string | null
          destaque?: boolean
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          material?: string | null
          nome: string
          peso?: number | null
          preco?: number | null
          preco_promocional?: number | null
          sku?: string | null
          status?: string
          tamanho?: string | null
          updated_at?: string
        }
        Update: {
          categoria_id?: string | null
          cor?: string | null
          created_at?: string
          custo?: number | null
          descricao?: string | null
          destaque?: boolean
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          material?: string | null
          nome?: string
          peso?: number | null
          preco?: number | null
          preco_promocional?: number | null
          sku?: string | null
          status?: string
          tamanho?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_imagens: {
        Row: {
          created_at: string
          id: string
          imagem_url: string
          ordem: number
          produto_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url: string
          ordem?: number
          produto_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string
          ordem?: number
          produto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_permissions: {
        Row: {
          created_at: string
          id: string
          permissao: string
          profile_id: string
          rota: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissao: string
          profile_id: string
          rota: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permissao?: string
          profile_id?: string
          rota?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_config: {
        Row: {
          created_at: string
          id: string
          modo_teste: boolean
          publishable_key: string
          secret_key: string
          updated_at: string
          webhook_secret: string
        }
        Insert: {
          created_at?: string
          id?: string
          modo_teste?: boolean
          publishable_key?: string
          secret_key?: string
          updated_at?: string
          webhook_secret?: string
        }
        Update: {
          created_at?: string
          id?: string
          modo_teste?: boolean
          publishable_key?: string
          secret_key?: string
          updated_at?: string
          webhook_secret?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          profile_id: string
          status: string
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          profile_id: string
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          profile_id?: string
          status?: string
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dashboard_metrics: {
        Args: never
        Returns: {
          pedidos_compra_abertos: number
          pedidos_venda_pendentes: number
          skus_criticos: number
          skus_ruptura: number
          total_clientes: number
          total_fornecedores: number
          total_produtos: number
          valor_compras_abertas: number
        }[]
      }
      faturamento_por_mes: {
        Args: never
        Returns: {
          mes: string
          pedidos: number
          rotulo: string
          total: number
        }[]
      }
      get_empresa_config: {
        Args: never
        Returns: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          logo_url: string | null
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "empresa_config"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_stripe_config: {
        Args: never
        Returns: {
          id: string
          modo_teste: boolean
          publishable_key: string
          secret_key_mask: string
          tem_secret_key: boolean
          tem_webhook_secret: boolean
          updated_at: string
          webhook_secret_mask: string
        }[]
      }
      has_profile: {
        Args: { _profile_name: string; _user_id: string }
        Returns: boolean
      }
      is_admin_or_gerente: { Args: never; Returns: boolean }
      list_categorias: {
        Args: never
        Returns: {
          categoria_pai: string
          categoria_pai_id: string
          created_at: string
          descricao: string
          id: string
          imagem_url: string
          nome: string
          ordem: number
          slug: string
          status: string
          total_produtos: number
        }[]
      }
      list_clientes: {
        Args: never
        Returns: {
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          imagem_url: string | null
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          total_pedidos: number
          ultima_compra: string | null
          updated_at: string
          user_id: string | null
          valor_total_gasto: number
        }[]
        SetofOptions: {
          from: "*"
          to: "clientes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_estoque: {
        Args: never
        Returns: {
          id: string
          imagem_url: string
          localizacao: string
          produto: string
          produto_id: string
          quantidade: number
          quantidade_minima: number
          situacao: string
          sku: string
          ultima_movimentacao: string
        }[]
      }
      list_fornecedores: {
        Args: never
        Returns: {
          categoria: string | null
          cep: string | null
          cidade: string | null
          cnpj: string
          contato_nome: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          imagem_url: string | null
          inscricao_estadual: string | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          status: string
          telefone: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "fornecedores"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_meus_pedidos: {
        Args: never
        Returns: {
          cep_entrega: string
          cidade_entrega: string
          data_pedido: string
          desconto: number
          endereco_entrega: string
          estado_entrega: string
          frete: number
          id: string
          itens: Json
          metodo_pagamento: string
          numero: string
          status: string
          status_entrega: string
          subtotal: number
          total_itens: number
          valor_total: number
        }[]
      }
      list_pagamentos: {
        Args: { _data_fim?: string; _data_inicio?: string; _status?: string }
        Returns: {
          cliente: string
          cliente_id: string
          created_at: string
          data_pagamento: string
          id: string
          imagem_url: string
          metodo: string
          moeda: string
          pedido: string
          pedido_id: string
          status: string
          stripe_payment_intent_id: string
          valor: number
        }[]
      }
      list_pedido_compra_itens: {
        Args: { _pedido_id: string }
        Returns: {
          id: string
          imagem_url: string
          preco_unitario: number
          produto: string
          produto_id: string
          quantidade: number
          sku: string
          subtotal: number
        }[]
      }
      list_pedidos_cliente: {
        Args: never
        Returns: {
          data_pedido: string
          desconto: number
          frete: number
          id: string
          metodo_pagamento: string
          numero: string
          status: string
          subtotal: number
          total_itens: number
          valor_total: number
        }[]
      }
      list_pedidos_compra: {
        Args: never
        Returns: {
          condicao_pagamento: string
          created_at: string
          data_entrega_prevista: string
          data_entrega_real: string
          data_pedido: string
          fornecedor: string
          fornecedor_id: string
          id: string
          numero: string
          observacoes: string
          status: string
          total_itens: number
          valor_total: number
        }[]
      }
      list_pedidos_venda: {
        Args: never
        Returns: {
          cliente: string
          cliente_id: string
          data_pedido: string
          desconto: number
          frete: number
          id: string
          metodo_pagamento: string
          numero: string
          status: string
          subtotal: number
          total_itens: number
          valor_total: number
        }[]
      }
      list_produto_imagens: {
        Args: { _produto_id: string }
        Returns: {
          created_at: string
          id: string
          imagem_url: string
          ordem: number
          produto_id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "produtos_imagens"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_produtos: {
        Args: never
        Returns: {
          categoria: string
          categoria_id: string
          categoria_slug: string
          cor: string
          created_at: string
          custo: number
          descricao: string
          destaque: boolean
          estoque: number
          fornecedor: string
          fornecedor_id: string
          id: string
          imagem_url: string
          material: string
          nome: string
          peso: number
          preco: number
          preco_promocional: number
          sku: string
          status: string
          tamanho: string
        }[]
      }
      mask_secret: { Args: { _value: string }; Returns: string }
      produtos_por_mes: {
        Args: never
        Returns: {
          mes: string
          rotulo: string
          total: number
        }[]
      }
      proximo_numero_pedido_compra: {
        Args: { _fornecedor_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
