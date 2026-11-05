"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Plus, Pencil } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { useCadastroModal } from "@/lib/cadastroModal/CadastroModalProvider"
import type { TipoCadastroModal, TipoCadastroModalMap } from "@/lib/cadastroModal/types"

/** Quantidade máxima de linhas desenhadas por vez (o resto some até a busca ser refinada). */
const LIMITE_EXIBICAO = 100

export interface PesquisaColuna<T> {
    titulo: string
    render: (item: T) => React.ReactNode
    /** Classes aplicadas no cabeçalho e nas células da coluna (ex.: "text-right"). */
    className?: string
}

export interface PesquisaCampo<T> {
    chave: string
    /** Texto mostrado na lista "Pesquisar por". */
    rotulo: string
    /** Texto (ou número) que será comparado com o termo digitado. */
    valor: (item: T) => string | number | null | undefined
    /** Se true, só casa quando o valor for IGUAL ao termo (útil para ID). */
    exato?: boolean
}

interface PesquisaModalProps<T extends { id: number }, K extends TipoCadastroModal> {
    isOpen: boolean
    onClose: () => void
    titulo: string
    itens: T[]
    colunas: PesquisaColuna<T>[]
    campos: PesquisaCampo<T>[]
    onSelecionar: (item: T) => void
    /** Chave registrada em lib/cadastroModal/registry.tsx — qual formulário abre no "Cadastrar novo". */
    tipoCadastro: K
    rotuloCadastro: string
    /** Chamado com o registro recém-criado. Quem usa o modal recarrega a lista e seleciona o novo item. */
    onCadastrado: (novo: TipoCadastroModalMap[K]) => void
    placeholderBusca?: string
    maxWidth?: string
    /**
     * Quando informado (e o tipo tem edição no registry), cada linha ganha um lápis que abre o
     * cadastro do registro num modal por cima deste. Ao salvar, chama esta função com { id, nome }
     * para quem usa o modal recarregar a lista. O modal de pesquisa continua aberto.
     */
    onEditado?: (editado: TipoCadastroModalMap[K]) => void
}

// Tira acentos e caixa para a busca ignorar "Açúcar" x "acucar".
const normalizar = (v: unknown) =>
    String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function PesquisaModal<T extends { id: number }, K extends TipoCadastroModal>({
    isOpen,
    onClose,
    titulo,
    itens,
    colunas,
    campos,
    onSelecionar,
    tipoCadastro,
    rotuloCadastro,
    onCadastrado,
    placeholderBusca = "Digite para pesquisar...",
    maxWidth = "max-w-4xl",
    onEditado,
}: PesquisaModalProps<T, K>) {
    const { abrirCadastro, abrirEdicao, podeEditar, haModalAberto } = useCadastroModal()
    const editavel = !!onEditado && podeEditar(tipoCadastro)
    const [busca, setBusca] = useState('')
    const [campoChave, setCampoChave] = useState('*')
    const [destaque, setDestaque] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const destaqueRef = useRef<HTMLTableRowElement>(null)

    // Cada abertura começa com a busca limpa.
    useEffect(() => {
        if (!isOpen) return
        setBusca('')
        setCampoChave('*')
        setDestaque(0)
        const t = setTimeout(() => inputRef.current?.focus(), 50)
        return () => clearTimeout(t)
    }, [isOpen])

    useEffect(() => { setDestaque(0) }, [busca, campoChave])

    const filtrados = useMemo(() => {
        if (!isOpen) return []
        const termo = normalizar(busca)
        if (!termo) return itens
        const camposAtivos = campoChave === '*' ? campos : campos.filter(c => c.chave === campoChave)
        return itens.filter(item =>
            camposAtivos.some(c => {
                const v = normalizar(c.valor(item))
                return c.exato ? v === termo : v.includes(termo)
            })
        )
    }, [isOpen, itens, busca, campoChave, campos])

    const visiveis = filtrados.slice(0, LIMITE_EXIBICAO)

    useEffect(() => {
        destaqueRef.current?.scrollIntoView({ block: 'nearest' })
    }, [destaque])

    const escolher = (item: T) => {
        onSelecionar(item)
        onClose()
    }

    const editar = (item: T) => {
        if (!onEditado) return
        abrirEdicao(tipoCadastro, item.id, onEditado)
    }

    const cadastrar = () => {
        abrirCadastro(tipoCadastro, (novo) => {
            onCadastrado(novo)
            onClose()
        })
    }

    const onKeyDownBusca = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Este modal fica dentro do <form> da nota: sem o preventDefault, o Enter enviaria o formulário.
        if (e.key === 'Enter') {
            e.preventDefault()
            const item = visiveis[destaque]
            if (item) escolher(item)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setDestaque(d => Math.min(d + 1, visiveis.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setDestaque(d => Math.max(d - 1, 0))
        }
    }

    return (
        // escFecha={false}: quando o cadastro rápido está aberto por cima, o ESC dele não pode
        // fechar este modal junto. O ESC daqui é tratado só quando o foco está dentro deste modal.
        <Modal isOpen={isOpen} title={titulo} onClose={onClose} maxWidth={maxWidth} escFecha={false}>
            <div
                className="flex flex-col gap-4"
                // Com um cadastro/edição aberto por cima, o Esc é dele: fecha só aquele, não a pesquisa.
                onKeyDown={e => { if (e.key === 'Escape' && !haModalAberto) onClose() }}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-300 rounded bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            onKeyDown={onKeyDownBusca}
                            placeholder={placeholderBusca}
                            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
                        Pesquisar por
                        <select
                            value={campoChave}
                            onChange={e => setCampoChave(e.target.value)}
                            className="px-2 py-2 border border-slate-300 rounded bg-white text-sm text-slate-800 outline-none focus:border-emerald-500"
                        >
                            <option value="*">Todos os campos</option>
                            {campos.map(c => (
                                <option key={c.chave} value={c.chave}>{c.rotulo}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-y-auto" style={{ maxHeight: '50vh' }}>
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0">
                            <tr>
                                {colunas.map(c => (
                                    <th key={c.titulo} className={`px-3 py-2 font-semibold whitespace-nowrap ${c.className ?? ''}`}>
                                        {c.titulo}
                                    </th>
                                ))}
                                {editavel && <th className="px-3 py-2 w-12" aria-label="Editar" />}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visiveis.length === 0 ? (
                                <tr>
                                    <td colSpan={colunas.length + (editavel ? 1 : 0)} className="px-3 py-8 text-center text-slate-400">
                                        Nada encontrado. Ajuste a busca ou use "{rotuloCadastro}".
                                    </td>
                                </tr>
                            ) : (
                                visiveis.map((item, i) => (
                                    <tr
                                        key={item.id}
                                        ref={i === destaque ? destaqueRef : undefined}
                                        onClick={() => escolher(item)}
                                        onMouseEnter={() => setDestaque(i)}
                                        className={`cursor-pointer transition-colors ${i === destaque ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                                    >
                                        {colunas.map(c => (
                                            <td key={c.titulo} className={`px-3 py-2 ${c.className ?? ''}`}>
                                                {c.render(item)}
                                            </td>
                                        ))}
                                        {editavel && (
                                            <td className="px-2 py-1 text-center">
                                                {/* stopPropagation: clicar no lápis não seleciona a linha. */}
                                                <button
                                                    type="button"
                                                    onClick={e => { e.stopPropagation(); editar(item) }}
                                                    title="Editar"
                                                    aria-label="Editar"
                                                    className="inline-flex p-1.5 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                        {filtrados.length === 1 ? '1 resultado' : `${filtrados.length} resultados`}
                        {filtrados.length > LIMITE_EXIBICAO && ` — mostrando os ${LIMITE_EXIBICAO} primeiros, refine a busca`}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={cadastrar}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                            <Plus size={15} />
                            {rotuloCadastro}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}