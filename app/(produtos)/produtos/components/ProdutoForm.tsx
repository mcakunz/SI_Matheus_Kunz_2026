"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarProduto } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { FormSelect } from "@/components/ui/FormSelect"
import { FormTextArea } from "@/components/ui/FormTextArea"
import { Produto, MarcaSelect, UnidadeMedidaSelect, CategoriaSelect } from "@/lib/types"
import { useCategoriaCadastrada } from "@/lib/hooks/useCategoriaCadastrada"
import { useMarcaCadastrada } from "@/lib/hooks/useMarcaCadastrada"
import { CategoriaLookup } from "@/app/components/ui/CategoriaLookup"
import { MarcaLookup } from "@/app/components/ui/MarcaLookup"

const schema = z.object({
    produto:          z.string().min(1, "Nome do produto é obrigatório").max(50, "Máximo de 50 caracteres"),
    codigoBarras:     z.string().max(20, "Máximo de 20 caracteres").nullable(),
    referencia:       z.string().max(30, "Máximo de 30 caracteres").nullable(),
    marcaId:          z.string({ error: "Marca é obrigatória" }).min(1, "Selecione uma marca"),
    unidadeMedidaId:  z.number({ error: "Unidade de medida é obrigatória" }).int().positive("Unidade de medida é obrigatória"),
    categoriaId:      z.string({ error: "Categoria é obrigatória" }).min(1, "Selecione uma categoria"),
    valorCompra:      z.number({ error: "Valor de compra inválido" }).min(0, "Valor de compra não pode ser negativo"),
    valorVenda:       z.number({ error: "Valor de venda inválido" }).min(0, "Valor de venda não pode ser negativo"),
    quantidade:       z.number({ error: "Quantidade inválida" }).int().min(0, "Quantidade não pode ser negativa"),
    quantidadeMinima: z.number({ error: "Quantidade mínima inválida" }).int().min(1, "Quantidade mínima deve ser ao menos 1"),
    percentualLucro:  z.number({ error: "Percentual de lucro inválido" }).min(0, "Percentual de lucro não pode ser negativo"),
    descricao:        z.string().nullable(),
    observacoes:      z.string().max(150, "Máximo de 150 caracteres").nullable(),
    ativo:            z.boolean(),
})

type FormData = z.infer<typeof schema>

interface ProdutoFormProps {
    produto?:   Produto | null
    marcas:     MarcaSelect[]
    unidades:   UnidadeMedidaSelect[]
    listaCategorias: CategoriaSelect[]
}

export function ProdutoForm({ produto, marcas: marcasIniciais, unidades, listaCategorias }: ProdutoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [categorias, setCategorias] = useState<CategoriaSelect[]>(listaCategorias)
    const [marcas, setMarcas] = useState<MarcaSelect[]>(marcasIniciais)

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            produto:          produto?.produto          ?? '',
            codigoBarras:     produto?.codigoBarras     ?? null,
            referencia:       produto?.referencia       ?? null,
            marcaId:          produto?.marcaId?.toString()          ?? '',
            unidadeMedidaId:  produto?.unidadeMedidaId ?? 0,
            categoriaId:      produto?.categoriaId?.toString()      ?? '',
            valorCompra:      produto?.valorCompra      ?? 0,
            valorVenda:       produto?.valorVenda       ?? 0,
            quantidade:       produto?.quantidade       ?? 0,
            quantidadeMinima: produto?.quantidadeMinima ?? 1,
            percentualLucro:  produto?.percentualLucro  ?? 0,
            descricao:        produto?.descricao        ?? null,
            observacoes:      produto?.observacoes      ?? null,
            ativo:            produto ? produto.ativo   : true,
        },
    })

    const valorCompra = watch('valorCompra')
    const valorVenda  = watch('valorVenda')

    const handleCategoriaCriada = useCallback((novaCategoria: CategoriaSelect) => {
        setCategorias(prev =>
            [...prev, novaCategoria].sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'))
        )
        setValue('categoriaId', String(novaCategoria.id))
    }, [setValue])

    useCategoriaCadastrada(handleCategoriaCriada)

    const handleMarcaCriada = useCallback((novaMarca: MarcaSelect) => {
        setMarcas(prev =>
            [...prev, novaMarca].sort((a, b) => a.marca.localeCompare(b.marca, 'pt-BR'))
        )
        setValue('marcaId', String(novaMarca.id))
    }, [setValue])
    
    useMarcaCadastrada(handleMarcaCriada)

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (produto?.id) formData.append('id', String(produto.id))

        formData.append('produto',          data.produto)
        formData.append('codigoBarras',     data.codigoBarras     ?? '')
        formData.append('referencia',       data.referencia       ?? '')
        formData.append('marcaId',          String(data.marcaId))
        formData.append('unidadeMedidaId',  String(data.unidadeMedidaId))
        formData.append('categoriaId',      String(data.categoriaId))
        formData.append('valorCompra',      String(data.valorCompra))
        formData.append('valorVenda',       String(data.valorVenda))
        formData.append('quantidade',       String(data.quantidade))
        formData.append('quantidadeMinima', String(data.quantidadeMinima))
        formData.append('percentualLucro',  String(data.percentualLucro))
        formData.append('descricao',        data.descricao        ?? '')
        formData.append('observacoes',      data.observacoes      ?? '')
        formData.append('ativo',            String(data.ativo))

        try {
            await salvarProduto(formData)
            toast.success(produto ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!")
            router.push("/produtos")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{errors[campo]?.message}</p> : null

    const handleValorChange = (campo: 'valorCompra' | 'valorVenda', valor: number) => {
        setValue(campo, valor)
        const compra = campo === 'valorCompra' ? valor : valorCompra
        const venda  = campo === 'valorVenda'  ? valor : valorVenda
        if (compra > 0 && venda >= 0) {
            const lucro = ((venda - compra) / compra) * 100
            setValue('percentualLucro', parseFloat(lucro.toFixed(2)))
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-slate-900">

            <div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <FormLabel required>Nome do Produto</FormLabel>
                            <FormInput
                                {...register('produto')}
                                placeholder="Ex: Cabo USB Tipo-C 1m"
                                maxLength={50}
                            />
                            <Erro campo="produto" />
                        </div>
                        <div>
                            <FormLabel>Código de Barras</FormLabel>
                            <FormInput
                                {...register('codigoBarras')}
                                placeholder="Ex: 7891234567890"
                                maxLength={20}
                            />
                            <Erro campo="codigoBarras" />
                        </div>
                        <div>
                            <FormLabel>Referência</FormLabel>
                            <FormInput
                                {...register('referencia')}
                                placeholder="Ex: REF-001"
                                maxLength={30}
                            />
                            <Erro campo="referencia" />
                        </div>
                    </div>
                    <div className="pt-7">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <FormLabel required>Categoria</FormLabel>
                        <Controller
                            name="categoriaId"
                            control={control}
                            render={({ field }) => (
                                <CategoriaLookup
                                    categorias={categorias}          
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.categoriaId?.message}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <FormLabel required>Marca</FormLabel>
                        <Controller
                            name="marcaId"
                            control={control}
                            render={({ field }) => (
                                <MarcaLookup
                                    marcas={marcas}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.marcaId?.message}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <FormLabel required>Unidade de Medida</FormLabel>
                        <FormSelect
                            {...register('unidadeMedidaId', { valueAsNumber: true })}
                        >
                            <option value={0}>Selecione...</option>
                            {unidades.map(u => (
                                <option key={u.id} value={u.id}>{u.unidadeMedida}</option>
                            ))}
                        </FormSelect>
                        <Erro campo="unidadeMedidaId" />
                    </div>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <FormLabel required>Valor de Compra</FormLabel>
                        <FormInput
                            {...register('valorCompra', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            onChange={(e) => handleValorChange('valorCompra', parseFloat(e.target.value) || 0)}
                        />
                        <Erro campo="valorCompra" />
                    </div>
                    <div>
                        <FormLabel required>Valor de Venda</FormLabel>
                        <FormInput
                            {...register('valorVenda', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            onChange={(e) => handleValorChange('valorVenda', parseFloat(e.target.value) || 0)}
                        />
                        <Erro campo="valorVenda" />
                    </div>
                    <div>
                        <FormLabel>% Lucro</FormLabel>
                        <FormInput
                            {...register('percentualLucro', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            className="bg-slate-50"
                            readOnly
                        />
                        <Erro campo="percentualLucro" />
                    </div>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <FormLabel required>Quantidade</FormLabel>
                        <FormInput
                            {...register('quantidade', { valueAsNumber: true })}
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0"
                        />
                        <Erro campo="quantidade" />
                    </div>
                    <div>
                        <FormLabel required>Qtd. Mínima</FormLabel>
                        <FormInput
                            {...register('quantidadeMinima', { valueAsNumber: true })}
                            type="number"
                            step="1"
                            min="1"
                            placeholder="1"
                        />
                        <Erro campo="quantidadeMinima" />
                    </div>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <FormLabel>Descrição</FormLabel>
                        <FormTextArea
                            {...register('descricao')}
                            placeholder="Descrição detalhada do produto..."
                            rows={4}
                        />
                        <Erro campo="descricao" />
                    </div>
                    <div>
                        <FormLabel>Observações</FormLabel>
                        <FormInput
                            {...register('observacoes')}
                            placeholder="Observações internas..."
                            maxLength={150}
                        />
                        <Erro campo="observacoes" />
                    </div>
                </div>
            </div>

            {produto && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(produto.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {produto.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(produto.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : produto ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/produtos")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}