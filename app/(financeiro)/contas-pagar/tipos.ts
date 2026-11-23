// Formatos usados pelas telas de Contas a Pagar (datas sempre "YYYY-MM-DD", valores já em number).

export type SituacaoConta = 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'CANCELADO'

export interface ContaPagarLinha {
    id: number
    origem: 'NOTA' | 'AVULSA'
    notaNumero: string | null
    notaModelo: string | null
    notaSerie: string | null
    fornecedorId: number
    fornecedor: string
    descricao: string | null
    formaPagamentoId: number
    formaPagamento: string
    numeroParcela: number
    totalParcelas: number
    valorOriginal: number
    percentualJuros: number
    percentualMulta: number
    percentualDesconto: number
    dataEmissao: string
    dataVencimento: string
    dataQuitacao: string | null
    situacao: SituacaoConta
    motivoCancelamento: string | null
    observacoes: string | null
    valorPrincipalPago: number
    valorTotalPago: number
    saldo: number
    dataUltimoPagamento: string | null
}

export interface PagamentoLinha {
    id: number
    dataPagamento: string
    formaPagamento: string
    valorPrincipal: number
    valorJuros: number
    valorMulta: number
    valorDesconto: number
    valorPago: number
    situacao: 'ATIVO' | 'ESTORNADO'
    dataEstorno: string | null
    motivoEstorno: string | null
    observacoes: string | null
}

export interface DadosPagamentoForm {
    contaPagarId: number
    dataPagamento: string
    formaPagamentoId: number
    valorPrincipal: number
    valorJuros: number
    valorMulta: number
    valorDesconto: number
    observacoes: string
}

export interface DadosContaAvulsaForm {
    fornecedorId: number
    descricao: string
    formaPagamentoId: number
    valorOriginal: number
    dataEmissao: string
    dataVencimento: string
    percentualJuros: number
    percentualMulta: number
    percentualDesconto: number
    observacoes: string
}
