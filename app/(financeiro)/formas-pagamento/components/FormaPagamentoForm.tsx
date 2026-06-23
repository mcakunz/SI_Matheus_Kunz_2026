"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarFormaPagamento } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { FormaPagamento } from "@/lib/types"

const schema = z.object({
    formaPagamento: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(50),
    descricao:      z.string().max(100, "A descrição deve ter no máximo 100 caracteres."),
    ativo:          z.boolean(),
})

type FormData = z.infer<typeof schema>

interface FormaPagamentoFormProps {
    forma?: FormaPagamento | null
}

export function FormaPagamentoForm({ forma }: FormaPagamentoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            formaPagamento: forma?.formaPagamento ?? '',
            descricao:      forma?.descricao      ?? '',
            ativo:          forma ? forma.ativo : true,
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (forma?.id) formData.append('id', String(forma.id))

        formData.append('formaPagamento', data.formaPagamento)
        formData.append('descricao',      data.descricao)
        formData.append('ativo',          String(data.ativo))

        try {
            await salvarFormaPagamento(formData)
            toast.success(forma ? "Forma de pagamento atualizada com sucesso!" : "Forma de pagamento cadastrada com sucesso!")
            router.push("/formas-pagamento")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{errors[campo]?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
                <div>
                    <FormLabel required>Nome</FormLabel>
                    <FormInput
                        {...register('formaPagamento')}
                        placeholder="Ex: Boleto Bancário"
                        maxLength={50}
                    />
                    <Erro campo="formaPagamento" />
                </div>
                <div className="pt-7">
                    <FormSwitch {...register('ativo')} />
                </div>
            </div>

            <div>
                <FormLabel>Descrição</FormLabel>
                <FormInput
                    {...register('descricao')}
                    placeholder="Ex: Pagamento via boleto com vencimento em 30 dias"
                    maxLength={100}
                />
                <Erro campo="descricao" />
            </div>

            {forma && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(forma.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {forma.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(forma.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : forma ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/formas-pagamento")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
