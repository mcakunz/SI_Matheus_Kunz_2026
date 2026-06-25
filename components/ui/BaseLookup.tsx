"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ExternalLink, X, ChevronDown, Plus } from "lucide-react"

export interface LookupItem {
    id: number | string
    label: string
}

interface BaseLookupProps {
    items: LookupItem[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
    placeholder?: string
    pesquisaPlaceholder?: string
    mensagemVazia?: string
    msgSemResultadoEncontrado?: string
    pathCadastro: string        
    pathLabel: string       
    editTitle?: (label: string) => string
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
}: BaseLookupProps) {
    const [aberto, setAberto] = useState(false)
    const [busca, setBusca] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const itemAtual = items.find(i => String(i.id) === value)

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

    const abrir = () => {
        setAberto(true)
        setBusca('')
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const fechar = () => {
        setAberto(false)
        setBusca('')
    }

    const selecionar = (item: LookupItem) => {
        onChange(String(item.id))
        fechar()
    }

    const limpar = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        setBusca('')
        setAberto(false)
    }

    const abrirCadastro = (e: React.MouseEvent) => {
        e.stopPropagation()
        setAberto(false)
        window.open(`${pathCadastro}/novo?origem=lookup`, '_blank')
    }

    return (
        <div ref={containerRef} className="relative">
            <div
                className={`flex items-center gap-2 w-full px-2 py-2 border rounded bg-white transition-all
                    ${aberto
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : error
                            ? 'border-red-400'
                            : 'border-slate-300 hover:border-slate-400'
                    } ${!aberto ? 'cursor-pointer' : ''}`}
                onClick={!aberto ? abrir : undefined}
            >
                <Search size={15} className="text-slate-400 shrink-0" />

                {!aberto && (
                    itemAtual
                    ? <span className="flex-1 text-sm text-slate-800 truncate">{itemAtual.label}</span>
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

                    <button
                        type="button"
                        onClick={abrirCadastro}
                        title={pathLabel}
                        className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <Plus size={14} />
                    </button>

                    {!aberto && itemAtual && (
                        <button type="button" onClick={limpar} className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={13} />
                        </button>
                    )}
                    {aberto && busca && (
                        <button type="button" onClick={() => setBusca('')} className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={13} />
                        </button>
                    )}

                    <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-150 ${aberto ? 'rotate-180' : ''} cursor-pointer`}
                        onClick={aberto ? fechar : abrir}
                    />
                </div>
            </div>

            {aberto && (
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
                            onClick={abrirCadastro}
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