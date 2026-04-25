import { Database } from "./database.types";

export type Pais = Database['public']['Tables']['tb_paises']['Row']
export type Estado = Database['public']['Tables']['tb_estados']['Row']
export type Cidade = Database['public']['Tables']['tb_cidades']['Row']
export type Cliente = Database['public']['Tables']['tb_clientes']['Row']
export type CondicaoPagamento = Database['public']['Tables']['tb_condicoes_pagamento']['Row']

export type EstadoComPais = Estado & {
    tb_paises: Pick<Pais, 'pais'> | null
}

export type CidadeComEstado = Cidade & {
    tb_estados: Pick<Estado, 'estado'> | null
}

export type ClienteCompleto = Cliente & {
    tb_cidades:                Pick<Cidade, 'cidade'> | null
    tb_paises:                  Pick<Pais, 'pais'> | null
    tb_condicoes_pagamento:      Pick<CondicaoPagamento, 'condicao_pagamento'> | null
}

export type PaisSelect =    Pick<Pais, 'id' | 'pais'>
export type EstadoSelect =  Pick<Estado, 'id' | 'estado'>
export type CidadeSelect =  Pick<Cidade, 'id' | 'cidade'>
export type CondicaoPagamentoSelect = Pick<CondicaoPagamento, 'id' | 'condicao_pagamento'>