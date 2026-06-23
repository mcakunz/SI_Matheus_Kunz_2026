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
export interface EstadoComPais extends Estado {
    pais: string | null
}

export interface CidadeComEstado extends Cidade {
    estado: string | null
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
export interface ClienteView extends Cliente {
    cidade:            string | null
    condicaoPagamento: string | null
    emailPrincipal:    string | null
    totalEmails:       number          
    telefonePrincipal: string | null
    totalTelefones:    number          
}
export interface ClienteEmail {
    id:        number
    clienteId: number
    email:     string
    tipo:      'PESSOAL' | 'COMERCIAL' | 'FINANCEIRO' | 'FISCAL'
    principal: boolean
    ativo:     boolean
    dataCadastro: string        
    dataAlteracao: string | null 

}

export interface ClienteTelefone {
    id:        number
    clienteId: number
    telefone:  string
    tipo:      'PESSOAL' | 'COMERCIAL' | 'FINANCEIRO'           
    principal: boolean
    ativo:     boolean
    dataCadastro: string        
    dataAlteracao: string | null 

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
    tipo:         'COMERCIAL' | 'FINANCEIRO' | 'FISCAL'           
    principal:    boolean
    ativo:        boolean
    dataCadastro: string
    dataAlteracao: string | null
}
 
export interface FornecedorTelefone {
    id:           number
    fornecedorId: number
    telefone:     string
    tipo:         'COMERCIAL' | 'FINANCEIRO'                     
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

export interface Veiculo {
    id:           number
    placa:        string
    modelo:       string
    marca:        string
    ano:          number
    capacidade:   number | null
    ativo:        boolean
    dataCadastro: string
    dataAlteracao: string | null
}
export interface Transportadora {
    id:                    number
    razaoSocial:           string
    nomeFantasiaApelido:   string | null   
    cnpj:                  string
    rgIe:                  string | null
    cep:                   string | null
    endereco:              string | null
    numero:                string | null
    complemento:           string | null
    bairro:                string | null
    cidadeId:              number
    condicaoPagamentoId:   number
    transportadoraId:      number | null
    tipo:                  'F' | 'J'
    limiteCredito:         number
    observacoes:           string | null
    ativo:                 boolean
    dataCadastro:          string
    dataAlteracao:         string | null
}
export interface TransportadoraEmail {
    id:                number
    transportadoraId:  number
    email:             string
    tipo:              'COMERCIAL' | 'FINANCEIRO' | 'FISCAL' 
    principal:         boolean
    ativo:             boolean
    dataCadastro:      string
    dataAlteracao:     string | null
}
export interface TransportadoraTelefone {
    id:                number
    transportadoraId:  number
    telefone:          string
    tipo:              'COMERCIAL' | 'FINANCEIRO'
    principal:         boolean
    ativo:             boolean
    dataCadastro:      string
    dataAlteracao:     string | null
}

export interface TransportadoraVeiculo {
    transportadoraId: number
    veiculoId:        number
    dataCadastro:     string
    dataAlteracao:    string | null
}
export interface TransportadoraView extends Transportadora {
    cidade:            string | null
    condicaoPagamento: string | null
    emailPrincipal:    string | null
    totalEmails:       number
    telefonePrincipal: string | null
    totalTelefones:    number
}
export interface Categoria {
    id: number
    categoria: string
    ativo: boolean
    dataCadastro: string
    dataAlteracao: string | null
}

export interface Marca {
    id:           number
    marca:        string
    ativo:        boolean
    dataCadastro: string
    dataAlteracao: string | null
}

export interface UnidadeMedida {
    id:             number
    unidadeMedida:  string
    ativo:          boolean
    dataCadastro:   string
    dataAlteracao:  string | null
}
export interface Produto {
    id:               number
    produto:          string
    codigoBarras:     string | null
    referencia:       string | null
    marcaId:          number
    unidadeMedidaId:  number
    categoriaId:      number
    valorCompra:      number
    valorVenda:       number
    quantidade:       number
    quantidadeMinima: number
    percentualLucro:  number
    descricao:        string | null
    observacoes:      string | null
    ativo:            boolean
    dataCadastro:     string
    dataAlteracao:    string | null
}
 
export interface ProdutoView extends Produto {
    marca:        string | null
    unidadeMedida: string | null
    categoria:    string | null
}

export interface FuncaoFuncionario {
    id:                  number
    funcaoFuncionario:   string
    descricao:           string | null
    salarioBase:         number
    cargaHoraria:        number
    requerCnh:           boolean
    observacao:          string | null
    ativo:               boolean
    dataCadastro:        string
    dataAlteracao:       string | null
}
 
export interface Funcionario {
    id:                    number
    funcionario:           string
    apelido:               string | null
    cpfCnpj:               string
    rgInscricaoEstadual:   string | null
    cep:                   string
    endereco:              string
    numero:                string
    complemento:           string | null
    bairro:                string
    cidadeId:              number
    funcaoFuncionarioId:   number
    dataNascimento:        string
    dataAdmissao:          string
    dataDemissao:          string | null
    cnh:                   string | null
    dataValidadeCnh:       string | null
    sexo:                  'M' | 'F' | 'O'
    salario:               number
    tipo:                  'INTERNO' | 'EXTERNO' | 'TERCEIRIZADO'
    observacao:            string | null
    ativo:                 boolean
    dataCadastro:          string
    dataAlteracao:         string | null
}
export interface FuncionarioView extends Funcionario {
    cidade:            string | null
    funcaoFuncionario: string | null
    requerCnh:         boolean | null
    emailPrincipal:    string | null
    totalEmails:       number
    telefonePrincipal: string | null
    totalTelefones:    number
}
export interface FuncionarioEmail {
    id:            number
    funcionarioId: number
    email:         string
    tipo:          'PESSOAL' | 'CORPORATIVO'
    principal:     boolean
    ativo:         boolean
    dataCadastro:  string
    dataAlteracao: string | null
}
export interface FuncionarioTelefone {
    id:            number
    funcionarioId: number
    telefone:      string
    tipo:          'PESSOAL' | 'CORPORATIVO'
    principal:     boolean
    ativo:         boolean
    dataCadastro:  string
    dataAlteracao: string | null
}
 
export type PaisSelect              = Pick<Pais,             'id' | 'pais'>
export type EstadoSelect            = Pick<Estado,           'id' | 'estado' | 'paisId'>
export type CidadeSelect            = Pick<Cidade,           'id' | 'cidade' | 'estadoId'>
export type CondicaoPagamentoSelect = Pick<CondicaoPagamento,'id' | 'condicaoPagamento'>
export type FormaPagamentoSelect    = Pick<FormaPagamento,   'id' | 'formaPagamento'>
export type TransportadoraSelect    = Pick<Transportadora,   'id' | 'razaoSocial'>
export type VeiculoSelect           = Pick<Veiculo,          'id' | 'placa' | 'modelo' | 'marca'>
export type CategoriaSelect         = Pick<Categoria,        'id' | 'categoria'>
export type MarcaSelect             = Pick<Marca,            'id' | 'marca'>
export type UnidadeMedidaSelect     = Pick<UnidadeMedida,    'id' | 'unidadeMedida'>
export type FuncaoFuncionarioSelect = Pick<FuncaoFuncionario,'id' | 'funcaoFuncionario' | 'requerCnh'>