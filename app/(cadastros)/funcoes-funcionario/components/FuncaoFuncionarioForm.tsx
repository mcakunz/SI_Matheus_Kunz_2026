"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarFuncaoFuncionario } from "../actions"
import toast from "react-hot-toast"

import { Button }     from "@/components/ui/Button"
import { FormInput }  from "@/components/ui/FormInput"
import { FormLabel }  from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { FuncaoFuncionario } from "@/lib/types"

const schema = z.object({
    funcaoFuncionario: z.string().min(2, "A função deve ter no mínimo 2 caracteres.").max(100),
    descricao:         z.string().max(255).optional(),
    salarioBase:       z.string().min(1, "Informe o salário base."),
    cargaHoraria:      z.string().min(1, "Informe a carga horária."),
    requerCnh:         z.boolean(),
    observacao:        z.string().max(150).optional(),
    ativo:             z.boolean(),
})

type FormData = z.infer<typeof schema>

interface FuncaoFuncionarioFormProps {
    funcao?: FuncaoFuncionario | null
}

export function FuncaoFuncionarioForm({ funcao }: FuncaoFuncionarioFormProps) {
    const router  = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            funcaoFuncionario: funcao?.funcaoFuncionario ?? '',
            descricao:         funcao?.descricao         ?? '',
            salarioBase:       funcao?.salarioBase?.toString() ?? '0',
            cargaHoraria:      funcao?.cargaHoraria?.toString() ?? '40',
            requerCnh:         funcao?.requerCnh ?? false,
            observacao:        funcao?.observacao ?? '',
            ativo:             funcao ? funcao.ativo : true,
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (funcao?.id) formData.append('id', String(funcao.id))

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        try {
            await salvarFuncaoFuncionario(formData)
            toast.success(funcao ? "Função atualizada com sucesso!" : "Função cadastrada com sucesso!")
            router.push("/funcoes-funcionario")
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
                <div>
                    <div>
                        <FormLabel>Requer CNH</FormLabel>
                        <div className="mt-1 h-10 flex items-center">
                            <FormSwitch {...register('requerCnh')} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Nome da Função</FormLabel>
                    <FormInput {...register('funcaoFuncionario')} placeholder="Ex: Motorista, Técnico, Supervisor..." />
                    <Erro campo="funcaoFuncionario" />
                </div>
                <div>
                    <FormLabel>Descrição</FormLabel>
                    <FormInput {...register('descricao')} placeholder="Breve descrição das responsabilidades" maxLength={255} />
                    <Erro campo="descricao" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Salário Base (R$)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('salarioBase')}
                        min={0}
                        step="0.01"
                        placeholder="0,00"
                    />
                    <Erro campo="salarioBase" />
                </div>
                <div>
                    <FormLabel required>Carga Horária (h/mês)</FormLabel>
                    <FormInput
                        type="number"
                        {...register('cargaHoraria')}
                        min={1}
                        max={744}
                        step={1}
                        placeholder="Ex: 220"
                        inputMode="numeric"
                    />
                    <Erro campo="cargaHoraria" />
                </div>
            </div>

            <div>
                <FormLabel>Observações</FormLabel>
                <FormInput {...register('observacao')} placeholder="Observações adicionais" maxLength={150} />
            </div>

            {funcao && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(funcao.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {funcao.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(funcao.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : funcao ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/funcoes-funcionario")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}