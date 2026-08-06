"use client"

// Único arquivo que precisa mudar para adicionar a confirmação de
// "fechar sem salvar" a TODOS os cadastros rápidos registrados — nenhum
// Form ou Lookup individual precisa saber que isso existe.

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
    /**
     * Abre o modal de cadastro rápido para o tipo informado.
     * `onSuccess` é chamado com o registro recém-criado assim que o
     * formulário salva com sucesso — o modal já fecha sozinho depois,
     * sem pedir confirmação (só pede confirmação ao descartar).
     */
    abrirCadastro: <T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => void
}

const CadastroModalContext = createContext<CadastroModalContextValue | null>(null)

export function CadastroModalProvider({ children }: { children: React.ReactNode }) {
    const [pilha, setPilha] = useState<ItemPilha[]>([])
    // id do item da pilha que o usuário tentou fechar e ainda precisa confirmar.
    const [pedindoFecharId, setPedindoFecharId] = useState<string | null>(null)

    const abrirCadastro = useCallback(<T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => {
        const id = `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setPilha(prev => [...prev, { id, tipo, onSuccess }])
    }, [])

    // Fecha de fato, sem perguntar nada — usado após salvar com sucesso
    // e também quando o usuário confirma que quer descartar.
    const fecharDireto = useCallback((id: string) => {
        setPilha(prev => prev.filter(item => item.id !== id))
    }, [])

    // Chamado por ESC, clique fora, botão X ou "Cancelar" do form — em vez
    // de fechar na hora, abre a confirmação, pra não perder dados por acidente.
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
                        // Enquanto a confirmação de fechar estiver aberta, o modal de
                        // baixo não deve reagir a ESC também (só a confirmação reage).
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

            {/*
              Confirmação de "fechar sem salvar". Usa o próprio Modal (não o
              ConfirmModal do projeto) com nivel = pilha.length, garantindo
              que ela sempre empilha por cima de qualquer cadastro aberto,
              não importa a profundidade do aninhamento.
              Se preferirem usar o ConfirmModal do projeto aqui para manter
              a mesma cara visual dos outros diálogos de confirmação, dá pra
              trocar — só verificar que ele também respeita esse nivel.
            */}
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