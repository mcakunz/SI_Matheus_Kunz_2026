"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSelect } from "@/components/ui/FormSelect"
import { CampoNumerico } from "@/components/ui/CampoNumerico"
import { calcularEncargos, hojeISO } from "@/lib/utils/encargos"
import { r2 } from "@/lib/utils/arredondamento"
import { listarFormasPagamentoAtivas } from "@/app/(financeiro)/formas-pagamento/actions"
import { registrarPagamento } from "../actions"
import type { ContaPagarLinha } from "../tipos"
import { descreverDocumento, fmtData, fmtMoeda, fmtPercentual } from "./formatos"

interface PagarContaModalProps {
    conta: ContaPagarLinha
    /** Aviso de parcela anterior da mesma nota ainda em aberto (pagar fora de ordem é permitido). */
    avisoOrdem: string | null
    onClose: () => void
    onPago: () => void
}

type Encargo = 'juros' | 'multa' | 'desconto'

/**
 * Registra um pagamento (total ou parcial) do título.
 * Juros, multa e desconto são sugeridos a partir da data e do valor abatido (ver calcularEncargos)
 * e podem ser alterados à mão (negociação com o fornecedor). "Usar valores calculados" volta à sugestão.
 */
export function PagarContaModal({ conta, avisoOrdem, onClose, onPago }: PagarContaModalProps) {
    const hoje = hojeISO()
    const [formas, setFormas] = useState<{ id: number; formaPagamento: string }[]>([])
    const [dataPagamento, setDataPagamento] = useState(hoje)
    const [formaPagamentoId, setFormaPagamentoId] = useState(String(conta.formaPagamentoId))
    const [principal, setPrincipal] = useState(conta.saldo)
    // undefined = usa o valor calculado; número = valor digitado pelo usuário
    const [ajustes, setAjustes] = useState<Partial<Record<Encargo, number>>>({})
    const [observacoes, setObservacoes] = useState('')
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        let ativo = true
        listarFormasPagamentoAtivas()
            .then(f => { if (ativo) setFormas(f) })
            .catch(() => toast.error("Não foi possível carregar as formas de pagamento."))
        return () => { ativo = false }
    }, [])

    const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(dataPagamento)
    const sugerido = calcularEncargos({
        valorPrincipal: principal,
        dataVencimento: conta.dataVencimento,
        dataPagamento: dataValida ? dataPagamento : hoje,
        percentualJuros: conta.percentualJuros,
        percentualMulta: conta.percentualMulta,
        percentualDesconto: conta.percentualDesconto,
    })
    const juros = ajustes.juros ?? sugerido.juros
    const multa = ajustes.multa ?? sugerido.multa
    const desconto = ajustes.desconto ?? sugerido.desconto
    const total = r2(principal + juros + multa - desconto)
    const temAjuste = Object.keys(ajustes).length > 0

    const erro =
        !dataValida ? "Informe a data do pagamento." :
        dataPagamento < conta.dataEmissao ? "A data do pagamento não pode ser anterior à emissão do título." :
        dataPagamento > hoje ? "A data do pagamento não pode ser futura." :
        !(principal > 0) ? "Informe o valor a abater." :
        principal > conta.saldo ? `O valor a abater não pode passar do saldo (${fmtMoeda(conta.saldo)}).` :
        desconto > principal ? "O desconto não pode ser maior que o valor abatido." :
        !(total > 0) ? "O total pago precisa ser maior que zero." :
        !formaPagamentoId ? "Escolha a forma de pagamento." :
        null

    const ajustar = (campo: Encargo, valor: number) => setAjustes(a => ({ ...a, [campo]: valor }))

    const confirmar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (erro) { toast.error(erro); return }
        setSalvando(true)
        try {
            await registrarPagamento({
                contaPagarId: conta.id,
                dataPagamento,
                formaPagamentoId: Number(formaPagamentoId),
                valorPrincipal: principal,
                valorJuros: juros,
                valorMulta: multa,
                valorDesconto: desconto,
                observacoes,
            })
            toast.success(principal >= conta.saldo ? "Título quitado." : "Pagamento parcial registrado.")
            onPago()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível registrar o pagamento.")
        } finally {
            setSalvando(false)
        }
    }

    const vencimentoMudou = sugerido.vencimentoEfetivo !== conta.dataVencimento

    return (
        <Modal isOpen title="Pagar título" onClose={onClose} maxWidth="max-w-3xl">
            <form onSubmit={confirmar} className="flex flex-col gap-5 text-slate-900">
                {/* Resumo do título */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <div className="col-span-2">
                        <p className="text-xs text-slate-500">Documento</p>
                        <p className="font-medium">{descreverDocumento(conta)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-slate-500">Fornecedor</p>
                        <p className="font-medium">{conta.fornecedor}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Vencimento</p>
                        <p className="font-medium">{fmtData(conta.dataVencimento)}</p>
                        {vencimentoMudou && (
                            <p className="text-xs text-slate-500">fim de semana: sem encargos até {fmtData(sugerido.vencimentoEfetivo)}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Valor do título</p>
                        <p className="font-medium tabular-nums">{fmtMoeda(conta.valorOriginal)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Já abatido</p>
                        <p className="font-medium tabular-nums">{fmtMoeda(conta.valorPrincipalPago)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Saldo</p>
                        <p className="font-bold tabular-nums text-slate-900">{fmtMoeda(conta.saldo)}</p>
                    </div>
                    <p className="col-span-2 md:col-span-4 text-xs text-slate-500">
                        Juros {fmtPercentual(conta.percentualJuros)} ao mês · Multa {fmtPercentual(conta.percentualMulta)} · Desconto {fmtPercentual(conta.percentualDesconto)} até o vencimento
                    </p>
                </div>

                {avisoOrdem && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">{avisoOrdem}</p>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <FormLabel required>Data do pagamento</FormLabel>
                        <FormInput type="date" value={dataPagamento} min={conta.dataEmissao} max={hoje} onChange={e => setDataPagamento(e.target.value)} />
                    </div>
                    <div>
                        <FormLabel required>Forma de pagamento</FormLabel>
                        <FormSelect value={formaPagamentoId} onChange={e => setFormaPagamentoId(e.target.value)}>
                            {/* a forma prevista no título aparece mesmo que tenha sido inativada */}
                            {!formas.some(f => String(f.id) === String(conta.formaPagamentoId)) && (
                                <option value={conta.formaPagamentoId}>{conta.formaPagamento}</option>
                            )}
                            {formas.map(f => <option key={f.id} value={f.id}>{f.formaPagamento}</option>)}
                        </FormSelect>
                    </div>
                    <div>
                        <FormLabel required>Valor a abater do saldo</FormLabel>
                        <CampoNumerico ariaLabel="Valor a abater" value={principal} onChange={setPrincipal} casas={2} casasMinimas={2} maxInteiros={11} />
                        {principal < conta.saldo && principal > 0 && (
                            <p className="text-xs text-slate-500 mt-1">Pagamento parcial: fica {fmtMoeda(r2(conta.saldo - principal))} em aberto.</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                            Encargos {sugerido.emAtraso
                                ? <span className="font-normal text-red-600">({sugerido.diasAtraso} dia{sugerido.diasAtraso === 1 ? '' : 's'} de atraso)</span>
                                : <span className="font-normal text-emerald-700">(em dia)</span>}
                        </p>
                        {temAjuste && (
                            <button type="button" onClick={() => setAjustes({})} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                Usar valores calculados
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <FormLabel>Juros (R$)</FormLabel>
                            <CampoNumerico ariaLabel="Juros" value={juros} onChange={n => ajustar('juros', n)} casas={2} casasMinimas={2} maxInteiros={11} />
                        </div>
                        <div>
                            <FormLabel>Multa (R$)</FormLabel>
                            <CampoNumerico ariaLabel="Multa" value={multa} onChange={n => ajustar('multa', n)} casas={2} casasMinimas={2} maxInteiros={11} />
                        </div>
                        <div>
                            <FormLabel>Desconto (R$)</FormLabel>
                            <CampoNumerico ariaLabel="Desconto" value={desconto} onChange={n => ajustar('desconto', n)} casas={2} casasMinimas={2} maxInteiros={11} />
                        </div>
                        <div>
                            <FormLabel>Total pago</FormLabel>
                            <div style={{ minHeight: 42 }} className="flex items-center justify-end px-3 rounded bg-emerald-600 text-white font-bold tabular-nums">
                                {fmtMoeda(total)}
                            </div>
                        </div>
                    </div>
                    {temAjuste && <p className="text-xs text-amber-700">Encargos alterados à mão (diferentes do cálculo automático).</p>}
                </div>

                <div>
                    <FormLabel>Observações</FormLabel>
                    <FormInput value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Ex.: comprovante, negociação..." maxLength={500} />
                </div>

                {erro && <p className="text-sm text-red-600">{erro}</p>}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Voltar
                    </button>
                    <Button type="submit" disabled={salvando || !!erro} className="px-6">
                        {salvando ? "Registrando..." : "Registrar pagamento"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
