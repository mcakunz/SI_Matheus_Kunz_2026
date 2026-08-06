"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
    /** Índice de empilhamento — 0 é o primeiro modal, 1 o próximo aberto por cima, etc. */
    nivel?: number
    maxWidth?: string
    /**
     * Se false, esta instância ignora a tecla ESC. Necessário quando há
     * modais empilhados: se todos escutassem ESC, uma única tecla fecharia
     * todos de uma vez. Quem empilha (ex: CadastroModalProvider) deve
     * passar true só para o modal do topo.
     */
    escFecha?: boolean
}

export function Modal({ isOpen, title, onClose, children, nivel = 0, maxWidth = "max-w-2xl", escFecha = true }: ModalProps) {
    // Trava o scroll da página de fundo enquanto qualquer instância estiver aberta.
    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    // Só a instância do topo (escFecha=true) deve reagir a ESC.
    useEffect(() => {
        if (!isOpen || !escFecha) return
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [isOpen, escFecha, onClose])

    if (!isOpen) return null

    const zBase = 50 + nivel * 10

    return (
        <div className="fixed inset-0 flex items-start justify-center overflow-y-auto py-10 px-4" style={{ zIndex: zBase }}>
            {/* Fundo com fade + blur para puxar o foco para o modal */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                style={{ zIndex: zBase }}
                onClick={onClose}
            />

            {/* Borda e sombra mais fortes que um card comum, pra não se misturar com a página branca atrás */}
            <div
                className={`relative w-full ${maxWidth} bg-white border-2 border-slate-300 rounded-xl shadow-2xl`}
                style={{ zIndex: zBase + 1 }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}