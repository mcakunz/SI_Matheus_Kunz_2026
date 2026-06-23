"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarVeiculo } from "../actions"
import toast from "react-hot-toast"

import { Button }     from "@/components/ui/Button"
import { FormInput }  from "@/components/ui/FormInput"
import { FormLabel }  from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { Veiculo }    from "@/lib/types"
import { mascaraPlacaMercosul, mascaraPlacaPadrao } from "@/lib/utils/mascaras"
import { isMercosul } from "@/lib/utils/helpers"

const schema = z.object({
placa: z.string()
        .min(7, "Placa inválida.")
        .max(8)
        .refine(
            val => {
                const limpo = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
                return limpo.length === 7 && /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(limpo)
            },
            "Placa inválida. Use AAA-0000 (padrão) ou AAA0A00 (Mercosul)."
        ),
    modelo:     z.string().min(2, "O modelo deve ter no mínimo 2 caracteres.").max(50),
    marca:      z.string().min(2, "A marca deve ter no mínimo 2 caracteres.").max(50),
    ano:        z.string().min(4, "Informe o ano."),
    capacidade: z.string().optional(),
    ativo:      z.boolean(),
    mercosul:   z.boolean(),
})

type FormData = z.infer<typeof schema>

interface VeiculoFormProps {
    veiculo?: Veiculo | null
}

export function VeiculoForm({ veiculo }: VeiculoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const mercosulInicial  = veiculo?.placa ? isMercosul(veiculo.placa) : false
    const placaFormatada   = veiculo?.placa
        ? mercosulInicial
            ? mascaraPlacaMercosul(veiculo.placa)
            : mascaraPlacaPadrao(veiculo.placa)          
        : ''

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            placa:      placaFormatada,
            modelo:     veiculo?.modelo          ?? '',
            marca:      veiculo?.marca           ?? '',
            ano:        veiculo?.ano?.toString() ?? '',
            capacidade: veiculo?.capacidade?.toString() ?? '',
            ativo:      veiculo ? veiculo.ativo : true,
            mercosul:   mercosulInicial,
        },
    })

    const isMercosulAtivo = watch('mercosul')

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (veiculo?.id) formData.append('id', String(veiculo.id))

        formData.append('placa',      data.placa.replace(/[^A-Z0-9]/gi, '').toUpperCase())
        formData.append('modelo',     data.modelo)
        formData.append('marca',      data.marca)
        formData.append('ano',        data.ano)
        formData.append('capacidade', data.capacidade ?? '')
        formData.append('ativo',      String(data.ativo))

        try {
            await salvarVeiculo(formData)
            toast.success(veiculo ? "Veículo atualizado com sucesso!" : "Veículo cadastrado com sucesso!")
            router.push("/veiculos")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? (
            <p className="text-xs text-red-500 mt-1">{(errors[campo] as any)?.message}</p>
        ) : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Placa</FormLabel>
                    <FormInput
                        {...register('placa', {
                            onChange: (e) => {
                                const valorLimpo = e.target.value.replace(/[^A-Za-z0-9]/g, '')
                                e.target.value = isMercosulAtivo
                                    ? mascaraPlacaMercosul(valorLimpo) 
                                    : mascaraPlacaPadrao(valorLimpo)
                            },
                        })}
                        maxLength={8} 
                        placeholder={isMercosulAtivo ? "AAA0A00" : "AAA-0000"}
                        className="uppercase tracking-widest"
                    />
                    <Erro campo="placa" />
                </div>

                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700">
                        <input
                            type="checkbox"
                            {...register('mercosul')}
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span>Placa Mercosul</span>
                        <span className="text-xs text-slate-400">(AAA0A00)</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Modelo</FormLabel>
                    <FormInput
                        {...register('modelo')}
                        placeholder="Ex: Sprinter 415, Fiorino, Toco..."
                        maxLength={50}
                    />
                    <Erro campo="modelo" />
                </div>
                <div>
                    <FormLabel required>Marca</FormLabel>
                    <FormInput
                        {...register('marca')}
                        placeholder="Ex: Mercedes-Benz, Fiat, Volkswagen..."
                        maxLength={50}
                    />
                    <Erro campo="marca" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Ano de Fabricação</FormLabel>
                    <FormInput
                        {...register('ano', {
                            onChange: (e) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4)
                            },
                        })}
                        placeholder="Ex: 2022"
                        inputMode="numeric"
                        maxLength={4}
                    />
                    <Erro campo="ano" />
                </div>
                <div>
                    <FormLabel>Capacidade de Carga (kg)</FormLabel>
                    <FormInput
                        {...register('capacidade')}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Ex: 3500.00"
                    />
                    <Erro campo="capacidade" />
                </div>
            </div>

            {veiculo && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(veiculo.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {veiculo.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(veiculo.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : veiculo ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/veiculos")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>

        </form>
    )
}