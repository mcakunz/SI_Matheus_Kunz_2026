import { mulDiv } from "./arredondamento"

/**
 * Em qual parcela fica o "resto" dos centavos quando o total não divide exatamente.
 * Para o resto ir na primeira parcela, troque para 'primeira'.
 */
export const PARCELA_COM_RESTO: 'primeira' | 'ultima' = 'ultima'

/**
 * Divide `total` (em reais) em parcelas, uma por percentual informado, trabalhando em centavos
 * inteiros para a soma das parcelas bater SEMPRE com o total.
 *
 * • Percentuais iguais (diferença de no máximo 0,01 ponto percentual): divisão em partes iguais.
 *   A condição de pagamento só guarda 2 casas, então 3x vira 33,34% + 33,33% + 33,33% (soma 100),
 *   e aplicar isso literalmente dá parcelas diferentes (R$ 1.902,71 / 1.902,14 / 1.902,15 em
 *   R$ 5.707,00) quando o usuário espera parcelas iguais. Aqui cada parcela recebe o mesmo valor
 *   (arredondado para baixo, em centavos) e o resto vai para a parcela definida em PARCELA_COM_RESTO.
 *   Ex.: R$ 5.707,00 em 3x -> 1.902,33 | 1.902,33 | 1.902,34.
 *
 * • Percentuais diferentes (ex.: 30% + 70%): cada parcela = total × percentual, arredondado em
 *   centavos pela NBR 5891; a diferença de arredondamento vai para a parcela de PARCELA_COM_RESTO.
 */
export function ratearParcelas(total: number, percentuais: number[]): number[] {
    const n = percentuais.length
    if (n === 0) return []

    const totalCentavos = mulDiv(total, 100, 1, 0)

    const centavos: number[] = new Array(n)
    const iguais = Math.round((Math.max(...percentuais) - Math.min(...percentuais)) * 100) <= 1

    if (iguais) {
        centavos.fill(Math.floor(totalCentavos / n))
    } else {
        percentuais.forEach((p, i) => { centavos[i] = mulDiv(totalCentavos, p, 100, 0) })
    }

    const indiceDoResto = PARCELA_COM_RESTO === 'primeira' ? 0 : n - 1
    centavos[indiceDoResto] += totalCentavos - centavos.reduce((acc, c) => acc + c, 0)

    return centavos.map(c => c / 100)
}
