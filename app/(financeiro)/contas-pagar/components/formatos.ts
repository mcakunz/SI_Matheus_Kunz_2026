import { hojeISO, vencimentoEfetivo } from "@/lib/utils/encargos"
import type { ContaPagarLinha } from "../tipos"

export const fmtMoeda = (n: number | null | undefined) =>
    (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtPercentual = (n: number) =>
    `${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`

/** "YYYY-MM-DD" -> "DD/MM/AAAA" */
export const fmtData = (iso: string | null | undefined) =>
    iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—'

/** "NF 123 · Série 1 · Mod. 55 · Parc. 2/3" ou a descrição da conta avulsa. */
export function descreverDocumento(c: ContaPagarLinha): string {
    if (c.origem === 'AVULSA') return c.descricao ?? 'Conta avulsa'
    return `NF ${c.notaNumero} · Série ${c.notaSerie} · Mod. ${c.notaModelo} · Parc. ${c.numeroParcela}/${c.totalParcelas}`
}

export const estaEmAberto = (c: ContaPagarLinha) => c.situacao === 'PENDENTE' || c.situacao === 'PARCIAL'

/** Em aberto e já passou do vencimento efetivo (sábado/domingo vão para segunda). */
export const estaVencida = (c: ContaPagarLinha, hoje: string = hojeISO()) =>
    estaEmAberto(c) && hoje > vencimentoEfetivo(c.dataVencimento)
