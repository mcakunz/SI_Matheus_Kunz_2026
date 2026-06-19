"use client"

import { UseFormRegister, UseFormWatch } from "react-hook-form"
import { HiPlus, HiTrash, HiStar } from "react-icons/hi"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"

export interface TipoOpcao {
    value: string
    label: string
}

interface EmailListProps {
    fields:          any[]
    append:          (value: any) => void   
    remove:          (index: number) => void 
    register:        UseFormRegister<any>
    watch:           UseFormWatch<any>
    errors?:         any
    marcarPrincipal: (index: number) => void
    tiposEmail:      TipoOpcao[]
}

export function EmailList({
    fields,
    append,
    remove,
    register,
    watch,
    errors,
    marcarPrincipal,
    tiposEmail,
}: EmailListProps) {
    const tipoDefault = tiposEmail[0]?.value ?? ''

    return (
        <div className="pt-1">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">E-mails</p>
                <button
                    type="button"
                    onClick={() => append({ email: '', tipo: tipoDefault, principal: fields.length === 0, ativo: true })}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    <HiPlus size={14} /> Adicionar e-mail
                </button>
            </div>

            {errors?.message && (
                <p className="text-xs text-red-500 mb-2">{errors.message}</p>
            )}

            {fields.length === 0 && (
                <p className="text-sm text-slate-400 italic">Nenhum e-mail cadastrado.</p>
            )}

            <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                    const isPrincipal = watch(`emails.${index}.principal`)
                    const isAtivo     = watch(`emails.${index}.ativo`)

                    return (
                        <div
                            key={field.id}
                            className={`grid grid-cols-1 md:grid-cols-[1fr_160px_auto_auto_auto] gap-2 items-end p-3 rounded-lg border ${
                                isAtivo ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'
                            }`}
                        >
                            <div>
                                {index === 0 && <FormLabel>E-mail</FormLabel>}
                                <FormInput
                                    {...register(`emails.${index}.email`)}
                                    type="email"
                                    placeholder="email@exemplo.com"
                                />
                                {errors?.[index]?.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors[index].email.message}</p>
                                )}
                            </div>

                                <div>
                                    {index === 0 && <FormLabel>Tipo</FormLabel>}
                                    <FormSelect {...register(`emails.${index}.tipo`)}>
                                        {tiposEmail.map(op => (
                                            <option key={op.value} value={op.value}>{op.label}</option>
                                        ))}
                                    </FormSelect>
                                </div>

                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500">Principal</span>}
                                <button
                                    type="button"
                                    onClick={() => marcarPrincipal(index)}
                                    title="Marcar como principal"
                                    className={`p-1.5 rounded-md transition-colors ${
                                        isPrincipal
                                            ? 'text-amber-500 bg-amber-50'
                                            : 'text-slate-300 hover:text-amber-400'
                                    }`}
                                >
                                    <HiStar size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500">Ativo</span>}
                                <div className="h-8 flex items-center">
                                    <FormSwitch {...register(`emails.${index}.ativo`)} />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                {index === 0 && <span className="text-xs text-slate-500 invisible">X</span>}
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    title="Remover e-mail"
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