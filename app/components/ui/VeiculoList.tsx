"use client"

import { UseFormRegister, UseFormWatch } from "react-hook-form"
import { HiPlus, HiTrash }  from "react-icons/hi"
import { FormLabel }         from "@/components/ui/FormLabel"
import { VeiculoSelect }     from "@/lib/types"
import { isMercosul }        from "@/lib/utils/helpers"

function formatarPlaca(placa: string): string {
    const limpo = placa.toUpperCase()
    if (isMercosul(limpo)) return limpo
    if (/^[A-Z]{3}[0-9]{4}$/.test(limpo)) return `${limpo.slice(0, 3)}-${limpo.slice(3)}`
    return limpo
}

interface VeiculoListProps {
    fields:        any[]
    append:        (value: { veiculoId: string }) => void
    remove:        (index: number) => void
    register:      UseFormRegister<any>
    watch:         UseFormWatch<any>
    errors?:       any
    listaVeiculos: VeiculoSelect[]
}

export function VeiculoList({
    fields,
    append,
    remove,
    register,
    watch,
    errors,
    listaVeiculos,
}: VeiculoListProps) {

    const veiculosWatched      = watch('veiculos') ?? []
    const veiculosSelecionados = veiculosWatched.map((v: any) => v?.veiculoId ?? '')

    const veiculosDisponiveis = listaVeiculos.filter(
        v => !veiculosSelecionados.includes(String(v.id))
    )

    return (
        <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Veículos</p>
                <button
                    type="button"
                    onClick={() => append({ veiculoId: '' })}
                    disabled={veiculosDisponiveis.length === 0}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <HiPlus size={14} /> Adicionar veículo
                </button>
            </div>

            {errors?.message && (
                <p className="text-xs text-red-500 mb-2">{errors.message}</p>
            )}

            {fields.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhum veículo vinculado.</p>
            )}

            <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                    const veiculoIdAtual = veiculosWatched[index]?.veiculoId ?? ''

                    const opcoes = listaVeiculos.filter(
                        v =>
                            String(v.id) === veiculoIdAtual ||
                            !veiculosSelecionados.includes(String(v.id)) ||
                            veiculosSelecionados.indexOf(String(v.id)) === index
                    )

                    return (
                        <div
                            key={field.id}
                            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end p-3 rounded-lg border bg-slate-50 border-slate-200"
                        >
                            <div>
                                {index === 0 && <FormLabel>Veículo</FormLabel>}
                                        <select
                                            {...register(`veiculos.${index}.veiculoId`)}
                                            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        >
                                            <option value="">Selecione um veículo...</option>
                                            {opcoes.map(v => (
                                                <option key={v.id} value={String(v.id)}>
                                                    {formatarPlaca(v.placa)} — {v.marca} {v.modelo}
                                                </option>
                                            ))}
                                        </select>
                                {errors?.[index]?.veiculoId && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors[index].veiculoId.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && (
                                    <span className="text-xs text-slate-500 invisible">X</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    title="Remover veículo"
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <HiTrash size={16} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}