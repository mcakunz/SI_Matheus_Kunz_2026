"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
interface ModalProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: React.ReactNode
    nivel?: number
    maxWidth?: string
    escFecha?: boolean
}

export function Modal({ isOpen, title, onClose, children, nivel = 0, maxWidth = "max-w-2xl", escFecha = true }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

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
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                style={{ zIndex: zBase }}
                onClick={onClose}
            />
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