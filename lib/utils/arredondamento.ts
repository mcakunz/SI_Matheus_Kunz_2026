// ---------------------------------------------------------------------------
// ARREDONDAMENTO — ABNT NBR 5891 (mesma regra da Resolução IBGE nº 886/1966)
//
// Olha o primeiro algarismo que será descartado:
//   • 0 a 4                                  -> mantém o último algarismo que fica
//   • 6 a 9                                  -> aumenta 1 no último algarismo que fica
//   • 5 seguido de qualquer algarismo != 0   -> aumenta 1
//   • 5 sozinho (ou seguido só de zeros)     -> arredonda para o PAR mais próximo:
//                                               último algarismo ímpar -> sobe, par -> fica
//   Ex. (2 casas): 2,344 -> 2,34 | 2,346 -> 2,35 | 2,3451 -> 2,35 | 2,345 -> 2,34 | 2,355 -> 2,36
//
// Os cálculos são feitos em aritmética decimal exata (BigInt), não em ponto flutuante: em float,
// 1,005 é guardado como 1,00499999999999989..., então um empate "exato" (o caso em que a regra do
// par/ímpar importa) nunca seria detectado de forma confiável.
// ---------------------------------------------------------------------------

// O tsconfig do projeto compila abaixo de ES2020, onde literais BigInt (0n, 10n) e o operador **
// em bigint não existem — por isso as constantes e potências de 10 abaixo usam BigInt(...).
const ZERO = BigInt(0)
const UM = BigInt(1)
const DOIS = BigInt(2)
const potencia10 = (n: number): bigint => BigInt('1' + '0'.repeat(n))

interface Decimal {
    n: bigint   // valor = n / 10^s
    s: number
}

/** number -> decimal exato, usando a representação mais curta (a que o usuário "enxerga"). */
function paraDecimal(x: number): Decimal {
    if (!Number.isFinite(x)) throw new Error(`Valor numérico inválido para arredondamento: ${x}`)
    let texto = String(x)
    const negativo = texto.startsWith('-')
    if (negativo) texto = texto.slice(1)

    const [mantissa, expoente = '0'] = texto.split('e')
    const [inteiro, fracao = ''] = mantissa.split('.')

    let n = BigInt(inteiro + fracao)
    let s = fracao.length - Number(expoente)
    if (s < 0) { n *= potencia10(-s); s = 0 }

    return { n: negativo ? -n : n, s }
}

/**
 * Calcula (a × b ÷ c) em decimal exato e arredonda para `casas` casas pela NBR 5891.
 * Serve para multiplicar (c = 1), dividir (b = 1) ou regra de três (rateio, percentual de parcela).
 */
export function mulDiv(a: number, b: number, c: number, casas: number): number {
    const A = paraDecimal(a)
    const B = paraDecimal(b)
    const C = paraDecimal(c)
    if (C.n === ZERO) return 0

    // a×b÷c = (A.n × B.n × 10^C.s) / (C.n × 10^(A.s + B.s))
    let numerador   = A.n * B.n * potencia10(C.s + casas)
    let denominador = C.n * potencia10(A.s + B.s)

    const negativo = (numerador < ZERO) !== (denominador < ZERO)
    if (numerador < ZERO) numerador = -numerador
    if (denominador < ZERO) denominador = -denominador

    let q = numerador / denominador
    const dobroDoResto = (numerador % denominador) * DOIS
    if (dobroDoResto > denominador || (dobroDoResto === denominador && q % DOIS === UM)) q += UM

    return Number(negativo ? -q : q) / 10 ** casas
}

/** Arredonda `valor` para `casas` casas decimais pela NBR 5891. */
export function arredondar(valor: number, casas: number): number {
    return mulDiv(valor, 1, 1, casas)
}

// Atalhos: valores em reais usam 2 casas; unitários, custos, percentuais e rateios usam 6.
export const r2 = (n: number) => arredondar(n, 2)
export const r4 = (n: number) => arredondar(n, 4)
export const r6 = (n: number) => arredondar(n, 6)
