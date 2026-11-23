"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Modal } from "@/components/ui/Modal"
import { FormInput } from "@/components/ui/FormInput"
import { r2 } from "@/lib/utils/arredondamento"
import { estornarPagamento, listarPagamentosDaConta } from "../actions"
import type { ContaPagarLinha, PagamentoLinha } from "../tipos"
import { descreverDocumento, fmtData, fmtMoeda } from "./formatos"

interface PagamentosContaModalProps {
    conta: ContaPagarLinha
    onClose: () => void
    /** Chamado depois de um estorno (a listagem é recarregada pelo servidor). */
    onAlterado: () => void
}

/** Histórico de pagamentos do título; cada pagamento ativo pode ser estornado (com motivo). */
export function PagamentosContaModal({ conta, onClose, onAlterado }: PagamentosContaModalProps) {
    const [pagamentos, setPagamentos] = useState<PagamentoLinha[] | null>(null)
    const [estornando, setEstornando] = useState<number | null>(null) // id do pagamento com o motivo aberto
    const [motivo, setMotivo] = useState('')
    const [salvando, setSalvando] = useState(false)

    const carregar = useCallback(async () => {
        try {
            setPagamentos(await listarPagamentosDaConta(conta.id))
        } catch {
            toast.error("Não foi possível carregar os pagamentos.")
            setPagamentos([])
        }
    }, [conta.id])

    useEffect(() => {
        let ativo = true
        listarPagamentosDaConta(conta.id)
            .then(p => { if (ativo) setPagamentos(p) })
            .catch(() => { if (ativo) { toast.error("Não foi possível carregar os pagamentos."); setPagamentos([]) } })
        return () => { ativo = false }
    }, [conta.id])

    const confirmarEstorno = async (pagamentoId: number) => {
        if (motivo.trim().length < 3) { toast.error("Informe o motivo do estorno."); return }
        setSalvando(true)
        try {
            await estornarPagamento(pagamentoId, motivo)
            toast.success("Pagamento estornado.")
            setEstornando(null)
            setMotivo('')
            await carregar()
            onAlterado()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível estornar o pagamento.")
        } finally {
            setSalvando(false)
        }
    }

    const ativos = (pagamentos ?? []).filter(p => p.situacao === 'ATIVO')
    const abatido = r2(ativos.reduce((s, p) => s + p.valorPrincipal, 0))
    const saldo = r2(conta.valorOriginal - abatido)

    return (
        <Modal isOpen title="Pagamentos do título" onClose={onClose} maxWidth="max-w-6xl">
            <div className="flex flex-col gap-4 text-slate-900">
                <div className="flex flex-wrap gap-x-8 gap-y-1 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <span><span className="text-slate-500">Documento:</span> <strong>{descreverDocumento(conta)}</strong></span>
                    <span><span className="text-slate-500">Fornecedor:</span> {conta.fornecedor}</span>
                    <span><span className="text-slate-500">Valor:</span> {fmtMoeda(conta.valorOriginal)}</span>
                    <span><span className="text-slate-500">Abatido:</span> {fmtMoeda(abatido)}</span>
                    <span><span className="text-slate-500">Saldo:</span> <strong>{fmtMoeda(conta.situacao === 'CANCELADO' ? 0 : saldo)}</strong></span>
                    {conta.situacao === 'CANCELADO' && (
                        <span className="text-slate-500">Cancelado: {conta.motivoCancelamento}</span>
                    )}
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-3 py-2 font-semibold">Data</th>
                                <th className="px-3 py-2 font-semibold">Forma</th>
                                <th className="px-3 py-2 font-semibold text-right">Abatido</th>
                                <th className="px-3 py-2 font-semibold text-right">Juros</th>
                                <th className="px-3 py-2 font-semibold text-right">Multa</th>
                                <th className="px-3 py-2 font-semibold text-right">Desconto</th>
                                <th className="px-3 py-2 font-semibold text-right">Total pago</th>
                                <th className="px-3 py-2 font-semibold">Situação</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pagamentos === null ? (
                                <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">Carregando...</td></tr>
                            ) : pagamentos.length === 0 ? (
                                <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">Nenhum pagamento registrado para este título.</td></tr>
                            ) : pagamentos.map(p => (
                                <Fragment key={p.id}>
                                    <tr className={p.situacao === 'ESTORNADO' ? 'text-slate-400' : undefined}>
                                        <td className="px-3 py-2 whitespace-nowrap">{fmtData(p.dataPagamento)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{p.formaPagamento}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoeda(p.valorPrincipal)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoeda(p.valorJuros)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoeda(p.valorMulta)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{fmtMoeda(p.valorDesconto)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap font-semibold">{fmtMoeda(p.valorPago)}</td>
                                        <td className="px-3 py-2" style={{ minWidth: 220 }}>
                                            {p.situacao === 'ATIVO' ? (
                                                <span className="text-emerald-700 font-medium">Ativo</span>
                                            ) : (
                                                <>
                                                    <span className="font-medium">Estornado em {fmtData(p.dataEstorno)}</span>
                                                    {p.motivoEstorno && <span className="block text-xs">{p.motivoEstorno}</span>}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                            {p.situacao === 'ATIVO' && estornando !== p.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setEstornando(p.id); setMotivo('') }}
                                                    className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                >
                                                    Estornar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Motivo do estorno numa linha própria, logo abaixo do pagamento. */}
                                    {estornando === p.id && (
                                        <tr className="bg-rose-50/60">
                                            <td colSpan={9} className="px-3 py-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-medium text-rose-700">Estornar este pagamento:</span>
                                                    <FormInput
                                                        autoFocus
                                                        value={motivo}
                                                        onChange={e => setMotivo(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarEstorno(p.id) } }}
                                                        placeholder="Motivo do estorno (obrigatório)"
                                                        maxLength={150}
                                                        className="text-sm flex-1"
                                                        style={{ minWidth: 260 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={salvando}
                                                        onClick={() => confirmarEstorno(p.id)}
                                                        className="px-3 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded disabled:opacity-50"
                                                    >
                                                        {salvando ? "Estornando..." : "Confirmar estorno"}
                                                    </button>
                                                    <button type="button" onClick={() => setEstornando(null)} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900">
                                                        Voltar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-slate-500">
                    Estornar não apaga o pagamento: ele continua no histórico como estornado, e o saldo do título volta a ficar em aberto.
                </p>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </Modal>
    )
}
