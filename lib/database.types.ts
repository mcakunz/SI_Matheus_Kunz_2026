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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      tb_categorias: {
        Row: {
          ativo: boolean
          categoria: string
          data_alteracao: string
          data_cadastro: string
          id: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          data_alteracao?: string
          data_cadastro?: string
          id?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          data_alteracao?: string
          data_cadastro?: string
          id?: number
        }
        Relationships: []
      }
      tb_cidades: {
        Row: {
          ativo: boolean
          cidade: string
          codigo_ibge: string
          data_alteracao: string
          data_cadastro: string
          estado_id: number
          id: number
        }
        Insert: {
          ativo?: boolean
          cidade: string
          codigo_ibge: string
          data_alteracao?: string
          data_cadastro?: string
          estado_id: number
          id?: number
        }
        Update: {
          ativo?: boolean
          cidade?: string
          codigo_ibge?: string
          data_alteracao?: string
          data_cadastro?: string
          estado_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_cidades_estado_id_fkey"
            columns: ["estado_id"]
            isOneToOne: false
            referencedRelation: "tb_estados"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_clientes: {
        Row: {
          apelido: string | null
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade_id: number
          cliente: string
          complemento: string | null
          condicao_pagamento_id: number
          cpf_cnpj: string
          data_alteracao: string
          data_cadastro: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado_civil: string | null
          id: number
          limite_credito: number
          numero: string | null
          observacao: string | null
          pais_id: number
          rg_inscricao_estadual: string | null
          sexo: string | null
          telefone: string | null
          tipo: string
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id: number
          cliente: string
          complemento?: string | null
          condicao_pagamento_id: number
          cpf_cnpj: string
          data_alteracao?: string
          data_cadastro?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          id?: number
          limite_credito?: number
          numero?: string | null
          observacao?: string | null
          pais_id: number
          rg_inscricao_estadual?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo: string
        }
        Update: {
          apelido?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number
          cliente?: string
          complemento?: string | null
          condicao_pagamento_id?: number
          cpf_cnpj?: string
          data_alteracao?: string
          data_cadastro?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          id?: number
          limite_credito?: number
          numero?: string | null
          observacao?: string | null
          pais_id?: number
          rg_inscricao_estadual?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_clientes_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "tb_cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_clientes_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_clientes_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_condicoes_pagamento: {
        Row: {
          ativo: boolean
          condicao_pagamento: string
          data_alteracao: string
          data_cadastro: string
          dias_entre_parcelas: number
          dias_primeira_parcela: number
          id: number
          numero_parcelas: number
          percentual_desconto: number
          percentual_juros: number
          percentual_multa: number
        }
        Insert: {
          ativo?: boolean
          condicao_pagamento: string
          data_alteracao?: string
          data_cadastro?: string
          dias_entre_parcelas?: number
          dias_primeira_parcela?: number
          id?: number
          numero_parcelas?: number
          percentual_desconto?: number
          percentual_juros?: number
          percentual_multa?: number
        }
        Update: {
          ativo?: boolean
          condicao_pagamento?: string
          data_alteracao?: string
          data_cadastro?: string
          dias_entre_parcelas?: number
          dias_primeira_parcela?: number
          id?: number
          numero_parcelas?: number
          percentual_desconto?: number
          percentual_juros?: number
          percentual_multa?: number
        }
        Relationships: []
      }
      tb_contas_pagar: {
        Row: {
          data_alteracao: string
          data_cadastro: string
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          forma_pagamento_id: number
          fornecedor_id: number
          id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes: string | null
          situacao: string
          total_parcelas: number
          valor_desconto: number
          valor_juros: number
          valor_multa: number
          valor_original: number
          valor_pago: number
          valor_total: number
        }
        Insert: {
          data_alteracao?: string
          data_cadastro?: string
          data_emissao: string
          data_pagamento?: string | null
          data_vencimento: string
          forma_pagamento_id: number
          fornecedor_id: number
          id?: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes?: string | null
          situacao?: string
          total_parcelas: number
          valor_desconto?: number
          valor_juros?: number
          valor_multa?: number
          valor_original: number
          valor_pago?: number
          valor_total: number
        }
        Update: {
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          forma_pagamento_id?: number
          fornecedor_id?: number
          id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          numero_parcela?: number
          observacoes?: string | null
          situacao?: string
          total_parcelas?: number
          valor_desconto?: number
          valor_juros?: number
          valor_multa?: number
          valor_original?: number
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_contas_pagar_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_contas_pagar_avulsa: {
        Row: {
          data_alteracao: string
          data_cadastro: string
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          desconto: number
          forma_pagamento_id: number
          fornecedor_id: number
          id: number
          juros: number
          modelo: string | null
          multa: number
          num_parcela: number
          numero_nota: string | null
          observacao: string | null
          serie: string | null
          situacao: string
          valor_pago: number
          valor_parcela: number
        }
        Insert: {
          data_alteracao?: string
          data_cadastro?: string
          data_emissao: string
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number
          forma_pagamento_id: number
          fornecedor_id: number
          id?: number
          juros?: number
          modelo?: string | null
          multa?: number
          num_parcela?: number
          numero_nota?: string | null
          observacao?: string | null
          serie?: string | null
          situacao?: string
          valor_pago?: number
          valor_parcela: number
        }
        Update: {
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number
          forma_pagamento_id?: number
          fornecedor_id?: number
          id?: number
          juros?: number
          modelo?: string | null
          multa?: number
          num_parcela?: number
          numero_nota?: string | null
          observacao?: string | null
          serie?: string | null
          situacao?: string
          valor_pago?: number
          valor_parcela?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_contas_pagar_avulsa_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_contas_pagar_avulsa_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_contas_receber: {
        Row: {
          cliente_id: number
          data_alteracao: string
          data_cadastro: string
          data_emissao: string
          data_recebimento: string | null
          data_vencimento: string
          forma_pagamento_id: number
          id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes: string | null
          situacao: string
          total_parcelas: number
          valor_desconto: number
          valor_juros: number
          valor_multa: number
          valor_original: number
          valor_recebido: number
          valor_total: number
        }
        Insert: {
          cliente_id: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao: string
          data_recebimento?: string | null
          data_vencimento: string
          forma_pagamento_id: number
          id?: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes?: string | null
          situacao?: string
          total_parcelas: number
          valor_desconto?: number
          valor_juros?: number
          valor_multa?: number
          valor_original: number
          valor_recebido?: number
          valor_total: number
        }
        Update: {
          cliente_id?: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          data_recebimento?: string | null
          data_vencimento?: string
          forma_pagamento_id?: number
          id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          numero_parcela?: number
          observacoes?: string | null
          situacao?: string
          total_parcelas?: number
          valor_desconto?: number
          valor_juros?: number
          valor_multa?: number
          valor_original?: number
          valor_recebido?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_contas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "tb_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_contas_receber_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_estados: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          estado: string
          id: number
          pais_id: number
          uf: string
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          estado: string
          id?: number
          pais_id: number
          uf: string
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          estado?: string
          id?: number
          pais_id?: number
          uf?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_estados_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_formas_pagamento: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          descricao: string
          forma_pagamento: string
          id: number
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          descricao: string
          forma_pagamento: string
          id?: number
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string
          forma_pagamento?: string
          id?: number
        }
        Relationships: []
      }
      tb_fornecedor_email: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          email: string
          fornecedor_id: number
          id: number
          principal: boolean
          tipo: string | null
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          email: string
          fornecedor_id: number
          id?: number
          principal?: boolean
          tipo?: string | null
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          email?: string
          fornecedor_id?: number
          id?: number
          principal?: boolean
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_fornecedor_email_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_fornecedor_telefone: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          fornecedor_id: number
          id: number
          principal: boolean
          telefone: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id: number
          id?: number
          principal?: boolean
          telefone: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id?: number
          id?: number
          principal?: boolean
          telefone?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_fornecedor_telefone_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_fornecedores: {
        Row: {
          apelido: string
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade_id: number
          complemento: string | null
          condicao_pagamento_id: number
          cpf_cnpj: string
          data_alteracao: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          fornecedor: string
          id: number
          limite_credito: number
          numero: string | null
          observacoes: string | null
          pais_id: number
          rg_inscricao_estadual: string | null
          telefone: string | null
          tipo: string
          transportadora_id: number | null
        }
        Insert: {
          apelido: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id: number
          complemento?: string | null
          condicao_pagamento_id: number
          cpf_cnpj: string
          data_alteracao?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          fornecedor: string
          id?: number
          limite_credito?: number
          numero?: string | null
          observacoes?: string | null
          pais_id: number
          rg_inscricao_estadual?: string | null
          telefone?: string | null
          tipo: string
          transportadora_id?: number | null
        }
        Update: {
          apelido?: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number
          complemento?: string | null
          condicao_pagamento_id?: number
          cpf_cnpj?: string
          data_alteracao?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          fornecedor?: string
          id?: number
          limite_credito?: number
          numero?: string | null
          observacoes?: string | null
          pais_id?: number
          rg_inscricao_estadual?: string | null
          telefone?: string | null
          tipo?: string
          transportadora_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_fornecedores_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "tb_cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_fornecedores_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_fornecedores_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_fornecedores_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_funcionarios: {
        Row: {
          apelido: string | null
          ativo: boolean
          bairro: string
          cep: string
          cidade_id: number
          cnh: string | null
          complemento: string | null
          cpf_cnpj: string
          data_admissao: string
          data_alteracao: string
          data_cadastro: string
          data_demissao: string | null
          data_nascimento: string
          data_validade_cnh: string | null
          email: string
          endereco: string
          estado_civil: string
          funcao_funcionario_id: number
          funcionario: string
          id: number
          numero: string
          observacao: string | null
          pais_id: number
          rg_inscricao_estadual: string | null
          salario: number
          sexo: string
          telefone: string
          tipo: string
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean
          bairro: string
          cep: string
          cidade_id: number
          cnh?: string | null
          complemento?: string | null
          cpf_cnpj: string
          data_admissao: string
          data_alteracao?: string
          data_cadastro?: string
          data_demissao?: string | null
          data_nascimento: string
          data_validade_cnh?: string | null
          email: string
          endereco: string
          estado_civil: string
          funcao_funcionario_id: number
          funcionario: string
          id?: number
          numero: string
          observacao?: string | null
          pais_id: number
          rg_inscricao_estadual?: string | null
          salario: number
          sexo: string
          telefone: string
          tipo?: string
        }
        Update: {
          apelido?: string | null
          ativo?: boolean
          bairro?: string
          cep?: string
          cidade_id?: number
          cnh?: string | null
          complemento?: string | null
          cpf_cnpj?: string
          data_admissao?: string
          data_alteracao?: string
          data_cadastro?: string
          data_demissao?: string | null
          data_nascimento?: string
          data_validade_cnh?: string | null
          email?: string
          endereco?: string
          estado_civil?: string
          funcao_funcionario_id?: number
          funcionario?: string
          id?: number
          numero?: string
          observacao?: string | null
          pais_id?: number
          rg_inscricao_estadual?: string | null
          salario?: number
          sexo?: string
          telefone?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_funcionarios_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "tb_cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_funcionarios_funcao_funcionario_id_fkey"
            columns: ["funcao_funcionario_id"]
            isOneToOne: false
            referencedRelation: "tb_funcoes_funcionario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_funcionarios_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_funcoes_funcionario: {
        Row: {
          ativo: boolean
          carga_horaria: number
          data_alteracao: string
          data_cadastro: string
          descricao: string | null
          funcao_funcionario: string
          id: number
          observacao: string | null
          requer_cnh: boolean
          salario_base: number
        }
        Insert: {
          ativo?: boolean
          carga_horaria: number
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          funcao_funcionario: string
          id?: number
          observacao?: string | null
          requer_cnh?: boolean
          salario_base?: number
        }
        Update: {
          ativo?: boolean
          carga_horaria?: number
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          funcao_funcionario?: string
          id?: number
          observacao?: string | null
          requer_cnh?: boolean
          salario_base?: number
        }
        Relationships: []
      }
      tb_itens_nfe: {
        Row: {
          data_alteracao: string
          data_cadastro: string
          id: number
          nfe_id: number
          produto_id: number
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          nfe_id: number
          produto_id: number
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          nfe_id?: number
          produto_id?: number
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_itens_nfe_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "tb_nfe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_itens_nfe_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "tb_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_log_acesso: {
        Row: {
          data_acesso: string
          id: number
          ip_origem: string | null
          login_tentado: string | null
          observacao: string | null
          sucesso: boolean
          user_agent: string | null
          usuario_id: number | null
        }
        Insert: {
          data_acesso?: string
          id?: number
          ip_origem?: string | null
          login_tentado?: string | null
          observacao?: string | null
          sucesso: boolean
          user_agent?: string | null
          usuario_id?: number | null
        }
        Update: {
          data_acesso?: string
          id?: number
          ip_origem?: string | null
          login_tentado?: string | null
          observacao?: string | null
          sucesso?: boolean
          user_agent?: string | null
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_log_acesso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "tb_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_marcas: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          id: number
          marca: string
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          marca: string
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          marca?: string
        }
        Relationships: []
      }
      tb_modalidades_nfe: {
        Row: {
          ativo: boolean
          codigo: string
          data_alteracao: string
          data_cadastro: string
          descricao: string
          id: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          data_alteracao?: string
          data_cadastro?: string
          descricao: string
          id?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string
          id?: number
        }
        Relationships: []
      }
      tb_movimentacoes_nfe: {
        Row: {
          data_alteracao: string
          data_cadastro: string
          data_movimentacao: string
          descricao: string | null
          id: number
          nfe_id: number
          status: string
        }
        Insert: {
          data_alteracao?: string
          data_cadastro?: string
          data_movimentacao?: string
          descricao?: string | null
          id?: number
          nfe_id: number
          status: string
        }
        Update: {
          data_alteracao?: string
          data_cadastro?: string
          data_movimentacao?: string
          descricao?: string | null
          id?: number
          nfe_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_movimentacoes_nfe_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "tb_nfe"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_nfe: {
        Row: {
          cancelada: boolean
          chave_acesso: string | null
          cliente_id: number
          condicao_pagamento_id: number
          data_alteracao: string
          data_cadastro: string
          data_emissao: string
          forma_pagamento_id: number
          id: number
          modalidade_id: number
          numero: string
          serie: string
          transportadora_id: number | null
          valor_total: number
          veiculo_id: number | null
        }
        Insert: {
          cancelada?: boolean
          chave_acesso?: string | null
          cliente_id: number
          condicao_pagamento_id: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao: string
          forma_pagamento_id: number
          id?: number
          modalidade_id: number
          numero: string
          serie: string
          transportadora_id?: number | null
          valor_total: number
          veiculo_id?: number | null
        }
        Update: {
          cancelada?: boolean
          chave_acesso?: string | null
          cliente_id?: number
          condicao_pagamento_id?: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          forma_pagamento_id?: number
          id?: number
          modalidade_id?: number
          numero?: string
          serie?: string
          transportadora_id?: number | null
          valor_total?: number
          veiculo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tb_nfe_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "tb_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_nfe_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_nfe_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_nfe_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "tb_modalidades_nfe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_nfe_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_nfe_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "tb_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_notas_entrada: {
        Row: {
          condicao_pagamento_id: number
          data_alteracao: string
          data_cadastro: string
          data_chegada: string | null
          data_emissao: string
          forma_pagamento_id: number
          fornecedor_id: number
          modelo: string
          numero: string
          observacoes: string | null
          outras_despesas: number
          placa_veiculo: string | null
          serie: string
          situacao: string
          tipo_frete: string
          transportadora_id: number | null
          valor_desconto: number
          valor_frete: number
          valor_produtos: number
          valor_seguro: number
          valor_total: number
        }
        Insert: {
          condicao_pagamento_id: number
          data_alteracao?: string
          data_cadastro?: string
          data_chegada?: string | null
          data_emissao?: string
          forma_pagamento_id: number
          fornecedor_id: number
          modelo?: string
          numero: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string
          tipo_frete?: string
          transportadora_id?: number | null
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_seguro?: number
          valor_total?: number
        }
        Update: {
          condicao_pagamento_id?: number
          data_alteracao?: string
          data_cadastro?: string
          data_chegada?: string | null
          data_emissao?: string
          forma_pagamento_id?: number
          fornecedor_id?: number
          modelo?: string
          numero?: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string
          tipo_frete?: string
          transportadora_id?: number | null
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_seguro?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_notas_entrada_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_entrada_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_entrada_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_entrada_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_notas_saida: {
        Row: {
          cliente_id: number
          condicao_pagamento_id: number
          data_alteracao: string
          data_cadastro: string
          data_emissao: string
          data_saida: string | null
          forma_pagamento_id: number
          modelo: string
          numero: string
          observacoes: string | null
          outras_despesas: number
          placa_veiculo: string | null
          serie: string
          situacao: string
          tipo_frete: string
          transportadora_id: number | null
          valor_desconto: number
          valor_frete: number
          valor_produtos: number
          valor_seguro: number
          valor_total: number
        }
        Insert: {
          cliente_id: number
          condicao_pagamento_id: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          data_saida?: string | null
          forma_pagamento_id: number
          modelo?: string
          numero: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string
          tipo_frete?: string
          transportadora_id?: number | null
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_seguro?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: number
          condicao_pagamento_id?: number
          data_alteracao?: string
          data_cadastro?: string
          data_emissao?: string
          data_saida?: string | null
          forma_pagamento_id?: number
          modelo?: string
          numero?: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string
          tipo_frete?: string
          transportadora_id?: number | null
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_seguro?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_notas_saida_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "tb_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_saida_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_saida_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_notas_saida_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_paises: {
        Row: {
          ativo: boolean
          codigo: string
          data_alteracao: string
          data_cadastro: string
          id: number
          moeda: string
          nacionalidade: string
          pais: string
          sigla: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          moeda: string
          nacionalidade: string
          pais: string
          sigla: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          moeda?: string
          nacionalidade?: string
          pais?: string
          sigla?: string
        }
        Relationships: []
      }
      tb_parcelas_condicao_pagamento: {
        Row: {
          condicao_pagamento_id: number
          data_alteracao: string
          data_cadastro: string
          dias: number
          forma_pagamento_id: number
          id: number
          numero: number
          percentual: number
        }
        Insert: {
          condicao_pagamento_id: number
          data_alteracao?: string
          data_cadastro?: string
          dias: number
          forma_pagamento_id: number
          id?: number
          numero: number
          percentual: number
        }
        Update: {
          condicao_pagamento_id?: number
          data_alteracao?: string
          data_cadastro?: string
          dias?: number
          forma_pagamento_id?: number
          id?: number
          numero?: number
          percentual?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_parcelas_condicao_pagamento_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_parcelas_condicao_pagamento_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_formas_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_perfil_permissoes: {
        Row: {
          data_cadastro: string
          perfil_id: number
          permissao_id: number
        }
        Insert: {
          data_cadastro?: string
          perfil_id: number
          permissao_id: number
        }
        Update: {
          data_cadastro?: string
          perfil_id?: number
          permissao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_perfil_permissoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "tb_perfis_usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_perfil_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "tb_permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_perfis_usuario: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          descricao: string | null
          id: number
          perfil: string
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          perfil: string
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          perfil?: string
        }
        Relationships: []
      }
      tb_permissoes: {
        Row: {
          acao: string
          data_alteracao: string
          data_cadastro: string
          descricao: string | null
          id: number
          recurso: string
        }
        Insert: {
          acao: string
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          recurso: string
        }
        Update: {
          acao?: string
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          recurso?: string
        }
        Relationships: []
      }
      tb_produto_fornecedor: {
        Row: {
          ativo: boolean
          codigo_prod: string | null
          custo: number | null
          data_alteracao: string
          data_cadastro: string
          fornecedor_id: number
          id: number
          produto_id: number
        }
        Insert: {
          ativo?: boolean
          codigo_prod?: string | null
          custo?: number | null
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id: number
          id?: number
          produto_id: number
        }
        Update: {
          ativo?: boolean
          codigo_prod?: string | null
          custo?: number | null
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id?: number
          id?: number
          produto_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produto_fornecedor_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "tb_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_produto_fornecedor_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "tb_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_produtos: {
        Row: {
          ativo: boolean
          categoria_id: number
          codigo_barras: string | null
          data_alteracao: string
          data_cadastro: string
          descricao: string | null
          id: number
          marca_id: number
          observacoes: string | null
          percentual_lucro: number
          produto: string
          quantidade: number
          quantidade_minima: number
          referencia: string | null
          unidade_medida_id: number
          valor_compra: number
          valor_venda: number
        }
        Insert: {
          ativo?: boolean
          categoria_id: number
          codigo_barras?: string | null
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          marca_id: number
          observacoes?: string | null
          percentual_lucro?: number
          produto: string
          quantidade?: number
          quantidade_minima?: number
          referencia?: string | null
          unidade_medida_id: number
          valor_compra: number
          valor_venda: number
        }
        Update: {
          ativo?: boolean
          categoria_id?: number
          codigo_barras?: string | null
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          marca_id?: number
          observacoes?: string | null
          percentual_lucro?: number
          produto?: string
          quantidade?: number
          quantidade_minima?: number
          referencia?: string | null
          unidade_medida_id?: number
          valor_compra?: number
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "tb_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_produtos_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "tb_marcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_produtos_unidade_medida_id_fkey"
            columns: ["unidade_medida_id"]
            isOneToOne: false
            referencedRelation: "tb_unidades_medida"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_produtos_nota_entrada: {
        Row: {
          custo_preco_final: number | null
          data_alteracao: string
          data_cadastro: string
          fornecedor_id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto: number
          produto_id: number
          quantidade: number
          rateio_frete: number
          rateio_outras: number
          rateio_seguro: number
          sequencia: number
          valor_desconto: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          custo_preco_final?: number | null
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto?: number
          produto_id: number
          quantidade: number
          rateio_frete?: number
          rateio_outras?: number
          rateio_seguro?: number
          sequencia?: number
          valor_desconto?: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          custo_preco_final?: number | null
          data_alteracao?: string
          data_cadastro?: string
          fornecedor_id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          percentual_desconto?: number
          produto_id?: number
          quantidade?: number
          rateio_frete?: number
          rateio_outras?: number
          rateio_seguro?: number
          sequencia?: number
          valor_desconto?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produtos_nota_entrada_nota_fkey"
            columns: [
              "nota_numero",
              "nota_modelo",
              "nota_serie",
              "fornecedor_id",
            ]
            isOneToOne: false
            referencedRelation: "tb_notas_entrada"
            referencedColumns: ["numero", "modelo", "serie", "fornecedor_id"]
          },
          {
            foreignKeyName: "tb_produtos_nota_entrada_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "tb_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_produtos_nota_saida: {
        Row: {
          cliente_id: number
          custo_preco_final: number
          data_alteracao: string
          data_cadastro: string
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto: number
          produto_id: number
          quantidade: number
          rateio_frete: number
          rateio_outras: number
          rateio_seguro: number
          sequencia: number
          valor_desconto: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cliente_id: number
          custo_preco_final?: number
          data_alteracao?: string
          data_cadastro?: string
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto?: number
          produto_id: number
          quantidade: number
          rateio_frete?: number
          rateio_outras?: number
          rateio_seguro?: number
          sequencia: number
          valor_desconto?: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          cliente_id?: number
          custo_preco_final?: number
          data_alteracao?: string
          data_cadastro?: string
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          percentual_desconto?: number
          produto_id?: number
          quantidade?: number
          rateio_frete?: number
          rateio_outras?: number
          rateio_seguro?: number
          sequencia?: number
          valor_desconto?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produtos_nota_saida_nota_fkey"
            columns: ["nota_numero", "nota_modelo", "nota_serie", "cliente_id"]
            isOneToOne: false
            referencedRelation: "tb_notas_saida"
            referencedColumns: ["numero", "modelo", "serie", "cliente_id"]
          },
          {
            foreignKeyName: "tb_produtos_nota_saida_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "tb_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_refresh_tokens: {
        Row: {
          data_cadastro: string
          expiracao: string
          id: number
          ip_origem: string | null
          revogado: boolean
          token: string
          user_agent: string | null
          usuario_id: number
        }
        Insert: {
          data_cadastro?: string
          expiracao: string
          id?: number
          ip_origem?: string | null
          revogado?: boolean
          token: string
          user_agent?: string | null
          usuario_id: number
        }
        Update: {
          data_cadastro?: string
          expiracao?: string
          id?: number
          ip_origem?: string | null
          revogado?: boolean
          token?: string
          user_agent?: string | null
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_refresh_tokens_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "tb_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_transp_itens: {
        Row: {
          ativo: boolean
          codigo: string
          codigo_transp: string | null
          data_alteracao: string
          data_cadastro: string
          descricao: string | null
          id: number
          transportadora_id: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          codigo_transp?: string | null
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          transportadora_id: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          codigo_transp?: string | null
          data_alteracao?: string
          data_cadastro?: string
          descricao?: string | null
          id?: number
          transportadora_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_transp_itens_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_transportadora_emails: {
        Row: {
          cod_trans: number
          email: string
          id_email: number
        }
        Insert: {
          cod_trans: number
          email: string
          id_email?: number
        }
        Update: {
          cod_trans?: number
          email?: string
          id_email?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_transportadora_emails_cod_trans_fkey"
            columns: ["cod_trans"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_transportadora_telefones: {
        Row: {
          cod_trans: number
          id_telefone: number
          telefone: string
        }
        Insert: {
          cod_trans: number
          id_telefone?: number
          telefone: string
        }
        Update: {
          cod_trans?: number
          id_telefone?: number
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_transportadora_telefones_cod_trans_fkey"
            columns: ["cod_trans"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_transportadora_veiculo: {
        Row: {
          transportadora_id: number
          veiculo_id: number
        }
        Insert: {
          transportadora_id: number
          veiculo_id: number
        }
        Update: {
          transportadora_id?: number
          veiculo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_transportadora_veiculo_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "tb_transportadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_transportadora_veiculo_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "tb_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_transportadoras: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade_id: number
          cnpj: string
          complemento: string | null
          condicao_pagamento_id: number
          data_alteracao: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          id: number
          nome_fantasia: string | null
          numero: string | null
          observacao: string | null
          razao_social: string
          rg_ie: string | null
          telefone: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id: number
          cnpj: string
          complemento?: string | null
          condicao_pagamento_id: number
          data_alteracao?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome_fantasia?: string | null
          numero?: string | null
          observacao?: string | null
          razao_social: string
          rg_ie?: string | null
          telefone?: string | null
          tipo?: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number
          cnpj?: string
          complemento?: string | null
          condicao_pagamento_id?: number
          data_alteracao?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: number
          nome_fantasia?: string | null
          numero?: string | null
          observacao?: string | null
          razao_social?: string
          rg_ie?: string | null
          telefone?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_transportadoras_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "tb_cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_transportadoras_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "tb_condicoes_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_unidades_medida: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          id: number
          unidade_medida: string
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          unidade_medida: string
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          unidade_medida?: string
        }
        Relationships: []
      }
      tb_usuarios: {
        Row: {
          ativo: boolean
          data_alteracao: string
          data_cadastro: string
          email: string
          expiracao_token: string | null
          foto_perfil: string | null
          funcionario_id: number | null
          id: number
          nome: string
          observacao: string | null
          perfil_id: number
          senha_hash: string
          situacao: string
          tentativas_login: number
          token_reset_senha: string | null
          ultimo_login: string | null
          usuario: string
        }
        Insert: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          email: string
          expiracao_token?: string | null
          foto_perfil?: string | null
          funcionario_id?: number | null
          id?: number
          nome: string
          observacao?: string | null
          perfil_id: number
          senha_hash: string
          situacao?: string
          tentativas_login?: number
          token_reset_senha?: string | null
          ultimo_login?: string | null
          usuario: string
        }
        Update: {
          ativo?: boolean
          data_alteracao?: string
          data_cadastro?: string
          email?: string
          expiracao_token?: string | null
          foto_perfil?: string | null
          funcionario_id?: number | null
          id?: number
          nome?: string
          observacao?: string | null
          perfil_id?: number
          senha_hash?: string
          situacao?: string
          tentativas_login?: number
          token_reset_senha?: string | null
          ultimo_login?: string | null
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_usuarios_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "tb_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_usuarios_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "tb_perfis_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_usuarios_permissoes: {
        Row: {
          data_cadastro: string
          permissao_id: number
          tipo: string
          usuario_id: number
        }
        Insert: {
          data_cadastro?: string
          permissao_id: number
          tipo?: string
          usuario_id: number
        }
        Update: {
          data_cadastro?: string
          permissao_id?: number
          tipo?: string
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_usuarios_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "tb_permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tb_usuarios_permissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "tb_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_veiculos: {
        Row: {
          ano: number
          ativo: boolean
          capacidade: number | null
          data_alteracao: string
          data_cadastro: string
          id: number
          marca: string
          modelo: string
          placa: string
        }
        Insert: {
          ano: number
          ativo?: boolean
          capacidade?: number | null
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          marca: string
          modelo: string
          placa: string
        }
        Update: {
          ano?: number
          ativo?: boolean
          capacidade?: number | null
          data_alteracao?: string
          data_cadastro?: string
          id?: number
          marca?: string
          modelo?: string
          placa?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
