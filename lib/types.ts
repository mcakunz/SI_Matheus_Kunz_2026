export interface Pais {
    id:             number
    pais:           string
    codigo:         string
    sigla:          string
    moeda:          string
    nacionalidade:  string
    ativo:          boolean
    dataCadastro:   string
    dataAlteracao:  string | null
}

export interface Estado {
    id:             number
    estado:         string
    uf:             string
    paisId:         number
    ativo:          boolean
    dataCadastro:   string
    dataAlteracao:  string | null
}

export interface Cidade {
    id:             number
    cidade:         string
    codigoIbge:     string
    estadoId:       number
    ativo:          boolean
    dataCadastro:   string
    dataAlteracao:  string | null
}

export interface CondicaoPagamento {
    id:                 number
    condicaoPagamento:  string
    ativo:              boolean
    dataCadastro:       string
    dataAlteracao:      string | null
}

export interface Cliente {
    id:                    number
    cliente:               string
    apelido:               string | null
    cpfCnpj:               string
    rgInscricaoEstadual:   string | null
    email:                 string | null
    telefone:              string | null
    cep:                   string | null
    endereco:              string | null
    numero:                string | null
    complemento:           string | null
    bairro:                string | null
    cidadeId:              number
    paisId:                number
    condicaoPagamentoId:   number | null
    limiteCredito:         number
    dataNascimento:        string | null
    tipo:                  'F' | 'J'
    sexo:                  'M' | 'F' | 'O' | null
    observacao:            string | null
    ativo:                 boolean
    dataCadastro:          string
    dataAlteracao:         string | null
}

export interface EstadoComPais extends Estado {
    pais: string | null
}

export interface CidadeComEstado extends Cidade {
    estado: string | null
}

export interface ClienteCompleto extends Cliente {
    cidade:            string | null   
    pais:              string | null   
    condicaoPagamento: string | null   
}

export type PaisSelect              = Pick<Pais,             'id' | 'pais'>
export type EstadoSelect            = Pick<Estado,           'id' | 'estado'>
export type CidadeSelect            = Pick<Cidade,           'id' | 'cidade'>
export type CondicaoPagamentoSelect = Pick<CondicaoPagamento,'id' | 'condicaoPagamento'>
