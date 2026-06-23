"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarCategoria } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { Categoria } from "@/lib/types"

const schema = z.object({
    categoria:      z.string().max(50),
    ativo:          z.boolean(),
})

type FormData = z.infer<typeof schema>

interface CategoriaFormProps {
    categoria?: Categoria | null
}

export function CategoriaForm({ categoria }: CategoriaFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            categoria: categoria?.categoria ?? '',
            ativo:          categoria ? categoria.ativo : true,
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (categoria?.id) formData.append('id', String(categoria.id))

        formData.append('categoria', data.categoria)
        formData.append('ativo',          String(data.ativo))

        try {
            await salvarCategoria(formData)
            toast.success(categoria ? "Categoria atualizada com sucesso!" : "Categoria cadastrada com sucesso!")
            router.push("/categorias")
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
                    <FormLabel required>Categoria</FormLabel>
                    <FormInput
                        {...register('categoria')}
                        placeholder="Ex: Eletrônicos"
                        maxLength={50}
                    />
                    <Erro campo="categoria" />
                </div>
                <div className="pt-7">
                    <FormSwitch {...register('ativo')} />
                </div>
            </div>

            {categoria && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(categoria.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {categoria.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(categoria.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : categoria ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/categorias")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
