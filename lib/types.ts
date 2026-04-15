import { Database } from "./database.types";

export type Pais = Database['public']['Tables']['tb_paises']['Row']
export type Estado = Database['public']['Tables']['tb_estados']['Row']
export type Cidades = Database['public']['Tables']['tb_cidades']['Row']

export type EstadoComPais = Estado & {
    tb_paises: Pick<Pais, 'pais'> | null
}

export type PaisSelect = Pick<Pais, 'id' | 'pais'>