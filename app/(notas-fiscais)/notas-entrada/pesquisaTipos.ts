// Formatos das listas usadas nos modais de pesquisa da Nota de Entrada.
// Todos são compatíveis (estruturalmente) com os tipos *Select de "@/lib/types",
// então também podem ser passados direto para os Lookups.

export interface FornecedorPesquisa {
    id: number
    fornecedor: string
    apelido: string | null
    cpfCnpj: string
    tipo: 'F' | 'J'
    condicaoPagamentoId: number
}

export interface TransportadoraPesquisa {
    id: number
    razaoSocialNome: string
    nomeFantasiaApelido: string | null
    cnpj: string
}

export interface CondicaoPesquisa {
    id: number
    condicaoPagamento: string
    numeroParcelas: number
    diasPrimeiraParcela: number
}

export interface ProdutoPesquisa {
    id: number
    produto: string
    codigoBarras: string | null
    referencia: string | null
    valorCompra: number
    quantidade: number
    unidadeMedida: string
}
