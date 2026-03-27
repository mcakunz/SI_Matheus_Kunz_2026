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
      cidades: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          codcidade: number
          codes: number | null
          datacriacao: string | null
          dataultalteracao: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          codcidade: number
          codes?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          codcidade?: number
          codes?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cidades_codes_fkey"
            columns: ["codes"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["codestado"]
          },
          {
            foreignKeyName: "cidades_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "cidades_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      condicoes_pagamento: {
        Row: {
          ativo: boolean | null
          codcondpagto: number
          condicaopagamento: string | null
          datacriacao: string | null
          dataultalteracao: string | null
          percdesconto: number | null
          qtdparcelas: number | null
          taxajurosatraso: number | null
          taxamultaatraso: number | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codcondpagto: number
          condicaopagamento?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          percdesconto?: number | null
          qtdparcelas?: number | null
          taxajurosatraso?: number | null
          taxamultaatraso?: number | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codcondpagto?: number
          condicaopagamento?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          percdesconto?: number | null
          qtdparcelas?: number | null
          taxajurosatraso?: number | null
          taxamultaatraso?: number | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_pagamento_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "condicoes_pagamento_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      contas_a_pagar: {
        Row: {
          ativo: boolean | null
          codforn: number
          datacriacao: string | null
          dataultalteracao: string | null
          modelo: string
          numnfe: number
          numparcnfe: number
          serie: string
          usercriacao: number | null
          userultalteracao: number | null
          valorparcnfe: number | null
          venctoparcnfe: string | null
        }
        Insert: {
          ativo?: boolean | null
          codforn: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          modelo: string
          numnfe: number
          numparcnfe: number
          serie: string
          usercriacao?: number | null
          userultalteracao?: number | null
          valorparcnfe?: number | null
          venctoparcnfe?: string | null
        }
        Update: {
          ativo?: boolean | null
          codforn?: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          modelo?: string
          numnfe?: number
          numparcnfe?: number
          serie?: string
          usercriacao?: number | null
          userultalteracao?: number | null
          valorparcnfe?: number | null
          venctoparcnfe?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_numnfe_serie_modelo_codforn_fkey"
            columns: ["numnfe", "serie", "modelo", "codforn"]
            isOneToOne: false
            referencedRelation: "nfe"
            referencedColumns: ["numnfe", "serie", "modelo", "codforn"]
          },
          {
            foreignKeyName: "contas_a_pagar_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "contas_a_pagar_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      estados: {
        Row: {
          ativo: boolean | null
          codestado: number
          codpais: number | null
          datacriacao: string | null
          dataultalteracao: string | null
          estado: string | null
          uf: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codestado: number
          codpais?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          estado?: string | null
          uf?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codestado?: number
          codpais?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          estado?: string | null
          uf?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estados_codpais_fkey"
            columns: ["codpais"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["codPais"]
          },
          {
            foreignKeyName: "estados_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "estados_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      formas_pagamento: {
        Row: {
          ativo: boolean | null
          codformapagto: number
          datacriacao: string | null
          dataultalteracao: string | null
          formapagamento: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codformapagto: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          formapagamento?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codformapagto?: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          formapagamento?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formas_pagamento_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "formas_pagamento_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cnpj: string | null
          codcidade: number | null
          codforn: number
          datacriacao: string | null
          dataultalteracao: string | null
          email: string | null
          ender: string | null
          fone: string | null
          inscest: string | null
          inscestsubtrib: string | null
          razaosocial: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cnpj?: string | null
          codcidade?: number | null
          codforn: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          email?: string | null
          ender?: string | null
          fone?: string | null
          inscest?: string | null
          inscestsubtrib?: string | null
          razaosocial?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cnpj?: string | null
          codcidade?: number | null
          codforn?: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          email?: string | null
          ender?: string | null
          fone?: string | null
          inscest?: string | null
          inscestsubtrib?: string | null
          razaosocial?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_codcidade_fkey"
            columns: ["codcidade"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["codcidade"]
          },
          {
            foreignKeyName: "fornecedores_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "fornecedores_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      ncm_sh: {
        Row: {
          aliqicmsprodnfe: number | null
          aliqipiprodnfe: number | null
          ativo: boolean | null
          datacriacao: string | null
          dataultalteracao: string | null
          ncmsh: string
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          aliqicmsprodnfe?: number | null
          aliqipiprodnfe?: number | null
          ativo?: boolean | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          ncmsh: string
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          aliqicmsprodnfe?: number | null
          aliqipiprodnfe?: number | null
          ativo?: boolean | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          ncmsh?: string
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ncm_sh_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "ncm_sh_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      nfe: {
        Row: {
          ativo: boolean | null
          basecalcicms: number | null
          basecalcicmssub: number | null
          chaveacessonfe: string | null
          codcondpagto: number | null
          codforn: number
          codtransp: number | null
          codveic: number | null
          datacriacao: string | null
          dataemitnfe: string | null
          dataentnfe: string | null
          dataprotacesso: string | null
          dataultalteracao: string | null
          descontonfe: number | null
          especievol: string | null
          freteporcontanfe: string | null
          horaentnfe: string | null
          horaprotacesso: string | null
          infcomp: string | null
          marcavol: string | null
          modelo: string
          natoper: string | null
          numnfe: number
          outrasdespnfe: number | null
          pagina: number | null
          pesobrutovol: number | null
          pesoliqvol: number | null
          protacesso: string | null
          qtdadevol: number | null
          serie: string
          usercriacao: number | null
          userultalteracao: number | null
          valorfretenfe: number | null
          valoricms: number | null
          valoricmssub: number | null
          valoripi: number | null
          valorseguronfe: number | null
        }
        Insert: {
          ativo?: boolean | null
          basecalcicms?: number | null
          basecalcicmssub?: number | null
          chaveacessonfe?: string | null
          codcondpagto?: number | null
          codforn: number
          codtransp?: number | null
          codveic?: number | null
          datacriacao?: string | null
          dataemitnfe?: string | null
          dataentnfe?: string | null
          dataprotacesso?: string | null
          dataultalteracao?: string | null
          descontonfe?: number | null
          especievol?: string | null
          freteporcontanfe?: string | null
          horaentnfe?: string | null
          horaprotacesso?: string | null
          infcomp?: string | null
          marcavol?: string | null
          modelo: string
          natoper?: string | null
          numnfe: number
          outrasdespnfe?: number | null
          pagina?: number | null
          pesobrutovol?: number | null
          pesoliqvol?: number | null
          protacesso?: string | null
          qtdadevol?: number | null
          serie: string
          usercriacao?: number | null
          userultalteracao?: number | null
          valorfretenfe?: number | null
          valoricms?: number | null
          valoricmssub?: number | null
          valoripi?: number | null
          valorseguronfe?: number | null
        }
        Update: {
          ativo?: boolean | null
          basecalcicms?: number | null
          basecalcicmssub?: number | null
          chaveacessonfe?: string | null
          codcondpagto?: number | null
          codforn?: number
          codtransp?: number | null
          codveic?: number | null
          datacriacao?: string | null
          dataemitnfe?: string | null
          dataentnfe?: string | null
          dataprotacesso?: string | null
          dataultalteracao?: string | null
          descontonfe?: number | null
          especievol?: string | null
          freteporcontanfe?: string | null
          horaentnfe?: string | null
          horaprotacesso?: string | null
          infcomp?: string | null
          marcavol?: string | null
          modelo?: string
          natoper?: string | null
          numnfe?: number
          outrasdespnfe?: number | null
          pagina?: number | null
          pesobrutovol?: number | null
          pesoliqvol?: number | null
          protacesso?: string | null
          qtdadevol?: number | null
          serie?: string
          usercriacao?: number | null
          userultalteracao?: number | null
          valorfretenfe?: number | null
          valoricms?: number | null
          valoricmssub?: number | null
          valoripi?: number | null
          valorseguronfe?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nfe_codcondpagto_fkey"
            columns: ["codcondpagto"]
            isOneToOne: false
            referencedRelation: "condicoes_pagamento"
            referencedColumns: ["codcondpagto"]
          },
          {
            foreignKeyName: "nfe_codforn_fkey"
            columns: ["codforn"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["codforn"]
          },
          {
            foreignKeyName: "nfe_codtransp_fkey"
            columns: ["codtransp"]
            isOneToOne: false
            referencedRelation: "transportadores"
            referencedColumns: ["codtransp"]
          },
          {
            foreignKeyName: "nfe_codveic_fkey"
            columns: ["codveic"]
            isOneToOne: false
            referencedRelation: "veiculo"
            referencedColumns: ["codveic"]
          },
          {
            foreignKeyName: "nfe_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "nfe_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      paises: {
        Row: {
          ativo: boolean | null
          codPais: number
          datacriacao: string | null
          dataultalteracao: string | null
          ddi: string | null
          moeda: string | null
          pais: string | null
          sigla: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codPais: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          ddi?: string | null
          moeda?: string | null
          pais?: string | null
          sigla?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codPais?: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          ddi?: string | null
          moeda?: string | null
          pais?: string | null
          sigla?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paises_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "paises_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      parcelas: {
        Row: {
          ativo: boolean | null
          codcondpagto: number
          codformapagto: number | null
          datacriacao: string | null
          dataultalteracao: string | null
          diasprazo: number | null
          numparcela: number
          percvalor: number | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codcondpagto: number
          codformapagto?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          diasprazo?: number | null
          numparcela: number
          percvalor?: number | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codcondpagto?: number
          codformapagto?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          diasprazo?: number | null
          numparcela?: number
          percvalor?: number | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_codcondpagto_fkey"
            columns: ["codcondpagto"]
            isOneToOne: false
            referencedRelation: "condicoes_pagamento"
            referencedColumns: ["codcondpagto"]
          },
          {
            foreignKeyName: "parcelas_codformapagto_fkey"
            columns: ["codformapagto"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["codformapagto"]
          },
          {
            foreignKeyName: "parcelas_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "parcelas_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      prod_nfe: {
        Row: {
          aliqicmsprodnfe: number | null
          aliqipiprodnfe: number | null
          ativo: boolean | null
          basecalcicmsprod: number | null
          cfopprodnfe: string | null
          codforn: number
          codprod: number
          csosnprodnfe: string | null
          datacriacao: string | null
          dataultalteracao: string | null
          modelo: string
          numnfe: number
          qtdprodnfe: number | null
          serie: string
          usercriacao: number | null
          userultalteracao: number | null
          vlrdescprodnfe: number | null
          vlricmsprodnfe: number | null
          vlripiprodnfe: number | null
          vlruntprodnfe: number | null
        }
        Insert: {
          aliqicmsprodnfe?: number | null
          aliqipiprodnfe?: number | null
          ativo?: boolean | null
          basecalcicmsprod?: number | null
          cfopprodnfe?: string | null
          codforn: number
          codprod: number
          csosnprodnfe?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          modelo: string
          numnfe: number
          qtdprodnfe?: number | null
          serie: string
          usercriacao?: number | null
          userultalteracao?: number | null
          vlrdescprodnfe?: number | null
          vlricmsprodnfe?: number | null
          vlripiprodnfe?: number | null
          vlruntprodnfe?: number | null
        }
        Update: {
          aliqicmsprodnfe?: number | null
          aliqipiprodnfe?: number | null
          ativo?: boolean | null
          basecalcicmsprod?: number | null
          cfopprodnfe?: string | null
          codforn?: number
          codprod?: number
          csosnprodnfe?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          modelo?: string
          numnfe?: number
          qtdprodnfe?: number | null
          serie?: string
          usercriacao?: number | null
          userultalteracao?: number | null
          vlrdescprodnfe?: number | null
          vlricmsprodnfe?: number | null
          vlripiprodnfe?: number | null
          vlruntprodnfe?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_nfe_codprod_fkey"
            columns: ["codprod"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["codprod"]
          },
          {
            foreignKeyName: "prod_nfe_numnfe_serie_modelo_codforn_fkey"
            columns: ["numnfe", "serie", "modelo", "codforn"]
            isOneToOne: false
            referencedRelation: "nfe"
            referencedColumns: ["numnfe", "serie", "modelo", "codforn"]
          },
          {
            foreignKeyName: "prod_nfe_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "prod_nfe_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          codprod: number
          customedioprod: number | null
          datacriacao: string | null
          dataultalteracao: string | null
          ncmshprod: string | null
          pesobruto: number | null
          pesoliq: number | null
          produto: string | null
          saldoprod: number | null
          undprod: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codprod: number
          customedioprod?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          ncmshprod?: string | null
          pesobruto?: number | null
          pesoliq?: number | null
          produto?: string | null
          saldoprod?: number | null
          undprod?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codprod?: number
          customedioprod?: number | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          ncmshprod?: string | null
          pesobruto?: number | null
          pesoliq?: number | null
          produto?: string | null
          saldoprod?: number | null
          undprod?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_ncmshprod_fkey"
            columns: ["ncmshprod"]
            isOneToOne: false
            referencedRelation: "ncm_sh"
            referencedColumns: ["ncmsh"]
          },
          {
            foreignKeyName: "produtos_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "produtos_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      transportadores: {
        Row: {
          ativo: boolean | null
          codcidade: number | null
          codtransp: number
          cpf_cnpjtransp: string | null
          datacriacao: string | null
          dataultalteracao: string | null
          endtransp: string | null
          inscesttransp: string | null
          razaosoctransp: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codcidade?: number | null
          codtransp: number
          cpf_cnpjtransp?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          endtransp?: string | null
          inscesttransp?: string | null
          razaosoctransp?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codcidade?: number | null
          codtransp?: number
          cpf_cnpjtransp?: string | null
          datacriacao?: string | null
          dataultalteracao?: string | null
          endtransp?: string | null
          inscesttransp?: string | null
          razaosoctransp?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transportadores_codcidade_fkey"
            columns: ["codcidade"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["codcidade"]
          },
          {
            foreignKeyName: "transportadores_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "transportadores_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          codusuario: number
          datacriacao: string | null
          login: string
          nomeusuario: string
          senha: string
        }
        Insert: {
          ativo?: boolean | null
          codusuario: number
          datacriacao?: string | null
          login: string
          nomeusuario: string
          senha: string
        }
        Update: {
          ativo?: boolean | null
          codusuario?: number
          datacriacao?: string | null
          login?: string
          nomeusuario?: string
          senha?: string
        }
        Relationships: []
      }
      veiculo: {
        Row: {
          ativo: boolean | null
          codantt: string | null
          codestado: number | null
          codtransp: number | null
          codveic: number
          datacriacao: string | null
          dataultalteracao: string | null
          placaveic: string | null
          usercriacao: number | null
          userultalteracao: number | null
        }
        Insert: {
          ativo?: boolean | null
          codantt?: string | null
          codestado?: number | null
          codtransp?: number | null
          codveic: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          placaveic?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Update: {
          ativo?: boolean | null
          codantt?: string | null
          codestado?: number | null
          codtransp?: number | null
          codveic?: number
          datacriacao?: string | null
          dataultalteracao?: string | null
          placaveic?: string | null
          usercriacao?: number | null
          userultalteracao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_codestado_fkey"
            columns: ["codestado"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["codestado"]
          },
          {
            foreignKeyName: "veiculo_codtransp_fkey"
            columns: ["codtransp"]
            isOneToOne: false
            referencedRelation: "transportadores"
            referencedColumns: ["codtransp"]
          },
          {
            foreignKeyName: "veiculo_usercriacao_fkey"
            columns: ["usercriacao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
          {
            foreignKeyName: "veiculo_userultalteracao_fkey"
            columns: ["userultalteracao"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["codusuario"]
          },
        ]
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
