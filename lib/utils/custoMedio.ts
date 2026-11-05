import { mulDiv } from "./arredondamento"

/**
 * Custo médio ponderado (média móvel) de um produto depois de um movimento de estoque.
 * Versão geral: recebe a variação de quantidade e a variação de VALOR (quantidade × custo),
 * o que permite somar entradas e estornos de uma mesma gravação (editar uma nota = estornar os
 * itens antigos + lançar os novos) antes de calcular a média.
 *
 *   novoValor = (saldo × custoMedioAtual) + variacaoValor
 *   custoMedio = novoValor ÷ (saldo + variacaoQuantidade)
 *
 * Se o saldo final for zero (ou negativo) não existe média a calcular, então mantém o custo atual.
 * Arredonda em 6 casas pela NBR 5891, igual à coluna "custoMedio" (numeric(18,6)).
 */
export function recalcularCustoMedio(
    saldo: number,
    custoMedioAtual: number,
    variacaoQuantidade: number,
    variacaoValor: number,
): number {
    const novoSaldo = saldo + variacaoQuantidade
    if (novoSaldo <= 0) return custoMedioAtual

    const valorEmEstoque = mulDiv(saldo, custoMedioAtual, 1, 6)
    return Math.max(0, mulDiv(valorEmEstoque + variacaoValor, 1, novoSaldo, 6))
}

/**
 * Custo médio depois de UMA entrada (a fórmula clássica):
 *
 *   custoMedio = ((saldo × custoMedioAtual) + (quantidadeEntrada × custoUnitarioEntrada))
 *                ÷ (saldo + quantidadeEntrada)
 *
 * • saldo e custoMedioAtual: do PRODUTO (tb_produtos.quantidade e tb_produtos."custoMedio").
 * • quantidadeEntrada e custoUnitarioEntrada: do ITEM da nota de entrada
 *   (tb_produtos_nota_entrada.quantidade e "custoPrecoFinal", que já inclui desconto e rateios).
 *
 * Com saldo zero devolve o próprio custo da entrada.
 */
export function calcularCustoMedio(
    saldo: number,
    custoMedioAtual: number,
    quantidadeEntrada: number,
    custoUnitarioEntrada: number,
): number {
    return recalcularCustoMedio(
        saldo,
        custoMedioAtual,
        quantidadeEntrada,
        mulDiv(quantidadeEntrada, custoUnitarioEntrada, 1, 6),
    )
}
