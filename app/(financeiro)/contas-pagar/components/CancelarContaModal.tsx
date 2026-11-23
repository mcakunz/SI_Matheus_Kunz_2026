"use client"

import { useState } from "react"
import toast from "react-hot-toast"

import { Modal } from "@/components/ui/Modal"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormTextArea } from "@/components/ui/FormTextArea"
import { cancelarContaAvulsa } from "../actions"
import type { ContaPagarLinha } from "../tipos"
import { descreverDocumento, fmtMoeda } from "./formatos"

interface CancelarContaModalProps {
    conta: ContaPagarLinha
    onClose: () => void
    onCancelado: () => void
}

/** Cancela uma conta avulsa sem pagamentos (o motivo fica gravado no título). */
export function CancelarContaModal({ conta, onClose, onCancelado }: CancelarContaModalProps) {
    const [motivo, setMotivo] = useState('')
    const [salvando, setSalvando] = useState(false)

    const confirmar = async () => {
        if (motivo.trim().length < 3) { toast.error("Informe o motivo do cancelamento."); return }
        setSalvando(true)
        try {
            await cancelarContaAvulsa(conta.id, motivo)
            toast.success("Conta cancelada.")
            onCancelado()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível cancelar a conta.")
        } finally {
            setSalvando(false)
        }
    }

    return (
        <Modal isOpen title="Cancelar conta" onClose={onClose} maxWidth="max-w-lg">
            <div className="flex flex-col gap-4 text-slate-900">
                <p className="text-sm text-slate-700">
                    Cancelar <strong>{descreverDocumento(conta)}</strong> de {conta.fornecedor}, no valor de {fmtMoeda(conta.valorOriginal)}?
                    O título continua no histórico como cancelado.
                </p>
                <div>
                    <FormLabel required>Motivo</FormLabel>
                    <FormTextArea autoFocus value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={150} rows={3} placeholder="Ex.: lançada em duplicidade" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Voltar
                    </button>
                    <button
                        type="button"
                        onClick={confirmar}
                        disabled={salvando}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {salvando ? "Cancelando..." : "Cancelar conta"}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
