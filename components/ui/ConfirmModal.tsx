"use client"

import { Modal } from "@/components/ui/Modal"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message: string
    variant?: 'danger' | 'warning' | 'primary' | 'success'
    confirmText?: string
    loading?: boolean
}

export function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirmar Ação", 
    message, 
    variant = 'danger',
    confirmText = "Confirmar",
    loading = false 
}: ConfirmModalProps) {
    
    const buttonColors = {
        danger: 'bg-rose-600 hover:bg-rose-700 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-6">
                <p className="text-slate-700">{message}</p>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                        type="button" 
                        disabled={loading} 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-md font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        disabled={loading} 
                        onClick={onConfirm} 
                        className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${buttonColors[variant]}`}
                    >
                        {loading ? "Processando..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}