"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ExternalLink, X, ChevronDown, Plus } from "lucide-react"
import { useCadastroModal } from "@/lib/cadastroModal/CadastroModalProvider"
import { TipoCadastroModal } from "@/lib/cadastroModal/types"

export interface LookupItem {
    id: number | string
    label: string
}

interface BaseLookupProps {
    items: LookupItem[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    placeholder?: string
    pesquisaPlaceholder?: string
    msgSemResultadoEncontrado?: string
    /** Usado apenas para o link de "editar" o item já selecionado (abre em nova guia). */
    pathCadastro: string
    pathLabel: string
    editTitle?: (label: string) => string
    /** Chave registrada em lib/cadastroModal/registry.tsx — controla qual Form abre no modal de "+". */
    tipoCadastro: TipoCadastroModal
    /** Chamado com o registro recém-criado (além da seleção automática, que já é feita aqui). */
    onCriado?: (novo: any) => void
    /** Trava o lookup: não deixa abrir o dropdown, criar novo item nem limpar a seleção atual. */
    disabled?: boolean
}

export function BaseLookup({
    items,
    value,
    onChange,
    error,
    placeholder = 'Selecionar...',
    pesquisaPlaceholder = 'Pesquisar...',
    msgSemResultadoEncontrado = 'Nenhum item encontrado.',
    pathCadastro,
    pathLabel,
    editTitle = label => `Editar ${label}`,
    tipoCadastro,
    onCriado,
    disabled = false,
}: BaseLookupProps) {
    const [aberto, setAberto] = useState(false)
    const [busca, setBusca] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const { abrirCadastro } = useCadastroModal()

    const itemAtual = items.find(i => String(i.id) === (value ?? ''))

    const filtrados = busca.trim()
        ? items.filter(i => i.label.toLowerCase().includes(busca.toLowerCase()))
        : items

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setAberto(false)
                setBusca('')
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    // Se o campo for travado enquanto o dropdown estiver aberto (ex.: usuário adicionou
    // um produto com o lookup ainda aberto), fecha na hora.
    useEffect(() => {
        if (disabled && aberto) {
            setAberto(false)
            setBusca('')
        }
    }, [disabled, aberto])

    const abrir = () => {
        if (disabled) return
        setAberto(true)
        setBusca('')
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const fechar = () => {
        setAberto(false)
        setBusca('')
    }

    const selecionar = (item: LookupItem) => {
        if (disabled) return
        onChange(String(item.id))
        fechar()
    }

    const limpar = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return
        onChange('')
        setBusca('')
        setAberto(false)
    }

    const abrirCadastroRapido = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return
        setAberto(false)
        abrirCadastro(tipoCadastro, (novo: any) => {
            onChange(String(novo.id))
            onCriado?.(novo)
        })
    }

    return (
        <div ref={containerRef} className="relative">
            <div
                className={`flex items-center gap-2 w-full px-2 py-2 border rounded transition-all
                    ${disabled
                        ? 'bg-slate-100 cursor-not-allowed'
                        : aberto
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                            : error
                                ? 'bg-white border-red-400'
                                : 'bg-white border-slate-300 hover:border-slate-400 cursor-pointer'
                    }`}
                onClick={!aberto && !disabled ? abrir : undefined}
                aria-disabled={disabled}
            >
                <Search size={15} className="text-slate-400 shrink-0" />

                {!aberto && (
                    itemAtual
                    ? <span className={`flex-1 text-sm truncate ${disabled ? 'text-slate-500' : 'text-slate-800'}`}>{itemAtual.label}</span>
                    : <span className="flex-1 text-sm text-slate-400">{placeholder}</span>
                )}

                {aberto && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        placeholder={pesquisaPlaceholder}
                        className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                )}

                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {!aberto && itemAtual && (
                        <a
                            href={`${pathCadastro}/${itemAtual.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={editTitle(itemAtual.label)}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                            <ExternalLink size={13} />
                        </a>
                    )}

                    {!disabled && (
                        <button
                            type="button"
                            onClick={abrirCadastroRapido}
                            title={pathLabel}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    )}

                    {!aberto && itemAtual && !disabled && (
                        <button type="button" onClick={limpar} className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={13} />
                        </button>
                    )}
                    {aberto && busca && (
                        <button type="button" onClick={() => setBusca('')} className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={13} />
                        </button>
                    )}

                    {!disabled && (
                        <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-150 ${aberto ? 'rotate-180' : ''} cursor-pointer`}
                            onClick={aberto ? fechar : abrir}
                        />
                    )}
                </div>
            </div>

            {aberto && !disabled && (
                <div className="absolute z-50 mt-1 w-full min-w-[260px] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <ul className="max-h-52 overflow-y-auto">
                        {filtrados.length === 0 ? (
                            <li className="px-3 py-5 text-center">
                                <p className="text-sm text-slate-400">{msgSemResultadoEncontrado}</p>
                            </li>
                        ) : (
                            filtrados.map(item => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => selecionar(item)}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between group transition-colors
                                            ${String(item.id) === value
                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>{item.label}</span>
                                        <a
                                            href={`${pathCadastro}/${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            title={editTitle(item.label)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-emerald-600 transition-all"
                                        >
                                            <ExternalLink size={12} />
                                        </a>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="px-2 py-1.5 border-t border-slate-100 bg-slate-50">
                        <button
                            type="button"
                            onClick={abrirCadastroRapido}
                            className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                            <Plus size={13} />
                            {pathLabel}
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}