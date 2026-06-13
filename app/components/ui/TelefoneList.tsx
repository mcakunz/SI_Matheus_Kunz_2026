"use client"

import { UseFormRegister, UseFieldArrayReturn, UseFormWatch } from "react-hook-form"
import { HiPlus, HiTrash, HiStar } from "react-icons/hi"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { mascaraTelefone } from "@/lib/utils/mascaras"

interface TelefoneListProps {
    fields:          any[]
    append:          (value: any) => void
    remove:          (index: number) => void
    register:        UseFormRegister<any>
    watch:           UseFormWatch<any>
    errors?:         any
    marcarPrincipal: (index: number) => void
    mostrarTipo?:    boolean
}

export function TelefoneList({
    fields,
    append,
    remove,
    register,
    watch,
    errors,
    marcarPrincipal,
    mostrarTipo = true,
}: TelefoneListProps) {
    return (
        <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Telefones</p>
                <button
                    type="button"
                    onClick={() => append({ telefone: '', tipo: 'COMERCIAL', principal: fields.length === 0, ativo: true })}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <HiPlus size={14} /> Adicionar telefone
                </button>
            </div>

            {errors?.message && (
                <p className="text-xs text-red-500 mb-2">{errors.message}</p>
            )}

            {fields.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhum telefone cadastrado.</p>
            )}

            <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                    const isPrincipal = watch(`telefones.${index}.principal`)
                    const isAtivo     = watch(`telefones.${index}.ativo`)

                    return (
                        <div
                            key={field.id}
                            className={`grid gap-2 items-end p-3 rounded-lg border ${
                                mostrarTipo
                                    ? 'grid-cols-1 md:grid-cols-[1fr_160px_auto_auto_auto]'
                                    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_auto]'
                            } ${isAtivo ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}
                        >
                            <div>
                                {index === 0 && <FormLabel>Telefone</FormLabel>}
                                <FormInput
                                    {...register(`telefones.${index}.telefone`, {
                                        onChange: (e) => { e.target.value = mascaraTelefone(e.target.value) }
                                    })}
                                    placeholder="(00) 00000-0000"
                                    maxLength={16}
                                    inputMode="numeric"
                                />
                                {errors?.[index]?.telefone && (
                                    <p className="text-xs text-red-500 mt-1">{errors[index].telefone.message}</p>
                                )}
                            </div>

                            {mostrarTipo && (
                                <div>
                                    {index === 0 && <FormLabel>Tipo</FormLabel>}
                                    <FormSelect {...register(`telefones.${index}.tipo`)}>
                                        <option value="COMERCIAL">Comercial</option>
                                        <option value="FINANCEIRO">Financeiro</option>
                                        <option value="CELULAR">Celular</option>
                                        <option value="OUTRO">Outro</option>
                                    </FormSelect>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500">Principal</span>}
                                <button type="button" onClick={() => marcarPrincipal(index)} title="Marcar como principal"
                                    className={`p-1.5 rounded-md transition-colors ${isPrincipal ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'}`}>
                                    <HiStar size={18} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500">Ativo</span>}
                                <div className="h-8 flex items-center">
                                    <FormSwitch {...register(`telefones.${index}.ativo`)} />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500 invisible">X</span>}
                                <button type="button" onClick={() => remove(index)} title="Remover telefone"
                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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