"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarPais, salvarPaisComRetorno } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { Pais } from "@/lib/types"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { emitirPaisCadastrado } from "@/lib/hooks/usePaisCadastrado"

const schema = z.object({
    pais:          z.string().min(2, "O nome do país deve ter no mínimo 2 caracteres.").max(100),
    codigo:        z.string().min(1, "O código é obrigatório.").max(5),
    sigla:         z.string().length(3, "A sigla deve ter exatamente 3 caracteres."),
    moeda:         z.string().length(3, "A moeda deve ter exatamente 3 caracteres."),
    nacionalidade: z.string().min(2, "A nacionalidade é obrigatória.").max(100),
    ativo:         z.boolean(),
})

type FormData = z.infer<typeof schema>

interface PaisFormProps {
    pais?: Pais | null
}

export function PaisForm({ pais }: PaisFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    const abertoPorLookup = searchParams.get('origem') === 'lookup'

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            pais:          pais?.pais          ?? '',
            codigo:        pais?.codigo        ?? '',
            sigla:         pais?.sigla         ?? '',
            moeda:         pais?.moeda         ?? '',
            nacionalidade: pais?.nacionalidade ?? '',
            ativo:         pais ? pais.ativo   : true,
        }
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (pais?.id) formData.append('id', String(pais.id))
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        try {
            if (abertoPorLookup && !pais) {
                const novo = await salvarPaisComRetorno(formData)
                toast.success("País cadastrado com sucesso!")
                setTimeout(() => emitirPaisCadastrado(novo), 800)
            } else {
                await salvarPais(formData)
                toast.success(pais ? "País atualizado com sucesso!" : "País cadastrado com sucesso!")
                router.push("/paises")
            }
        } catch (err: any) {
            toast.error(err.message)
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{errors[campo]?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_150px] gap-4 md:gap-6">
                <div>
                    <FormLabel>ID</FormLabel>
                    <FormInput
                        value={pais?.id ?? 'Novo'}
                        disabled
                        className="bg-slate-50 cursor-not-allowed font-mono text-slate-500"
                    />
                </div>

                <div>
                    <FormLabel required>País</FormLabel>
                    <FormInput
                        {...register('pais')}
                        placeholder="Digite o nome do país"
                    />
                    <Erro campo="pais" />
                </div>

                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_150px] gap-4 md:gap-6">
                <div>
                    <FormLabel required>Nacionalidade</FormLabel>
                    <FormInput
                        {...register('nacionalidade')}
                        placeholder="Ex: Brasileira"
                    />
                    <Erro campo="nacionalidade" />
                </div>

                <div>
                    <FormLabel required>Cód. BACEN</FormLabel>
                    <FormInput
                        {...register('codigo')}
                        maxLength={5}
                        placeholder="Ex: 1058"
                        inputMode="numeric"
                        onKeyDown={(e) => {
                            const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight']
                            if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                        }}
                    />
                    <Erro campo="codigo" />
                </div>

                <div>
                    <FormLabel required>Sigla</FormLabel>
                    <FormInput
                        {...register('sigla')}
                        maxLength={3}
                        placeholder="Ex: BRA"
                        className="uppercase"
                    />
                    <Erro campo="sigla" />
                </div>

                <div>
                    <FormLabel required>Moeda</FormLabel>
                    <FormInput
                        {...register('moeda')}
                        maxLength={3}
                        placeholder="Ex: BRL"
                        className="uppercase"
                    />
                    <Erro campo="moeda" />
                </div>
            </div>

            {pais && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(pais.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {pais.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(pais.dataAlteracao).toLocaleDateString('pt-BR', {
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
                    onClick={() => abertoPorLookup ? window.close() : router.push("/paises")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : pais ? "Salvar Alterações" : "Cadastrar País"}
                </Button>
            </div>
        </form>
    )
}
