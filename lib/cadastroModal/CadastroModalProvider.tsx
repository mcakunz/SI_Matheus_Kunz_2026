"use client"


import { ComponentType, createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { cadastroModalRegistry } from "./registry"
import { QuickCreateFormProps, TipoCadastroModal, TipoCadastroModalMap } from "./types"

interface ItemPilha {
    id: string
    tipo: TipoCadastroModal
    onSuccess: (novo: any) => void
    /** Preenchido quando o modal é de EDIÇÃO: id do registro a carregar. */
    registroId?: number
}

interface CadastroModalContextValue {
    abrirCadastro: <T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => void
    /** Abre o Form do tipo já preenchido com o registro `registroId`, para editar. */
    abrirEdicao: <T extends TipoCadastroModal>(
        tipo: T,
        registroId: number,
        onSuccess: (editado: TipoCadastroModalMap[T]) => void
    ) => void
    /** Se o tipo tem edição em modal configurada no registry. */
    podeEditar: (tipo: TipoCadastroModal) => boolean
    /** Usado por useAvisarAlteracoes: o Form dentro do modal `itemId` diz se tem alterações. */
    avisarAlteracao: (itemId: string, alterado: boolean) => void
    /** Se há algum modal de cadastro/edição aberto (o Esc deve ir só para ele). */
    haModalAberto: boolean
}

// Id do modal (item da pilha) em que o componente está. Fora de um modal de cadastro vale null.
const ItemModalContext = createContext<string | null>(null)

/**
 * Chamado pelos Forms com o `isDirty` do react-hook-form. Dentro de um modal de cadastro/edição,
 * faz o "Fechar sem salvar?" só aparecer quando algum campo foi alterado. Fora de modal não faz nada.
 */
export function useAvisarAlteracoes(alterado: boolean) {
    const itemId = useContext(ItemModalContext)
    const avisar = useContext(CadastroModalContext)?.avisarAlteracao
    useEffect(() => {
        if (itemId && avisar) avisar(itemId, alterado)
    }, [itemId, avisar, alterado])
}

// O Form recebe, além de onSuccess/onCancel, as props carregadas (ex.: produto, listas...).
type FormComProps = ComponentType<QuickCreateFormProps<unknown> & Record<string, unknown>>

/** Carrega o registro (server action do registry) e só então mostra o Form preenchido. */
function ConteudoEdicao({ tipo, registroId, onSuccess, onCancel }: {
    tipo: TipoCadastroModal
    registroId: number
    onSuccess: (editado: unknown) => void
    onCancel: () => void
}) {
    const config = cadastroModalRegistry[tipo]
    const [props, setProps] = useState<Record<string, unknown> | null>(null)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        let ativo = true
        const carregar = config.edicao?.carregar
        if (!carregar) return
        carregar(registroId)
            .then(p => {
                if (!ativo) return
                if (p) setProps(p)
                else setErro("Registro não encontrado. Ele pode ter sido excluído.")
            })
            .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : "Não foi possível carregar o registro.") })
        return () => { ativo = false }
    }, [config, registroId])

    if (!config.edicao) return <p className="py-8 text-center text-sm text-red-600">Este cadastro não pode ser editado por aqui.</p>
    if (erro) return <p className="py-8 text-center text-sm text-red-600">{erro}</p>
    if (!props) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner />
            </div>
        )
    }

    const Componente = config.Componente as FormComProps
    return <Componente {...props} onSuccess={onSuccess} onCancel={onCancel} />
}

const CadastroModalContext = createContext<CadastroModalContextValue | null>(null)

export function CadastroModalProvider({ children }: { children: React.ReactNode }) {
    const [pilha, setPilha] = useState<ItemPilha[]>([])
    const [pedindoFecharId, setPedindoFecharId] = useState<string | null>(null)
    // Por modal aberto: se o Form avisou alterações (isDirty) e se o usuário digitou/mudou algum campo
    // (eventos input/change). Os dois juntos cobrem campos com onChange próprio, que o isDirty não vê.
    const alteracoesRef = useRef<Record<string, { formulario: boolean; digitou: boolean }>>({})

    const abrirCadastro = useCallback(<T extends TipoCadastroModal>(
        tipo: T,
        onSuccess: (novo: TipoCadastroModalMap[T]) => void
    ) => {
        const id = `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setPilha(prev => [...prev, { id, tipo, onSuccess }])
    }, [])

    const abrirEdicao = useCallback(<T extends TipoCadastroModal>(
        tipo: T,
        registroId: number,
        onSuccess: (editado: TipoCadastroModalMap[T]) => void
    ) => {
        const id = `${tipo}-edicao-${registroId}-${Date.now()}`
        setPilha(prev => [...prev, { id, tipo, onSuccess, registroId }])
    }, [])

    const podeEditar = useCallback((tipo: TipoCadastroModal) => !!cadastroModalRegistry[tipo].edicao, [])

    const fecharDireto = useCallback((id: string) => {
        delete alteracoesRef.current[id]
        setPilha(prev => prev.filter(item => item.id !== id))
    }, [])

    const avisarAlteracao = useCallback((itemId: string, alterado: boolean) => {
        const atual = alteracoesRef.current[itemId] ?? { formulario: false, digitou: false }
        alteracoesRef.current[itemId] = { ...atual, formulario: alterado }
    }, [])

    const marcarDigitou = useCallback((itemId: string) => {
        const atual = alteracoesRef.current[itemId] ?? { formulario: false, digitou: false }
        alteracoesRef.current[itemId] = { ...atual, digitou: true }
    }, [])

    // Só pergunta "Fechar sem salvar?" se algo foi alterado; com o formulário intocado, fecha direto.
    const solicitarFechar = useCallback((id: string) => {
        const a = alteracoesRef.current[id]
        if (a?.formulario || a?.digitou) setPedindoFecharId(id)
        else fecharDireto(id)
    }, [fecharDireto])

    const confirmarFechamento = () => {
        if (pedindoFecharId) fecharDireto(pedindoFecharId)
        setPedindoFecharId(null)
    }

    const itemPedindoFechar = pilha.find(i => i.id === pedindoFecharId)
    const tituloDoItem = (item: ItemPilha) => {
        const config = cadastroModalRegistry[item.tipo]
        return item.registroId !== undefined ? (config.edicao?.titulo ?? config.titulo) : config.titulo
    }
    const tituloItemPedindoFechar = itemPedindoFechar ? tituloDoItem(itemPedindoFechar) : ''

    return (
        <CadastroModalContext.Provider value={{ abrirCadastro, abrirEdicao, podeEditar, avisarAlteracao, haModalAberto: pilha.length > 0 }}>
            {children}

            {pilha.map((item, index) => {
                const config = cadastroModalRegistry[item.tipo]
                const Componente = config.Componente
                const ehTopo = index === pilha.length - 1
                const aoSalvar = (registro: unknown) => {
                    item.onSuccess(registro)
                    fecharDireto(item.id)
                }

                return (
                    <Modal
                        key={item.id}
                        isOpen
                        title={tituloDoItem(item)}
                        onClose={() => solicitarFechar(item.id)}
                        nivel={index}
                        maxWidth={config.largura}
                        escFecha={ehTopo && !pedindoFecharId}
                    >
                        <ItemModalContext.Provider value={item.id}>
                            <div onInput={() => marcarDigitou(item.id)} onChange={() => marcarDigitou(item.id)}>
                                {item.registroId !== undefined ? (
                                    <ConteudoEdicao
                                        tipo={item.tipo}
                                        registroId={item.registroId}
                                        onSuccess={aoSalvar}
                                        onCancel={() => solicitarFechar(item.id)}
                                    />
                                ) : (
                                    <Componente
                                        onSuccess={aoSalvar}
                                        onCancel={() => solicitarFechar(item.id)}
                                    />
                                )}
                            </div>
                        </ItemModalContext.Provider>
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