"use client"


import { createContext, useCallback, useContext, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { cadastroModalRegistry } from "./registry"
import { TipoCadastroModal, TipoCadastroModalMap } from "./types"

interface ItemPilha {
    id: string
    tipo: TipoCadastroModal
    onSuccess: (novo: any) => void
}

interface CadastroModalContextValue {
    abrirCadastro: <T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => void
}

const CadastroModalContext = createContext<CadastroModalContextValue | null>(null)

export function CadastroModalProvider({ children }: { children: React.ReactNode }) {
    const [pilha, setPilha] = useState<ItemPilha[]>([])
    const [pedindoFecharId, setPedindoFecharId] = useState<string | null>(null)

    const abrirCadastro = useCallback(<T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => {
        const id = `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setPilha(prev => [...prev, { id, tipo, onSuccess }])
    }, [])

    const fecharDireto = useCallback((id: string) => {
        setPilha(prev => prev.filter(item => item.id !== id))
    }, [])

    const solicitarFechar = useCallback((id: string) => {
        setPedindoFecharId(id)
    }, [])

    const confirmarFechamento = () => {
        if (pedindoFecharId) fecharDireto(pedindoFecharId)
        setPedindoFecharId(null)
    }

    const tituloItemPedindoFechar = pilha.find(i => i.id === pedindoFecharId)
        ? cadastroModalRegistry[pilha.find(i => i.id === pedindoFecharId)!.tipo].titulo
        : ''

    return (
        <CadastroModalContext.Provider value={{ abrirCadastro }}>
            {children}

            {pilha.map((item, index) => {
                const config = cadastroModalRegistry[item.tipo]
                const Componente = config.Componente
                const ehTopo = index === pilha.length - 1

                return (
                    <Modal
                        key={item.id}
                        isOpen
                        title={config.titulo}
                        onClose={() => solicitarFechar(item.id)}
                        nivel={index}
                        escFecha={ehTopo && !pedindoFecharId}
                    >
                        <Componente
                            onSuccess={(novo: any) => {
                                item.onSuccess(novo)
                                fecharDireto(item.id)
                            }}
                            onCancel={() => solicitarFechar(item.id)}
                        />
                    </Modal>
                )
            })}

            <Modal
                isOpen={!!pedindoFecharId}
                title="Fechar sem salvar?"
                onClose={() => setPedindoFecharId(null)}
                nivel={pilha.length}
                maxWidth="max-w-sm"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-600">
                        Os dados preenchidos {tituloItemPedindoFechar && `em "${tituloItemPedindoFechar}"`} serão perdidos. Deseja realmente fechar?
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setPedindoFecharId(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Continuar editando
                        </button>
                        <button
                            type="button"
                            onClick={confirmarFechamento}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Fechar mesmo assim
                        </button>
                    </div>
                </div>
            </Modal>
        </CadastroModalContext.Provider>
    )
}

export function useCadastroModal() {
    const ctx = useContext(CadastroModalContext)
    if (!ctx) {
        throw new Error("useCadastroModal precisa ser usado dentro de <CadastroModalProvider>. Confira se ele está no layout raiz.")
    }
    return ctx
}