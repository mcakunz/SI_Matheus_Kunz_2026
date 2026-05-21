"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarCidade } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { CidadeComEstado, EstadoSelect } from "@/lib/types"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { EstadoLookup } from "@/components/ui/EstadoLookup"

const schema = z.object({
    cidade:      z.string().min(2, "O nome da cidade deve ter no mínimo 2 caracteres.").max(100),
    codigo_ibge: z.string().length(7, "O código IBGE deve ter exatos 7 dígitos."),
    estado_id:   z.string().min(1, "Selecione um estado."),
    ativo:       z.boolean(),
})

type FormData = z.infer<typeof schema>

interface CidadeFormProps {
    cidade?: CidadeComEstado | null
    listaEstados: EstadoSelect[]
}

export function CidadeForm({ cidade, listaEstados: listaEstadosIniciais }: CidadeFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [listaEstados, setListaEstados] = useState<EstadoSelect[]>(listaEstadosIniciais)

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            cidade:      cidade?.cidade                ?? '',
            codigo_ibge: cidade?.codigoIbge            ?? '',
            estado_id:   cidade?.estadoId?.toString()  ?? '',
            ativo:       cidade ? cidade.ativo          : true,
        }
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (cidade?.id) formData.append('id', String(cidade.id))

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        try {
            await salvarCidade(formData)
            toast.success(cidade ? "Cidade atualizada com sucesso!" : "Cidade cadastrada com sucesso!")
            router.push("/cidades")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEstadoCriado = (novoEstado: EstadoSelect) => {
        setListaEstados(prev =>
            [...prev, novoEstado].sort((a, b) => a.estado.localeCompare(b.estado, 'pt-BR'))
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
                        value={cidade?.id ?? 'Novo'}
                        disabled
                        className="bg-slate-50 cursor-not-allowed font-mono text-slate-500"
                    />
                </div>

                <div>
                    <FormLabel required>Cidade</FormLabel>
                    <FormInput
                        {...register('cidade')}
                        placeholder="Digite o nome da cidade"
                    />
                    <Erro campo="cidade" />
                </div>

                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_150px] gap-4 md:gap-6">
                <div>
                    <FormLabel required>Código IBGE</FormLabel>
                    <FormInput
                        {...register('codigo_ibge')}
                        maxLength={7}
                        placeholder="Ex: 4108304"
                        inputMode="numeric"
                    />
                    <Erro campo="codigo_ibge" />
                </div>

                <div className="md:col-span-2">
                    <FormLabel required>Estado</FormLabel>
                    <Controller
                        name="estado_id"
                        control={control}
                        render={({ field }) => (
                            <EstadoLookup
                                estados={listaEstados}
                                value={field.value}
                                onChange={field.onChange}
                                onEstadoCreated={handleEstadoCriado}
                                required
                                error={errors.estado_id?.message}
                            />
                        )}
                    />
                </div>
            </div>

            {cidade && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(cidade.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {cidade.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(cidade.dataAlteracao).toLocaleDateString('pt-BR', {
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
                    onClick={() => router.push("/cidades")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : cidade ? "Salvar Alterações" : "Cadastrar Cidade"}
                </Button>
            </div>
        </form>
    )
}
