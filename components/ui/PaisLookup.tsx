"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, ExternalLink, X, ChevronDown, Plus } from "lucide-react"
import { PaisSelect } from "@/lib/types"
import { usePaisCadastrado } from "@/lib/hooks/usePaisCadastrado"

interface PaisLookupProps {
    paises: PaisSelect[]
    value: string
    onChange: (id: string) => void
    onPaisCreated?: (pais: PaisSelect) => void
    required?: boolean
    error?: string
}

export function PaisLookup({ paises, value, onChange, onPaisCreated, required, error }: PaisLookupProps) {
    const [aberto, setAberto] = useState(false)
    const [busca, setBusca] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const paisAtual = paises.find(p => String(p.id) === value)

    const filtrados = busca.trim()
        ? paises.filter(p => p.pais.toLowerCase().includes(busca.toLowerCase()))
        : paises

    const handlePaisCadastrado = useCallback((novoPais: PaisSelect) => {
        onPaisCreated?.(novoPais)
        onChange(String(novoPais.id))
    }, [onPaisCreated, onChange])

    usePaisCadastrado(handlePaisCadastrado)

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

    const selecionar = (pais: PaisSelect) => {
        onChange(String(pais.id))
        setAberto(false)
        setBusca('')
    }

    const limpar = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        setBusca('')
        setAberto(false)
    }

    const abrirCadastroPais = (e: React.MouseEvent) => {
        e.stopPropagation()
        setAberto(false)
        window.open('/paises/novo?origem=lookup', '_blank')
    }

    return (
        <div ref={containerRef} className="relative">
            <div
                onClick={abrir}
                className={`flex items-center gap-2 w-full px-2 py-2 border rounded bg-white cursor-pointer transition-all
                    ${aberto
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : error
                            ? 'border-red-400'
                            : 'border-slate-300 hover:border-slate-400'
                    }`}
            >
                <Search size={15} className="text-slate-400 shrink-0" />

                {paisAtual
                    ? <span className="flex-1 text-sm text-slate-800 truncate">{paisAtual.pais}</span>
                    : <span className="flex-1 text-sm text-slate-400">Selecionar país...</span>
                }

                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {paisAtual && (
                        <a
                            href={`/paises/${paisAtual.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Editar ${paisAtual.pais}`}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                            <ExternalLink size={13} />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={abrirCadastroPais}
                        title="Cadastrar novo país"
                        className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                    {paisAtual && (
                        <button type="button" onClick={limpar} className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={13} />
                        </button>
                    )}
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {aberto && (
                <div className="absolute z-50 mt-1 w-full min-w-[260px] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded border border-slate-200 focus-within:border-emerald-400 transition-colors">
                            <Search size={13} className="text-slate-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                placeholder="Pesquisar país..."
                                className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                            />
                            {busca && (
                                <button type="button" onClick={() => setBusca('')}>
                                    <X size={12} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    <ul className="max-h-52 overflow-y-auto">
                        {filtrados.length === 0 ? (
                            <li className="px-3 py-5 text-center">
                                <p className="text-sm text-slate-400">Nenhum país encontrado.</p>
                                <button
                                    type="button"
                                    onClick={abrirCadastroPais}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
                                >
                                    <Plus size={12} />
                                    Cadastrar novo país
                                </button>
                            </li>
                        ) : (
                            filtrados.map(pais => (
                                <li key={pais.id}>
                                    <button
                                        type="button"
                                        onClick={() => selecionar(pais)}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between group transition-colors
                                            ${String(pais.id) === value
                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>{pais.pais}</span>
                                        <a
                                            href={`/paises/${pais.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            title="Editar este país"
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
                            onClick={abrirCadastroPais}
                            className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                            <Plus size={13} />
                            Cadastrar novo país
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
