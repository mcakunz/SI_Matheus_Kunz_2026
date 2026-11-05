"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAvisarAlteracoes } from "@/lib/cadastroModal/CadastroModalProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarPais, salvarPaisComRetorno } from "../actions"
import toast from "react-hot-toast"

import { Button }     from "@/components/ui/Button"
import { FormInput }  from "@/components/ui/FormInput"
import { FormLabel }  from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { Pais }       from "@/lib/types"
import { QuickCreateFormProps } from "@/lib/cadastroModal/types"

import { formatarData } from "@/lib/utils/date"

const schema = z.object({
    pais:          z.string().min(2, "O nome do país deve ter no mínimo 2 caracteres.").max(100),
    codigo:        z.string().min(1, "O código é obrigatório.").max(5),
    sigla:         z.string().length(3, "A sigla deve ter exatamente 3 caracteres."),
    moeda:         z.string().length(3, "A moeda deve ter exatamente 3 caracteres."),
    nacionalidade: z.string().min(2, "A nacionalidade é obrigatória.").max(100),
    ativo:         z.boolean(),
})

type FormData = z.infer<typeof schema>

interface PaisFormProps extends QuickCreateFormProps<{ id: number; pais: string }> {
    pais?: Pais | null
}

export function PaisForm({ pais, onSuccess, onCancel }: PaisFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
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

    // Em modal: o "Fechar sem salvar?" só aparece se algum campo foi alterado.
    useAvisarAlteracoes(isDirty)

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
            if (onSuccess) {
                const novo = await salvarPaisComRetorno(formData)
                toast.success("País cadastrado com sucesso!")
                onSuccess(novo)
            } else {
                await salvarPais(formData)
                toast.success(pais ? "País atualizado com sucesso!" : "País cadastrado com sucesso!")
                router.push("/paises")
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const cancelar = () => {
        if (onCancel) onCancel()
        else router.push("/paises")
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
                    <FormInput {...register('pais')} placeholder="Digite o nome do país" />
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
                    <FormInput {...register('nacionalidade')} placeholder="Ex: Brasileira" />
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
                        {...register('sigla', { setValueAs: (v: string) => v.toUpperCase() })}
                        maxLength={3}
                        placeholder="Ex: BRA"
                        className="uppercase"
                    />
                    <Erro campo="sigla" />
                </div>

                <div>
                    <FormLabel required>Moeda</FormLabel>
                    <FormInput
                        {...register('moeda', { setValueAs: (v: string) => v.toUpperCase() })}
                        maxLength={3}
                        placeholder="Ex: BRL"
                        className="uppercase"
                    />
                    <Erro campo="moeda" />
                </div>
            </div>

            {pais && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300 font-medium">Cadastrado em</span>
                            <span>{formatarData(pais.dataCadastro)}</span>
                            {pais.usuarioCadastro && (
                                <span className="text-slate-500">por {pais.usuarioCadastro}</span>
                            )}
                        </div>
                    {pais.dataAlteracao && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-slate-300 font-medium">Última alteração</span>
                                <span>{formatarData(pais.dataAlteracao, true)}</span>
                                {pais.usuarioAlteracao && (
                                    <span className="text-slate-500">por {pais.usuarioAlteracao}</span>
                    )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : pais ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={cancelar}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}