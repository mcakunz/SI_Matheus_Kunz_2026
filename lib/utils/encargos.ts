import { mulDiv, r2 } from "./arredondamento"

const MS_DIA = 24 * 60 * 60 * 1000
const paraUTC = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const deUTC = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** Data de hoje no fuso local, em "YYYY-MM-DD". */
export function hojeISO(agora: Date = new Date()): string {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`
}

export function somarDias(iso: string, dias: number): string {
    return deUTC(paraUTC(iso) + dias * MS_DIA)
}

/** Dias corridos de `de` até `ate` (positivo se `ate` for depois). */
export function diasEntre(de: string, ate: string): number {
    return Math.round((paraUTC(ate) - paraUTC(de)) / MS_DIA)
}

/**
 * Vencimento em sábado ou domingo pode ser pago no primeiro dia útil seguinte sem encargos
 * (prática bancária; Lei 7.089/1983). Feriados não são considerados (não há cadastro deles).
 */
export function vencimentoEfetivo(dataVencimento: string): string {
    const diaSemana = new Date(paraUTC(dataVencimento)).getUTCDay() // 0 = domingo, 6 = sábado
    if (diaSemana === 6) return somarDias(dataVencimento, 2)
    if (diaSemana === 0) return somarDias(dataVencimento, 1)
    return dataVencimento
}

// ---------------------------------------------------------------------------
// ENCARGOS DE UM PAGAMENTO
// Calculados sobre o valor principal que está sendo pago agora (num pagamento parcial, o resto do
// saldo continua aberto e paga os seus encargos quando for pago). Somando todos os pagamentos de um
// título, a multa total fica exatamente % x valor do título.
//
//   Em atraso = pagamento depois do vencimento efetivo (fim de semana empurra para segunda).
//   multa     = principal x %multa                                (uma vez, se em atraso)
//   juros     = principal x %juros ao mês x dias de atraso / 30   (juros simples, mês comercial de 30
//               dias; os dias contam desde o vencimento ORIGINAL, como decidiu o STJ no REsp 1.954.924)
//   desconto  = principal x %desconto                             (só se pago até o vencimento)
//   total     = principal + juros + multa - desconto
// Tudo arredondado em centavos pela NBR 5891.
// ---------------------------------------------------------------------------

export interface DadosEncargos {
    valorPrincipal: number
    dataVencimento: string
    dataPagamento: string
    percentualJuros: number    // % ao mês
    percentualMulta: number    // %
    percentualDesconto: number // %
}

export interface Encargos {
    vencimentoEfetivo: string
    emAtraso: boolean
    diasAtraso: number
    juros: number
    multa: number
    desconto: number
    total: number
}

export function calcularEncargos(d: DadosEncargos): Encargos {
    const efetivo = vencimentoEfetivo(d.dataVencimento)
    const emAtraso = d.dataPagamento > efetivo
    const diasAtraso = emAtraso ? diasEntre(d.dataVencimento, d.dataPagamento) : 0
    const principal = Number(d.valorPrincipal) || 0

    const multa = emAtraso ? mulDiv(principal, Number(d.percentualMulta) || 0, 100, 2) : 0
    // % ao mês x dias (exato: % tem 2 casas e dias é inteiro) / (100 x 30)
    const percentualNoPeriodo = mulDiv(Number(d.percentualJuros) || 0, diasAtraso, 1, 6)
    const juros = emAtraso ? mulDiv(principal, percentualNoPeriodo, 3000, 2) : 0
    const desconto = emAtraso ? 0 : mulDiv(principal, Number(d.percentualDesconto) || 0, 100, 2)

    return {
        vencimentoEfetivo: efetivo,
        emAtraso,
        diasAtraso,
        juros,
        multa,
        desconto,
        total: r2(principal + juros + multa - desconto),
    }
}
