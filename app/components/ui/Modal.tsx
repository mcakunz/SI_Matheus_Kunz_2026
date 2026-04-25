"use client"

import { useEffect } from "react"

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
    sm: 'w-[400px]',
    md: 'w-[520px]',
    lg: 'w-[720px]',
    xl: 'w-[960px]',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} max-w-[calc(100vw-2rem)] flex flex-col max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 text-2xl leading-none transition-colors"
                        aria-label="Fechar"
                    >
                        &times;
                    </button>
                </div>

                <div className="px-6 py-5 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
