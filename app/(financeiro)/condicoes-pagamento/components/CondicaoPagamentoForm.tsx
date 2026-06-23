"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarCondicaoPagamento, salvarCondicaoPagamentoComRetorno } from "../actions"
import toast from "react-hot-toast"
import { HiPlus, HiTrash } from "react-icons/hi"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSelect } from "@/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { CondicaoPagamentoCompleto, ParcelaCondicao, FormaPagamentoSelect } from "@/lib/types"
import { emitirCondicaoPagamentoCadastrada } from "@/lib/hooks/useCondicaoPagamentoCadastrado"

const parcelaSchema = z.object({
    numero:           z.number().int().positive(),
    dias:             z.number().int().min(0, "Dias inválido."),
    percentual:       z.number().min(0.01, "Percentual inválido."),
    formaPagamentoId: z.string().min(1, "Selecione uma forma de pagamento."),
})

const schema = z.object({
    condicaoPagamento:   z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    numeroParcelas:      z.number().int().min(1, "Mínimo 1 parcela."),
    diasPrimeiraParcela: z.number().int().min(0, "Dias não pode ser negativo."),
    diasEntreParcelas:   z.number().int().min(0, "Dias não pode ser negativo."),
    percentualJuros:     z.number().min(0).max(100, "Máximo 100%."),
    percentualMulta:     z.number().min(0).max(100, "Máximo 100%."),
    percentualDesconto:  z.number().min(0).max(100, "Máximo 100%."),
    ativo:               z.boolean(),
    parcelas:            z.array(parcelaSchema).min(1, "Adicione ao menos uma parcela."),
}).superRefine((data, ctx) => {
    const total = data.parcelas.reduce((acc, p) => acc + Number(p.percentual), 0)
    if (Math.abs(total - 100) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parcelas'],
            message: `A soma dos percentuais deve ser 100%. Atual: ${total.toFixed(2)}%.`,
        })
    }
    if (data.parcelas.length !== data.numeroParcelas) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parcelas'],
            message: `O número de parcelas cadastradas (${data.parcelas.length}) não corresponde ao campo "Número de Parcelas" (${data.numeroParcelas}).`,
        })
    }
})

type FormData = z.infer<typeof schema>

interface CondicaoPagamentoFormProps {
    condicao?:           CondicaoPagamentoCompleto | null
    parcelas?:           ParcelaCondicao[]
    listaFormasPagamento: FormaPagamentoSelect[]
}

export function CondicaoPagamentoForm({
    condicao,
    parcelas = [],
    listaFormasPagamento,
}: CondicaoPagamentoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const searchParams = useSearchParams()
    const abertoPorLookup = searchParams.get('origem') === 'lookup'

    const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            condicaoPagamento:   condicao?.condicaoPagamento ?? '',
            numeroParcelas:      condicao?.numeroParcelas    ?? 1,
            diasPrimeiraParcela: condicao?.diasPrimeiraParcela ?? 0,
            diasEntreParcelas:   condicao?.diasEntreParcelas   ?? 0,
            percentualJuros:     Number(condicao?.percentualJuros    ?? 0),
            percentualMulta:     Number(condicao?.percentualMulta    ?? 0),
            percentualDesconto:  Number(condicao?.percentualDesconto ?? 0),
            ativo:               condicao ? condicao.ativo : true,
            parcelas: parcelas.length > 0
                ? parcelas.map((p) => ({
                    numero:           p.numero,
                    dias:             p.dias,
                    percentual:       Number(p.percentual),
                    formaPagamentoId: String(p.formaPagamentoId),
                }))
                : [{ numero: 1, dias: 0, percentual: 100, formaPagamentoId: '' }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'parcelas' })

    const parcelasWatch = watch('parcelas')
    const totalPercentual = parcelasWatch?.reduce((acc, p) => acc + Number(p.percentual || 0), 0) ?? 0
    const totalOk = Math.abs(totalPercentual - 100) <= 0.01

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (condicao?.id) formData.append('id', String(condicao.id))

        formData.append('condicaoPagamento',   data.condicaoPagamento)
        formData.append('numeroParcelas',      String(data.numeroParcelas))
        formData.append('diasPrimeiraParcela', String(data.diasPrimeiraParcela))
        formData.append('diasEntreParcelas',   String(data.diasEntreParcelas))
        formData.append('percentualJuros',     String(data.percentualJuros))
        formData.append('percentualMulta',     String(data.percentualMulta))
        formData.append('percentualDesconto',  String(data.percentualDesconto))
        formData.append('ativo',               String(data.ativo))

        data.parcelas.forEach((p, i) => {
            formData.append(`parcelas[${i}].numero`,           String(p.numero))
            formData.append(`parcelas[${i}].dias`,             String(p.dias))
            formData.append(`parcelas[${i}].percentual`,       String(p.percentual))
            formData.append(`parcelas[${i}].formaPagamentoId`, String(p.formaPagamentoId))
        })
        
        try {
            if (abertoPorLookup && !condicao?.id) {
                const resultado = await salvarCondicaoPagamentoComRetorno(formData)
                toast.success("Condição de pagamento cadastrada com sucesso!")
                emitirCondicaoPagamentoCadastrada({
                    id: resultado.id,
                    condicaoPagamento: resultado.condicaoPagamento,
                })
            } else {
                await salvarCondicaoPagamento(formData)
                toast.success(condicao ? "Condição atualizada com sucesso!" : "Condição cadastrada com sucesso!")
                router.push("/condicoes-pagamento")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }

    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{(errors[campo] as any)?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
                <div>
                    <FormLabel required>Descrição</FormLabel>
                    <FormInput
                        {...register('condicaoPagamento')}
                        placeholder="Ex: 30/60/90 dias"
                        maxLength={100}
                    />
                    <Erro campo="condicaoPagamento" />
                </div>
                <div className="pt-7">
                    <FormSwitch {...register('ativo')} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Nº de Parcelas</FormLabel>
                    <FormInput
                        type="number"
                        {...register('numeroParcelas', { valueAsNumber: true })}
                        min={1}
                        max={999}
                        inputMode="numeric"
                    />
                    <Erro campo="numeroParcelas" />
                </div>
                <div>
                    <FormLabel required>1ª Parcela (dias)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('diasPrimeiraParcela', { valueAsNumber: true })}
                        min={0}
                        inputMode="numeric"
                    />
                    <Erro campo="diasPrimeiraParcela" />
                </div>
                <div>
                    <FormLabel required>Entre Parcelas (dias)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('diasEntreParcelas', { valueAsNumber: true })}
                        min={0}
                        inputMode="numeric"
                    />
                    <Erro campo="diasEntreParcelas" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel>Juros (%)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('percentualJuros', { valueAsNumber: true })}
                        min={0} max={100} step="0.01"
                    />
                    <Erro campo="percentualJuros" />
                </div>
                <div>
                    <FormLabel>Multa (%)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('percentualMulta', { valueAsNumber: true })}
                        min={0} 
                        max={100} 
                        step="0.01"
                    />
                    <Erro campo="percentualMulta" />
                </div>
                <div>
                    <FormLabel>Desconto (%)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('percentualDesconto', { valueAsNumber: true })}
                        min={0} 
                        max={100} 
                        step="0.01"
                    />
                    <Erro campo="percentualDesconto" />
                </div>
            </div>

            <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700">Parcelas</h2>
                        <p className="text-xs text-slate-400 mt-0.5">A soma dos percentuais deve ser exatamente 100%.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => append({
                            numero: fields.length + 1,
                            dias: 0,
                            percentual: 0,
                            formaPagamentoId: '',
                        })}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <HiPlus size={14} />
                        Adicionar parcela
                    </button>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-[50px_80px_1fr_120px_40px] gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        <span>Nº</span>
                        <span>Dias</span>
                        <span>Forma de Pagamento</span>
                        <span>% Parcela</span>
                        <span />
                    </div>

                    {fields.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                            Nenhuma parcela adicionada. Clique em "Adicionar parcela".
                        </div>
                    ) : (
                        fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid grid-cols-[50px_80px_1fr_120px_40px] gap-3 px-4 py-2.5 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                            >
                                <input
                                    type="hidden"
                                    {...register(`parcelas.${index}.numero`)}
                                    value={index + 1}
                                />
                                <span className="text-sm font-medium text-slate-500">{index + 1}</span>

                                <FormInput
                                    type="number"
                                    {...register(`parcelas.${index}.dias`, { valueAsNumber: true })}
                                    min={0}
                                    inputMode="numeric"
                                />

                                <div>
                                    <FormSelect {...register(`parcelas.${index}.formaPagamentoId`)}>
                                        <option value="">Selecione...</option>
                                        {listaFormasPagamento.map((f) => (
                                            <option key={f.id} value={f.id}>{f.formaPagamento}</option>
                                        ))}
                                    </FormSelect>
                                    {errors.parcelas?.[index]?.formaPagamentoId && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.parcelas[index]?.formaPagamentoId?.message}
                                        </p>
                                    )}
                                </div>

                                <FormInput
                                    type="number"
                                    {...register(`parcelas.${index}.percentual`, { valueAsNumber: true })}
                                    min={0.01} 
                                    max={100} 
                                    step="0.01"
                                />

                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remover parcela"
                                >
                                    <HiTrash size={16} />
                                </button>
                            </div>
                        ))
                    )}

                    {fields.length > 0 && (
                        <div className="grid grid-cols-[50px_80px_1fr_120px_40px] gap-3 px-4 py-2 bg-slate-50 border-t border-slate-200">
                            <span />
                            <span />
                            <span className="text-xs font-semibold text-slate-500 text-right pr-3">Total:</span>
                            <span className={`text-sm font-bold ${totalOk ? 'text-emerald-600' : 'text-red-500'}`}>
                                {totalPercentual.toFixed(2)}%
                            </span>
                            <span />
                        </div>
                    )}
                </div>

                {errors.parcelas && !Array.isArray(errors.parcelas) && (
                    <p className="text-xs text-red-500 mt-2">{(errors.parcelas as any)?.message}</p>
                )}
                {errors.parcelas?.root && (
                    <p className="text-xs text-red-500 mt-2">{errors.parcelas.root.message}</p>
                )}
            </div>

            {condicao && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(condicao.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {condicao.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(condicao.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : condicao ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/condicoes-pagamento")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
  