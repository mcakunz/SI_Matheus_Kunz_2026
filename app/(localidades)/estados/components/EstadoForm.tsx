"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarEstado, salvarEstadoComRetorno } from "../actions"
import { emitirEstadoCadastrado } from "@/lib/hooks/useEstadoCadastrado"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { EstadoComPais, PaisSelect } from "@/lib/types"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { PaisLookup } from "@/components/ui/PaisLookup"

const schema = z.object({
    estado:  z.string().min(2, "O nome do estado deve ter no mínimo 2 caracteres.").max(100),
    uf:      z.string().length(2, "A UF deve ter exatamente 2 caracteres.").toUpperCase(),
    pais_id: z.string().min(1, "Selecione um país."),
    ativo:   z.boolean(),
})

type FormData = z.infer<typeof schema>

interface EstadoFormProps {
    estado?: EstadoComPais | null
    listaPaises: PaisSelect[]
}

export function EstadoForm({ estado, listaPaises: listaPaisesIniciais }: EstadoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const abertoPorLookup = window.location.search.includes('origem=lookup')

    
    const [listaPaises, setListaPaises] = useState<PaisSelect[]>(listaPaisesIniciais)

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            estado:  estado?.estado              ?? '',
            uf:      estado?.uf                  ?? '',
            pais_id: estado?.pais_id?.toString() ?? '',
            ativo:   estado ? estado.ativo       : true,
        }
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (estado?.id) formData.append('id', String(estado.id))

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        try {
            if (abertoPorLookup && !estado?.id) {
                const resultado = await salvarEstadoComRetorno(formData)
                toast.success("Estado cadastrado com sucesso!")
                emitirEstadoCadastrado({ id: resultado.id, estado: resultado.estado })
            } else {
            await salvarEstado(formData)
            toast.success(estado ? "Estado atualizado com sucesso!" : "Estado cadastrado com sucesso!")
            router.push("/estados")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePaisCriado = (novoPais: PaisSelect) => {
        setListaPaises(prev =>
            [...prev, novoPais].sort((a, b) => a.pais.localeCompare(b.pais, 'pt-BR'))
        )
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{errors[campo]?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_150px] gap-4 md:gap-6">
                <div>
                    <FormLabel>ID</FormLabel>
                    <FormInput
                        value={estado?.id ?? 'Novo'}
                        disabled
                        className="bg-slate-50 cursor-not-allowed font-mono text-slate-500"
                    />
                </div>
                <div>
                    <FormLabel required>Estado</FormLabel>
                    <FormInput
                        {...register('estado')}
                        placeholder="Digite o nome do estado"
                    />
                    <Erro campo="estado" />
                </div>
                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_150px] gap-4 md:gap-6">
                <div>
                    <FormLabel required>UF</FormLabel>
                    <FormInput
                        {...register('uf')}
                        maxLength={2}
                        placeholder="Ex: PR"
                        className="uppercase"
                    />
                    <Erro campo="uf" />
                </div>
                <div className="md:col-span-2">
                    <FormLabel required>País</FormLabel>
                    <Controller
                        name="pais_id"
                        control={control}
                        render={({ field }) => (
                            <PaisLookup
                                paises={listaPaises}
                                value={field.value}
                                onChange={field.onChange}
                                onPaisCreated={handlePaisCriado}
                                required
                                error={errors.pais_id?.message}
                            />
                        )}
                    />
                </div>
            </div>

            {estado && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(estado.data_cadastro).toLocaleDateString('pt-BR')}</span>
                    {estado.data_alteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(estado.data_alteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <button
                    type="button"
                    onClick={() => router.push("/estados")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : estado ? "Salvar Alterações" : "Cadastrar Estado"}
                </Button>
            </div>
        </form>
    )
}
