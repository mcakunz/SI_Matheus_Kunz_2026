"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarMarca } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { Marca } from "@/lib/types"

const schema = z.object({
    marca: z.string().min(1, "Marca é obrigatória").max(50, "Máximo de 50 caracteres"),
    ativo: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface MarcaFormProps {
    marca?: Marca | null
}

export function MarcaForm({ marca }: MarcaFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            marca: marca?.marca ?? '',
            ativo: marca ? marca.ativo : true,
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (marca?.id) formData.append('id', String(marca.id))

        formData.append('marca', data.marca)
        formData.append('ativo', String(data.ativo))

        try {
            await salvarMarca(formData)
            toast.success(marca ? "Marca atualizada com sucesso!" : "Marca cadastrada com sucesso!")
            router.push("/marcas")
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
                    <FormLabel required>Marca</FormLabel>
                    <FormInput
                        {...register('marca')}
                        placeholder="Ex: Samsung"
                        maxLength={50}
                    />
                    <Erro campo="marca" />
                </div>
                <div className="pt-7">
                    <FormSwitch {...register('ativo')} />
                </div>
            </div>

            {marca && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(marca.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {marca.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(marca.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : marca ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/marcas")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}