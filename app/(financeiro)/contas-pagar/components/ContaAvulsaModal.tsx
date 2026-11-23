"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSelect } from "@/components/ui/FormSelect"
import { CampoNumerico } from "@/components/ui/CampoNumerico"
import { FornecedorLookup } from "@/app/components/ui/FornecedorLookup"
import { useCadastroModal } from "@/lib/cadastroModal/CadastroModalProvider"
import { hojeISO } from "@/lib/utils/encargos"
import { listarFornecedoresAtivos } from "@/app/(cadastros)/fornecedores/actions"
import { listarFormasPagamentoAtivas } from "@/app/(financeiro)/formas-pagamento/actions"
import { lancarContaAvulsa } from "../actions"

interface ContaAvulsaModalProps {
    onClose: () => void
    onLancada: () => void
}

/** Lança uma conta a pagar sem nota (aluguel, energia, serviço...). Um título, parcela 1/1. */
export function ContaAvulsaModal({ onClose, onLancada }: ContaAvulsaModalProps) {
    // Com um cadastro rápido (ex.: novo fornecedor) aberto por cima, o Esc é dele.
    const { haModalAberto } = useCadastroModal()

    const [fornecedores, setFornecedores] = useState<{ id: number; fornecedor: string }[]>([])
    const [formas, setFormas] = useState<{ id: number; formaPagamento: string }[]>([])

    const [fornecedorId, setFornecedorId] = useState('')
    const [descricao, setDescricao] = useState('')
    const [formaPagamentoId, setFormaPagamentoId] = useState('')
    const [valor, setValor] = useState(0)
    const [dataEmissao, setDataEmissao] = useState(hojeISO())
    const [dataVencimento, setDataVencimento] = useState('')
    const [juros, setJuros] = useState(0)
    const [multa, setMulta] = useState(0)
    const [desconto, setDesconto] = useState(0)
    const [observacoes, setObservacoes] = useState('')
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        let ativo = true
        Promise.all([listarFornecedoresAtivos(), listarFormasPagamentoAtivas()])
            .then(([f, fp]) => {
                if (!ativo) return
                setFornecedores(f)
                setFormas(fp)
            })
            .catch(() => toast.error("Não foi possível carregar fornecedores e formas de pagamento."))
        return () => { ativo = false }
    }, [])

    const erro =
        !fornecedorId ? "Escolha o fornecedor." :
        !descricao.trim() ? "Informe a descrição da conta." :
        !formaPagamentoId ? "Escolha a forma de pagamento." :
        !(valor > 0) ? "Informe o valor da conta." :
        !dataEmissao ? "Informe a data de emissão." :
        !dataVencimento ? "Informe o vencimento." :
        dataVencimento < dataEmissao ? "O vencimento não pode ser anterior à emissão." :
        [juros, multa, desconto].some(p => p < 0 || p > 100) ? "Percentuais devem ficar entre 0 e 100." :
        null

    const salvar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (erro) { toast.error(erro); return }
        setSalvando(true)
        try {
            await lancarContaAvulsa({
                fornecedorId: Number(fornecedorId),
                descricao,
                formaPagamentoId: Number(formaPagamentoId),
                valorOriginal: valor,
                dataEmissao,
                dataVencimento,
                percentualJuros: juros,
                percentualMulta: multa,
                percentualDesconto: desconto,
                observacoes,
            })
            toast.success("Conta lançada.")
            onLancada()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível lançar a conta.")
        } finally {
            setSalvando(false)
        }
    }

    return (
        <Modal isOpen title="Nova conta avulsa" onClose={onClose} maxWidth="max-w-4xl" escFecha={!haModalAberto}>
            <form onSubmit={salvar} className="flex flex-col gap-5 text-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel required>Fornecedor</FormLabel>
                        <FornecedorLookup
                            fornecedores={fornecedores}
                            value={fornecedorId}
                            onChange={setFornecedorId}
                            onCriado={novo => setFornecedores(prev => [...prev, novo])}
                        />
                    </div>
                    <div>
                        <FormLabel required>Descrição</FormLabel>
                        <FormInput value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex.: Aluguel de novembro" maxLength={150} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <FormLabel required>Valor</FormLabel>
                        <CampoNumerico ariaLabel="Valor" value={valor} onChange={setValor} casas={2} casasMinimas={2} maxInteiros={11} />
                    </div>
                    <div>
                        <FormLabel required>Forma de pagamento</FormLabel>
                        <FormSelect value={formaPagamentoId} onChange={e => setFormaPagamentoId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {formas.map(f => <option key={f.id} value={f.id}>{f.formaPagamento}</option>)}
                        </FormSelect>
                    </div>
                    <div>
                        <FormLabel required>Emissão</FormLabel>
                        <FormInput type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} />
                    </div>
                    <div>
                        <FormLabel required>Vencimento</FormLabel>
                        <FormInput type="date" value={dataVencimento} min={dataEmissao || undefined} onChange={e => setDataVencimento(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <FormLabel>Juros (% ao mês)</FormLabel>
                        <CampoNumerico ariaLabel="Juros ao mês" value={juros} onChange={setJuros} casas={2} casasMinimas={2} maxInteiros={3} />
                    </div>
                    <div>
                        <FormLabel>Multa por atraso (%)</FormLabel>
                        <CampoNumerico ariaLabel="Multa" value={multa} onChange={setMulta} casas={2} casasMinimas={2} maxInteiros={3} />
                    </div>
                    <div>
                        <FormLabel>Desconto até o vencimento (%)</FormLabel>
                        <CampoNumerico ariaLabel="Desconto" value={desconto} onChange={setDesconto} casas={2} casasMinimas={2} maxInteiros={3} />
                    </div>
                </div>

                <div>
                    <FormLabel>Observações</FormLabel>
                    <FormInput value={observacoes} onChange={e => setObservacoes(e.target.value)} maxLength={500} />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Cancelar
                    </button>
                    <Button type="submit" disabled={salvando} className="px-6">
                        {salvando ? "Salvando..." : "Lançar conta"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
