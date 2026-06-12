export interface Pais {
    id:                  number
    pais:                string
    codigo:              string
    sigla:               string
    moeda:               string
    nacionalidade:       string
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null

    usuarioCadastroId:   number | null
    usuarioCadastro:     string | null   
    usuarioAlteracaoId:  number | null
    usuarioAlteracao:    string | null   
}

export interface Estado {
    id:                  number
    estado:              string
    uf:                  string
    paisId:              number
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}

export interface Cidade {
    id:                  number
    cidade:              string
    codigoIbge:          string
    estadoId:            number
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}

export interface CondicaoPagamento {
    id:                  number
    condicaoPagamento:   string
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}

export interface FormaPagamento {
    id:             number
    formaPagamento: string
    descricao:      string
    ativo:          boolean
    dataCadastro:   string
    dataAlteracao:  string | null
}

export interface ParcelaCondicao {
    id:                  number
    condicaoPagamentoId: number
    numero:              number
    dias:                number
    percentual:          number
    formaPagamentoId:    number
    formaPagamento:      string   
    dataCadastro:        string
    dataAlteracao:       string | null
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

export interface ClienteView extends Cliente {
    cidade:            string | null   
    condicaoPagamento: string | null   
}
export interface ParcelaCondicao {
    id:                         number
    condicaoPagamentoId:        number
    numero:                     number
    dias:                       number
    percentual:                 number
    formaPagamentoId:           number
    formaPagamento:             string
    dataCadastro:               string
    dataAlteracao:              string | null
}

export interface CondicaoPagamentoCompleto {
    id:                  number
    condicaoPagamento:   string
    numeroParcelas:      number
    diasPrimeiraParcela: number
    diasEntreParcelas:   number
    percentualJuros:     number
    percentualMulta:     number
    percentualDesconto:  number
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}

export interface Fornecedor {
    id:                  number
    fornecedor:          string
    apelido:             string | null
    cpfCnpj:             string
    rgInscricaoEstadual: string | null
    cep:                 string | null
    endereco:            string | null
    numero:              string | null
    complemento:         string | null
    bairro:              string | null
    cidadeId:            number
    paisId:              number
    condicaoPagamentoId: number
    transportadoraId:    number | null
    tipo:                'F' | 'J'
    limiteCredito:       number
    observacoes:         string | null
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}
 
export interface FornecedorEmail {
    id:           number
    fornecedorId: number
    email:        string
    tipo:         'COMERCIAL' | 'FINANCEIRO' | 'FISCAL' | 'OUTRO'
    principal:    boolean
    ativo:        boolean
    dataCadastro: string
    dataAlteracao: string | null
}
 
export interface FornecedorTelefone {
    id:           number
    fornecedorId: number
    telefone:     string
    tipo:         'COMERCIAL' | 'FINANCEIRO' | 'CELULAR' | 'OUTRO'
    principal:    boolean
    ativo:        boolean
    dataCadastro: string
    dataAlteracao: string | null
}
 
export interface FornecedorView extends Fornecedor {
    cidade:            string | null
    pais:              string | null
    condicaoPagamento: string | null
    transportadora:    string | null
    emailPrincipal:    string | null
    totalEmails:       number
    telefonePrincipal: string | null
    totalTelefones:    number
}
export interface Transportadora {
    id:                  number
    razaoSocial:         string
    nomeFantasia:        string | null
    cnpj:                string
    rgIe:                string | null
    cep:                 string | null
    endereco:            string | null
    numero:              string | null
    complemento:         string | null
    bairro:              string | null
    cidadeId:            number
    condicaoPagamentoId: number
    tipo:                'F' | 'J'
    limiteCredito:       number
    observacoes:         string | null
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}
export interface TransportadoraEmail {
    id:                number
    transportadoraId:  number
    email:             string
    tipo:              'COMERCIAL' | 'FINANCEIRO' | 'FISCAL' | 'OUTRO'
    principal:         boolean
    ativo:             boolean
    dataCadastro:      string
    dataAlteracao:     string | null
}
export interface TransportadoraTelefone {
    id:                number
    transportadoraId:  number
    telefone:          string
    tipo:              'COMERCIAL' | 'FINANCEIRO' | 'CELULAR' | 'OUTRO'
    principal:         boolean
    ativo:             boolean
    dataCadastro:      string
    dataAlteracao:     string | null
}
export interface TransportadoraView extends Transportadora {
    cidade:            string | null
    condicaoPagamento: string | null
    emailPrincipal:    string | null
    totalEmails:       number
    telefonePrincipal: string | null
    totalTelefones:    number
}

export type PaisSelect              = Pick<Pais,             'id' | 'pais'>
export type EstadoSelect            = Pick<Estado,           'id' | 'estado' | 'paisId'>
export type CidadeSelect            = Pick<Cidade,           'id' | 'cidade' | 'estadoId'>
export type CondicaoPagamentoSelect = Pick<CondicaoPagamento,'id' | 'condicaoPagamento'>
export type FormaPagamentoSelect    = Pick<FormaPagamento,   'id' | 'formaPagamento'>
export type TransportadoraSelect = Pick<Transportadora, 'id' | 'razaoSocial'>