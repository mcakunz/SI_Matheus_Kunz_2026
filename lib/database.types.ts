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
          ativo: boolean | null
          categoria: string
          data_alteracao: string
          data_criacao: string
          id: number
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          data_alteracao?: string
          data_criacao?: string
          id?: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          data_alteracao?: string
          data_criacao?: string
          id?: number
        }
        Relationships: []
      }
      tb_cidades: {
        Row: {
          ativo: boolean
          cidade: string
          codigo_ibge: string | null
          data_cadastro: string
          estado_id: number
          id: number
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean
          cidade: string
          codigo_ibge?: string | null
          data_cadastro?: string
          estado_id: number
          id?: number
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string
          codigo_ibge?: string | null
          data_cadastro?: string
          estado_id?: number
          id?: number
          ultima_modificacao?: string
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
          cidade_id: number | null
          cliente: string
          complemento: string | null
          condicao_pagamento_id: number | null
          cpf_cpnj: string | null
          data_alteracao: string
          data_criacao: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado_civil: string | null
          id: number
          limite_credito: number | null
          nacionalidade_id: number | null
          numero: string | null
          observacao: string | null
          rg_inscricao_estadual: string | null
          sexo: string | null
          telefone: string | null
          tipo: number | null
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          cliente: string
          complemento?: string | null
          condicao_pagamento_id?: number | null
          cpf_cpnj?: string | null
          data_alteracao?: string
          data_criacao?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          id?: number
          limite_credito?: number | null
          nacionalidade_id?: number | null
          numero?: string | null
          observacao?: string | null
          rg_inscricao_estadual?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo?: number | null
        }
        Update: {
          apelido?: string | null
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          cliente?: string
          complemento?: string | null
          condicao_pagamento_id?: number | null
          cpf_cpnj?: string | null
          data_alteracao?: string
          data_criacao?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado_civil?: string | null
          id?: number
          limite_credito?: number | null
          nacionalidade_id?: number | null
          numero?: string | null
          observacao?: string | null
          rg_inscricao_estadual?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo?: number | null
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
            foreignKeyName: "tb_clientes_nacionalidade_id_fkey"
            columns: ["nacionalidade_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_condicoes_pagamento: {
        Row: {
          ativo: boolean | null
          condicao_pagamento: string | null
          data_cadastro: string | null
          dias_entre_parcelas: number | null
          dias_primeira_parcela: number | null
          id: number
          numero_parcelas: number | null
          parcelas: number
          percentual_desconto: number | null
          percentual_juros: number | null
          percentual_multa: number | null
          ultima_modificacao: string | null
        }
        Insert: {
          ativo?: boolean | null
          condicao_pagamento?: string | null
          data_cadastro?: string | null
          dias_entre_parcelas?: number | null
          dias_primeira_parcela?: number | null
          id?: number
          numero_parcelas?: number | null
          parcelas?: number
          percentual_desconto?: number | null
          percentual_juros?: number | null
          percentual_multa?: number | null
          ultima_modificacao?: string | null
        }
        Update: {
          ativo?: boolean | null
          condicao_pagamento?: string | null
          data_cadastro?: string | null
          dias_entre_parcelas?: number | null
          dias_primeira_parcela?: number | null
          id?: number
          numero_parcelas?: number | null
          parcelas?: number
          percentual_desconto?: number | null
          percentual_juros?: number | null
          percentual_multa?: number | null
          ultima_modificacao?: string | null
        }
        Relationships: []
      }
      tb_contas_pagar: {
        Row: {
          data_alteracao: string | null
          data_criacao: string | null
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          forma_pagamento_id: number | null
          fornecedor_id: number
          id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes: string | null
          situacao: string
          total_parcelas: number
          valor_desconto: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
          valor_pago: number | null
          valor_total: number
        }
        Insert: {
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao: string
          data_pagamento?: string | null
          data_vencimento: string
          forma_pagamento_id?: number | null
          fornecedor_id: number
          id?: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes?: string | null
          situacao?: string
          total_parcelas: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_pago?: number | null
          valor_total: number
        }
        Update: {
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          forma_pagamento_id?: number | null
          fornecedor_id?: number
          id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          numero_parcela?: number
          observacoes?: string | null
          situacao?: string
          total_parcelas?: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_pago?: number | null
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
          data_atualizacao: string | null
          data_criacao: string | null
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          desconto: number | null
          forma_pagamento_id: number | null
          fornecedor_id: number
          id: number
          juros: number | null
          modelo: string | null
          multa: number | null
          num_parcela: number
          numero_nota: string | null
          observacao: string | null
          serie: string | null
          status: string
          valor_pago: number | null
          valor_parcela: number
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_emissao: string
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number | null
          forma_pagamento_id?: number | null
          fornecedor_id: number
          id?: number
          juros?: number | null
          modelo?: string | null
          multa?: number | null
          num_parcela?: number
          numero_nota?: string | null
          observacao?: string | null
          serie?: string | null
          status?: string
          valor_pago?: number | null
          valor_parcela: number
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number | null
          forma_pagamento_id?: number | null
          fornecedor_id?: number
          id?: number
          juros?: number | null
          modelo?: string | null
          multa?: number | null
          num_parcela?: number
          numero_nota?: string | null
          observacao?: string | null
          serie?: string | null
          status?: string
          valor_pago?: number | null
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
          data_alteracao: string | null
          data_criacao: string | null
          data_emissao: string
          data_recebimento: string | null
          data_vencimento: string
          forma_pagamento_id: number | null
          id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes: string | null
          situacao: string
          total_parcelas: number
          valor_desconto: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
          valor_recebido: number | null
          valor_total: number
        }
        Insert: {
          cliente_id: number
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao: string
          data_recebimento?: string | null
          data_vencimento: string
          forma_pagamento_id?: number | null
          id?: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          numero_parcela: number
          observacoes?: string | null
          situacao?: string
          total_parcelas: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_recebido?: number | null
          valor_total: number
        }
        Update: {
          cliente_id?: number
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao?: string
          data_recebimento?: string | null
          data_vencimento?: string
          forma_pagamento_id?: number | null
          id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          numero_parcela?: number
          observacoes?: string | null
          situacao?: string
          total_parcelas?: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_recebido?: number | null
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
          data_cadastro: string
          estado: string
          id: number
          pais_id: number | null
          uf: string
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean
          data_cadastro?: string
          estado: string
          id?: number
          pais_id?: number | null
          uf: string
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean
          data_cadastro?: string
          estado?: string
          id?: number
          pais_id?: number | null
          uf?: string
          ultima_modificacao?: string
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
          data_cadastro: string
          descricao: string
          forma_pagamento: string
          id: number
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean
          data_cadastro?: string
          descricao: string
          forma_pagamento: string
          id?: number
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean
          data_cadastro?: string
          descricao?: string
          forma_pagamento?: string
          id?: number
          ultima_modificacao?: string
        }
        Relationships: []
      }
      tb_fornecedor_email: {
        Row: {
          ativo: boolean | null
          data_alteracao: string
          data_criacao: string
          email: string
          fornecedor_id: number
          id: number
          principal: boolean | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          email: string
          fornecedor_id: number
          id?: number
          principal?: boolean | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          email?: string
          fornecedor_id?: number
          id?: number
          principal?: boolean | null
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
          ativo: boolean | null
          data_alteracao: string
          data_criacao: string
          fornecedor_id: number
          id: number
          principal: boolean | null
          telefone: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          fornecedor_id: number
          id?: number
          principal?: boolean | null
          telefone: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          fornecedor_id?: number
          id?: number
          principal?: boolean | null
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
          cidade_id: number | null
          complemento: string | null
          condicao_pagamento_id: number | null
          cpf_cnpj: string | null
          data_alteracao: string
          data_criacao: string
          email: string
          endereco: string | null
          fornecedor: string
          id: number
          limite_credito: number
          nacionalidade_id: number | null
          numero: string | null
          observacoes: string | null
          rg_inscricao_estadual: string | null
          telefone: string
          tipo: number
          transportadora_id: number | null
        }
        Insert: {
          apelido: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          complemento?: string | null
          condicao_pagamento_id?: number | null
          cpf_cnpj?: string | null
          data_alteracao?: string
          data_criacao?: string
          email: string
          endereco?: string | null
          fornecedor: string
          id?: number
          limite_credito?: number
          nacionalidade_id?: number | null
          numero?: string | null
          observacoes?: string | null
          rg_inscricao_estadual?: string | null
          telefone: string
          tipo: number
          transportadora_id?: number | null
        }
        Update: {
          apelido?: string
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          complemento?: string | null
          condicao_pagamento_id?: number | null
          cpf_cnpj?: string | null
          data_alteracao?: string
          data_criacao?: string
          email?: string
          endereco?: string | null
          fornecedor?: string
          id?: number
          limite_credito?: number
          nacionalidade_id?: number | null
          numero?: string | null
          observacoes?: string | null
          rg_inscricao_estadual?: string | null
          telefone?: string
          tipo?: number
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
            foreignKeyName: "tb_fornecedores_nacionalidade_id_fkey"
            columns: ["nacionalidade_id"]
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
          ativo: boolean | null
          bairro: string
          cep: string
          cidade_id: number
          cnh: string | null
          complemento: string | null
          cpf_cpnj: string | null
          data_admissao: string
          data_alteracao: string
          data_criacao: string
          data_demissao: string | null
          data_nascimento: string
          data_validade_cnh: string | null
          email: string
          endereco: string
          estado_civil: number
          funcao_funcionario_id: number
          funcionario: string
          id: number
          nacionalidade_id: number
          numero: string
          observacao: string
          rg_inscricao_estadual: string | null
          salario: number
          sexo: number
          telefone: string
          tipo: number | null
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean | null
          bairro: string
          cep: string
          cidade_id: number
          cnh?: string | null
          complemento?: string | null
          cpf_cpnj?: string | null
          data_admissao: string
          data_alteracao?: string
          data_criacao?: string
          data_demissao?: string | null
          data_nascimento: string
          data_validade_cnh?: string | null
          email: string
          endereco: string
          estado_civil: number
          funcao_funcionario_id: number
          funcionario: string
          id?: number
          nacionalidade_id: number
          numero: string
          observacao: string
          rg_inscricao_estadual?: string | null
          salario: number
          sexo: number
          telefone: string
          tipo?: number | null
        }
        Update: {
          apelido?: string | null
          ativo?: boolean | null
          bairro?: string
          cep?: string
          cidade_id?: number
          cnh?: string | null
          complemento?: string | null
          cpf_cpnj?: string | null
          data_admissao?: string
          data_alteracao?: string
          data_criacao?: string
          data_demissao?: string | null
          data_nascimento?: string
          data_validade_cnh?: string | null
          email?: string
          endereco?: string
          estado_civil?: number
          funcao_funcionario_id?: number
          funcionario?: string
          id?: number
          nacionalidade_id?: number
          numero?: string
          observacao?: string
          rg_inscricao_estadual?: string | null
          salario?: number
          sexo?: number
          telefone?: string
          tipo?: number | null
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
            foreignKeyName: "tb_funcionarios_nacionalidade_id_fkey"
            columns: ["nacionalidade_id"]
            isOneToOne: false
            referencedRelation: "tb_paises"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_funcoes_funcionario: {
        Row: {
          ativo: boolean | null
          carga_horaria: number
          data_alteracao: string | null
          data_cadastro: string
          data_criacao: string | null
          descricao: string | null
          funcao_funcionario: string
          id: number
          observacao: string | null
          requer_cnh: boolean | null
          salario_base: number | null
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria: number
          data_alteracao?: string | null
          data_cadastro?: string
          data_criacao?: string | null
          descricao?: string | null
          funcao_funcionario: string
          id?: number
          observacao?: string | null
          requer_cnh?: boolean | null
          salario_base?: number | null
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean | null
          carga_horaria?: number
          data_alteracao?: string | null
          data_cadastro?: string
          data_criacao?: string | null
          descricao?: string | null
          funcao_funcionario?: string
          id?: number
          observacao?: string | null
          requer_cnh?: boolean | null
          salario_base?: number | null
          ultima_modificacao?: string
        }
        Relationships: []
      }
      tb_itens_nfe: {
        Row: {
          data_cadastro: string
          id: number
          nfe_id: number
          produto_id: number
          quantidade: number
          ultima_modificacao: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          data_cadastro?: string
          id?: number
          nfe_id: number
          produto_id: number
          quantidade: number
          ultima_modificacao?: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          data_cadastro?: string
          id?: number
          nfe_id?: number
          produto_id?: number
          quantidade?: number
          ultima_modificacao?: string
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
      tb_marcas: {
        Row: {
          ativo: boolean | null
          data_alteracao: string
          data_criacao: string
          id: number
          marca: string
        }
        Insert: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          id?: number
          marca: string
        }
        Update: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          id?: number
          marca?: string
        }
        Relationships: []
      }
      tb_modalidades_nfe: {
        Row: {
          ativo: boolean | null
          codigo: string
          data_cadastro: string
          descricao: string
          id: number
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          data_cadastro?: string
          descricao: string
          id?: number
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          data_cadastro?: string
          descricao?: string
          id?: number
          ultima_modificacao?: string
        }
        Relationships: []
      }
      tb_movimentacoes_nfe: {
        Row: {
          data_cadastro: string
          data_movimentacao: string
          descricao: string | null
          id: number
          nfe_id: number
          status: string
          ultima_modificacao: string
        }
        Insert: {
          data_cadastro?: string
          data_movimentacao: string
          descricao?: string | null
          id?: number
          nfe_id: number
          status: string
          ultima_modificacao?: string
        }
        Update: {
          data_cadastro?: string
          data_movimentacao?: string
          descricao?: string | null
          id?: number
          nfe_id?: number
          status?: string
          ultima_modificacao?: string
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
          cancelada: boolean | null
          chave_acesso: string | null
          cliente_id: number | null
          condicao_pagamento_id: number | null
          data_cadastro: string
          data_emissao: string
          forma_pagamento_id: number | null
          id: number
          modalidade_id: number | null
          numero: string
          serie: string
          transportadora_id: number | null
          ultima_modificacao: string
          valor_total: number
          veiculo_id: number | null
        }
        Insert: {
          cancelada?: boolean | null
          chave_acesso?: string | null
          cliente_id?: number | null
          condicao_pagamento_id?: number | null
          data_cadastro?: string
          data_emissao: string
          forma_pagamento_id?: number | null
          id?: number
          modalidade_id?: number | null
          numero: string
          serie: string
          transportadora_id?: number | null
          ultima_modificacao?: string
          valor_total: number
          veiculo_id?: number | null
        }
        Update: {
          cancelada?: boolean | null
          chave_acesso?: string | null
          cliente_id?: number | null
          condicao_pagamento_id?: number | null
          data_cadastro?: string
          data_emissao?: string
          forma_pagamento_id?: number | null
          id?: number
          modalidade_id?: number | null
          numero?: string
          serie?: string
          transportadora_id?: number | null
          ultima_modificacao?: string
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
          condicao_pagamento_id: number | null
          data_alteracao: string | null
          data_chegada: string | null
          data_criacao: string | null
          data_emissao: string
          fornecedor_id: number
          modelo: string
          numero: string
          observacoes: string | null
          outras_despesas: number
          placa_veiculo: string | null
          serie: string
          situacao: string | null
          tipo_frete: string
          transportadora_id: number | null
          valor_desconto: number
          valor_frete: number
          valor_produtos: number
          valor_seguro: number
          valor_total: number
        }
        Insert: {
          condicao_pagamento_id?: number | null
          data_alteracao?: string | null
          data_chegada?: string | null
          data_criacao?: string | null
          data_emissao?: string
          fornecedor_id: number
          modelo?: string
          numero: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string | null
          tipo_frete?: string
          transportadora_id?: number | null
          valor_desconto?: number
          valor_frete?: number
          valor_produtos?: number
          valor_seguro?: number
          valor_total?: number
        }
        Update: {
          condicao_pagamento_id?: number | null
          data_alteracao?: string | null
          data_chegada?: string | null
          data_criacao?: string | null
          data_emissao?: string
          fornecedor_id?: number
          modelo?: string
          numero?: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string | null
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
          condicao_pagamento_id: number | null
          data_alteracao: string | null
          data_criacao: string | null
          data_emissao: string
          data_saida: string | null
          modelo: string
          numero: string
          observacoes: string | null
          outras_despesas: number
          placa_veiculo: string | null
          serie: string
          situacao: string | null
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
          condicao_pagamento_id?: number | null
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao?: string
          data_saida?: string | null
          modelo?: string
          numero: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string | null
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
          condicao_pagamento_id?: number | null
          data_alteracao?: string | null
          data_criacao?: string | null
          data_emissao?: string
          data_saida?: string | null
          modelo?: string
          numero?: string
          observacoes?: string | null
          outras_despesas?: number
          placa_veiculo?: string | null
          serie?: string
          situacao?: string | null
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
          codigo: string | null
          data_cadastro: string
          id: number
          moeda: string | null
          nacionalidade: string | null
          pais: string
          sigla: string | null
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          data_cadastro?: string
          id?: number
          moeda?: string | null
          nacionalidade?: string | null
          pais: string
          sigla?: string | null
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          data_cadastro?: string
          id?: number
          moeda?: string | null
          nacionalidade?: string | null
          pais?: string
          sigla?: string | null
          ultima_modificacao?: string
        }
        Relationships: []
      }
      tb_parcelas_condicao_pagamento: {
        Row: {
          condicao_pagamento_id: number
          data_cadastro: string | null
          dias: number
          forma_pagamento_id: number | null
          id: number
          numero: number
          percentual: number
          ultima_modificacao: string | null
        }
        Insert: {
          condicao_pagamento_id: number
          data_cadastro?: string | null
          dias: number
          forma_pagamento_id?: number | null
          id?: number
          numero: number
          percentual: number
          ultima_modificacao?: string | null
        }
        Update: {
          condicao_pagamento_id?: number
          data_cadastro?: string | null
          dias?: number
          forma_pagamento_id?: number | null
          id?: number
          numero?: number
          percentual?: number
          ultima_modificacao?: string | null
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
      tb_produto_fornecedor: {
        Row: {
          ativo: boolean | null
          codigo_prod: string | null
          custo: number | null
          data_cadastro: string
          fornecedor_id: number
          id: number
          produto_id: number
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean | null
          codigo_prod?: string | null
          custo?: number | null
          data_cadastro?: string
          fornecedor_id: number
          id?: number
          produto_id: number
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean | null
          codigo_prod?: string | null
          custo?: number | null
          data_cadastro?: string
          fornecedor_id?: number
          id?: number
          produto_id?: number
          ultima_modificacao?: string
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
          ativo: boolean | null
          categoria_id: number | null
          codigo_barras: string | null
          data_criacao: string | null
          descricao: string | null
          id: number
          marca_id: number
          observacoes: string | null
          percentual_lucro: number
          produto: string
          quantidade: number
          quantidade_minima: number
          referencia: string | null
          ultima_modificacao: string | null
          unidade_medida_id: number
          valor_compra: number
          valor_venda: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: number | null
          codigo_barras?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: number
          marca_id: number
          observacoes?: string | null
          percentual_lucro: number
          produto: string
          quantidade?: number
          quantidade_minima?: number
          referencia?: string | null
          ultima_modificacao?: string | null
          unidade_medida_id: number
          valor_compra: number
          valor_venda: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: number | null
          codigo_barras?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: number
          marca_id?: number
          observacoes?: string | null
          percentual_lucro?: number
          produto?: string
          quantidade?: number
          quantidade_minima?: number
          referencia?: string | null
          ultima_modificacao?: string | null
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
          data_alteracao: string | null
          data_criacao: string | null
          fornecedor_id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto: number | null
          produto_id: number
          quantidade: number
          rateio_frete: number | null
          rateio_outras: number | null
          rateio_seguro: number | null
          sequencia: number
          valor_desconto: number | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          custo_preco_final?: number | null
          data_alteracao?: string | null
          data_criacao?: string | null
          fornecedor_id: number
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto?: number | null
          produto_id: number
          quantidade: number
          rateio_frete?: number | null
          rateio_outras?: number | null
          rateio_seguro?: number | null
          sequencia?: number
          valor_desconto?: number | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          custo_preco_final?: number | null
          data_alteracao?: string | null
          data_criacao?: string | null
          fornecedor_id?: number
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          percentual_desconto?: number | null
          produto_id?: number
          quantidade?: number
          rateio_frete?: number | null
          rateio_outras?: number | null
          rateio_seguro?: number | null
          sequencia?: number
          valor_desconto?: number | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produtos_nota_entrada_nota_numero_nota_modelo_nota_seri_fkey"
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
          custo_preco_final: number | null
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto: number | null
          produto_id: number
          quantidade: number
          rateio_frete: number | null
          rateio_outras: number | null
          rateio_seguro: number | null
          sequencia: number
          valor_desconto: number | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cliente_id: number
          custo_preco_final?: number | null
          nota_modelo: string
          nota_numero: string
          nota_serie: string
          percentual_desconto?: number | null
          produto_id: number
          quantidade: number
          rateio_frete?: number | null
          rateio_outras?: number | null
          rateio_seguro?: number | null
          sequencia: number
          valor_desconto?: number | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          cliente_id?: number
          custo_preco_final?: number | null
          nota_modelo?: string
          nota_numero?: string
          nota_serie?: string
          percentual_desconto?: number | null
          produto_id?: number
          quantidade?: number
          rateio_frete?: number | null
          rateio_outras?: number | null
          rateio_seguro?: number | null
          sequencia?: number
          valor_desconto?: number | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_produtos_nota_saida_nota_numero_nota_modelo_nota_serie__fkey"
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
      tb_transp_itens: {
        Row: {
          ativo: boolean | null
          codigo: string
          codigo_transp: string | null
          data_cadastro: string
          descricao: string | null
          id: number
          transportadora_id: number | null
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          codigo_transp?: string | null
          data_cadastro?: string
          descricao?: string | null
          id?: number
          transportadora_id?: number | null
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          codigo_transp?: string | null
          data_cadastro?: string
          descricao?: string | null
          id?: number
          transportadora_id?: number | null
          ultima_modificacao?: string
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
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade_id: number | null
          cnpj: string | null
          complemento: string | null
          condicao_pagamento_id: number | null
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
          tipo: string | null
          ultima_modificacao: string
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          cnpj?: string | null
          complemento?: string | null
          condicao_pagamento_id?: number | null
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
          tipo?: string | null
          ultima_modificacao?: string
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade_id?: number | null
          cnpj?: string | null
          complemento?: string | null
          condicao_pagamento_id?: number | null
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
          tipo?: string | null
          ultima_modificacao?: string
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
          ativo: boolean | null
          data_alteracao: string
          data_criacao: string
          id: number
          unidade_medida: string
        }
        Insert: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          id?: number
          unidade_medida: string
        }
        Update: {
          ativo?: boolean | null
          data_alteracao?: string
          data_criacao?: string
          id?: number
          unidade_medida?: string
        }
        Relationships: []
      }
      tb_veiculos: {
        Row: {
          ano: number | null
          ativo: boolean | null
          capacidade: number | null
          data_cadastro: string
          id: number
          marca: string | null
          modelo: string | null
          placa: string
          ultima_modificacao: string
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          capacidade?: number | null
          data_cadastro?: string
          id?: number
          marca?: string | null
          modelo?: string | null
          placa: string
          ultima_modificacao?: string
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          capacidade?: number | null
          data_cadastro?: string
          id?: number
          marca?: string | null
          modelo?: string | null
          placa?: string
          ultima_modificacao?: string
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
