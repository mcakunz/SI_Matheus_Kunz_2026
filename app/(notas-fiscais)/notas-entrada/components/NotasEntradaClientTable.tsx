"use client"

import Link from "next/link"
import toast from "react-hot-toast"
import { HiPlus, HiBan } from "react-icons/hi"
import { NotaEntradaView } from "@/lib/types"
import { cancelarNotaEntrada } from "../actions"

const SITUACAO_LABELS: Record<string, string> = {
    LANCADA: "Lançada",
    CANCELADA: "Cancelada",
}

const SITUACAO_ESTILOS: Record<string, string> = {
    LANCADA: "bg-emerald-100 text-emerald-700",
    CANCELADA: "bg-rose-100 text-rose-700",
}

interface NotasEntradaClientTableProps {
    notas: NotaEntradaView[]
}

export function NotasEntradaClientTable({ notas }: NotasEntradaClientTableProps) {

    // Uma nota lançada nunca é editada nem excluída — só cancelada. Por isso não existe mais
    // link de edição nem botão de exclusão aqui, e a situação deixou de ser um <select> livre:
    // é só um selo (read-only) + um botão "Cancelar", que só aparece enquanto a nota ainda
    // está LANCADA (uma nota já cancelada não tem mais nenhuma ação disponível).
    const handleCancelar = async (nota: NotaEntradaView) => {
        if (!confirm(`Tem certeza que deseja cancelar a nota ${nota.numero}? Esta ação não pode ser desfeita.`)) return
        try {
            await cancelarNotaEntrada(nota.numero, nota.modelo, nota.serie, nota.fornecedorId)
            toast.success("Nota de entrada cancelada.")
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800">Listagem de Notas</h2>
                <Link
                    href="/notas-entrada/novo"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 transition-colors shadow-sm"
                >
                    <HiPlus size={18} />
                    Nova Nota
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Nº NF</th>
                            <th className="px-4 py-3 font-semibold">Série / Mod.</th>
                            <th className="px-4 py-3 font-semibold">Fornecedor</th>
                            <th className="px-4 py-3 font-semibold">Emissão</th>
                            <th className="px-4 py-3 font-semibold">Valor Total</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {notas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                    Nenhuma nota de entrada registrada.
                                </td>
                            </tr>
                        ) : (
                            notas.map((nota) => {
                                // Chave composta completa apenas para uso como `key` do React (identidade da linha).
                                const reactKey = `${nota.numero}|${nota.modelo}|${nota.serie}|${nota.fornecedorId}`
                                return (
                                    <tr key={reactKey} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{nota.numero}</td>
                                        <td className="px-4 py-3">{nota.serie} ({nota.modelo})</td>
                                        <td className="px-4 py-3">{nota.fornecedor}</td>
                                        <td className="px-4 py-3">
                                            {new Date(nota.dataEmissao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-emerald-600">
                                            {Number(nota.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${SITUACAO_ESTILOS[nota.situacao] ?? 'bg-slate-100 text-slate-700'}`}>
                                                {SITUACAO_LABELS[nota.situacao] ?? nota.situacao}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {nota.situacao === 'LANCADA' ? (
                                                    <button
                                                        onClick={() => handleCancelar(nota)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                        title="Cancelar Nota"
                                                    >
                                                        <HiBan size={15} />
                                                        Cancelar
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}