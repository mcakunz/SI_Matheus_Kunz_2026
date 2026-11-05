"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { useAvisarAlteracoes } from "@/lib/cadastroModal/CadastroModalProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarEstado, salvarEstadoComRetorno } from "../actions"
import { listarPaisesAtivos } from "../../paises/actions"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { EstadoComPais, PaisSelect } from "@/lib/types"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { PaisLookup } from "@/app/components/ui/PaisLookup"
import { QuickCreateFormProps } from "@/lib/cadastroModal/types"

const schema = z.object({
    estado:  z.string().min(2, "O nome do estado deve ter no mínimo 2 caracteres.").max(100),
    uf:      z.string().length(2, "A UF deve ter exatamente 2 caracteres.").toUpperCase(),
    pais_id: z.string().min(1, "Selecione um país."),
    ativo:   z.boolean(),
})

type FormData = z.infer<typeof schema>

interface EstadoFormProps extends QuickCreateFormProps<{ id: number; estado: string; paisId: number }> {
    estado?: EstadoComPais | null
    /**
     * Opcional: quando a página server-side já tem a lista (fluxo normal
     * de página cheia), ela é passada aqui. Quando o form é aberto dentro
     * do modal de cadastro rápido (ex: a partir do CidadeForm), essa prop
     * não existe e o form busca a lista sozinho.
     */
    listaPaises?: PaisSelect[]
}

export function EstadoForm({ estado, listaPaises: listaPaisesProp, onSuccess, onCancel }: EstadoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [listaPaises, setListaPaises] = useState<PaisSelect[]>(listaPaisesProp ?? [])
    const [carregandoPaises, setCarregandoPaises] = useState(!listaPaisesProp)

    useEffect(() => {
        if (listaPaisesProp) return
        listarPaisesAtivos()
            .then(setListaPaises)
            .finally(() => setCarregandoPaises(false))
    }, [listaPaisesProp])

    const { register, handleSubmit, control, setValue, formState: { errors, isDirty } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            estado:  estado?.estado              ?? '',
            uf:      estado?.uf                  ?? '',
            pais_id: estado?.paisId?.toString()  ?? '',
            ativo:   estado ? estado.ativo        : true,
        }
    })

    // Em modal: o "Fechar sem salvar?" só aparece se algum campo foi alterado.
    useAvisarAlteracoes(isDirty)

    const handlePaisCriado = useCallback((novoPais: PaisSelect) => {
        setListaPaises(prev =>
            [...prev, novoPais].sort((a, b) => a.pais.localeCompare(b.pais, 'pt-BR'))
        )
        setValue('pais_id', String(novoPais.id))
    }, [setValue])

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
            if (onSuccess) {
                const resultado = await salvarEstadoComRetorno(formData)
                toast.success("Estado cadastrado com sucesso!")
                onSuccess(resultado)
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

    const cancelar = () => {
        if (onCancel) onCancel()
        else router.push("/estados")
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
                                required
                                error={errors.pais_id?.message}
                                onCriado={handlePaisCriado}
                            />
                        )}
                    />
                    {carregandoPaises && (
                        <p className="text-xs text-slate-400 mt-1">Carregando países...</p>
                    )}
                </div>
            </div>

            {estado && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(estado.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {estado.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(estado.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : estado ? "Salvar Alterações" : "Salvar"}
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