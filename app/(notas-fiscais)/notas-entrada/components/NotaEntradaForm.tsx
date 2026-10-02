"use client"

import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, useWatch, Controller, Control, UseFormRegister, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { HiPlus, HiTrash } from "react-icons/hi"

import { salvarNotaEntrada, verificarChaveNotaEntradaExiste } from "../actions"
import { listarFornecedoresAtivos } from "@/app/(cadastros)/fornecedores/actions"
import { listarTransportadorasAtivas } from "@/app/(cadastros)/transportadoras/actions"
import { listarCondicoesPagamentoAtivas, listarParcelasPorCondicao } from "@/app/(financeiro)/condicoes-pagamento/actions"
import { listarProdutosAtivos } from "@/app/(produtos)/produtos/actions"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { toDateString } from "@/lib/utils/helpers"

import { FornecedorLookup } from "@/app/components/ui/FornecedorLookup"
import { TransportadoraLookup } from "@/app/components/ui/TransportadoraLookup"
import { CondicaoPagamentoLookup } from "@/app/components/ui/CondicaoPagamentoLookup"
import { ProdutoLookup } from "@/app/components/ui/ProdutoLookup"

import {
    NotaEntradaView,
    ItemNotaEntrada,
    FornecedorSelect,
    TransportadoraSelect,
    CondicaoPagamentoSelect,
    ProdutoSelect,
    ParcelaCondicao
} from "@/lib/types"

const itemSchema = z.object({
    produtoId:     z.string().min(1, "Selecione um produto"),
    quantidade:    z.number().min(0.01, "Min. 0.01"),
    valorUnitario: z.number().min(0, "Inválido"),
    valorDesconto: z.number().min(0, "Inválido"),
    valorTotal:    z.number().min(0),
}).refine((data) => data.valorDesconto <= data.quantidade * data.valorUnitario, {
    message: "O desconto não pode ser maior que o valor do item.",
    path: ["valorDesconto"],
})

const schema = z.object({
    numero:              z.string().min(1, "Número da NF é obrigatório").max(20).regex(/^\d+$/, "O número da NF deve conter apenas dígitos."),
    modelo:              z.string().min(1, "Obrigatório").max(2),
    serie:               z.string().min(1, "Obrigatório").max(3),
    fornecedorId:        z.string().min(1, "Fornecedor é obrigatório"),
    transportadoraId:    z.string().optional().nullable(),
    condicaoPagamentoId: z.string().min(1, "Condição é obrigatória"),
    dataEmissao:         z.string().min(1, "Data de emissão é obrigatória"),
    dataEntrada:         z.string().min(1, "Data de entrada é obrigatória"),
    valorFrete:          z.number().min(0),
    valorDesconto:       z.number().min(0),
    valorTotalProdutos:  z.number().min(0),
    valorTotalNota:      z.number().min(0),
    observacoes:         z.string().max(500).optional().nullable(),
    situacao:            z.enum(['LANCADA', 'CANCELADA']),
    itens:               z.array(itemSchema).min(1, "Adicione pelo menos um produto na nota"),
}).refine((data) => data.dataEntrada >= data.dataEmissao, {
    message: "A data de entrada não pode ser anterior à data de emissão.",
    path: ["dataEntrada"],
}).refine((data) => data.dataEntrada <= new Date().toISOString().split('T')[0], {
    message: "A data de entrada não pode ser posterior à data de hoje.",
    path: ["dataEntrada"],
})

type NotaFormValues = z.infer<typeof schema>

// Definido como constante (não como classe Tailwind com colchetes) porque, neste projeto,
// a classe `grid-cols-[1fr_100px_130px_130px_40px]` não estava sendo gerada — o grid caía
// pra layout de bloco normal e as colunas empilhavam. Usando style inline, o grid funciona
// independente de como o Tailwind está configurado/fazendo purge.
// Usado no lugar de `valueAsNumber: true` nos campos numéricos que o usuário pode apagar
// (deixar em branco). Um <input type="number"> vazio vira "" → valueAsNumber converteria isso
// pra NaN, e o Zod rejeita NaN com uma mensagem genérica feia ("expected number, received NaN")
// em vez das mensagens de validação já configuradas (.min etc). Convertendo pra 0 aqui, o campo
// cai nas mensagens de validação normais quando faz sentido (ex.: quantidade mínima) e passa
// direto quando 0 é um valor válido (ex.: desconto). Também nunca deixa passar negativo (via
// colar/autofill, por exemplo) — quantidade/valor/frete nunca fazem sentido negativos aqui.
const paraNumero = (v: string) => {
    const n = parseFloat(v)
    if (Number.isNaN(n)) return 0
    return Math.max(0, n)
}

// Bloqueia a digitação de sinal de menos, mais e notação científica (e/E) nos campos
// numéricos que nunca podem ser negativos. O atributo HTML `min="0"` sozinho só marca o
// campo como inválido pro submit *nativo* do form — que este form nem usa, já que o envio é
// manual via FormData —, então sem isso dava pra digitar "-5" numa boa e só ver o erro (feio,
// genérico) depois de preencher a nota inteira e tentar gravar.
const bloquearTeclasInvalidas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault()
}

const ITENS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 70px 90px 130px 110px 130px 40px',
    gap: '0.75rem',
}

const PARCELAS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '70px 1fr 140px',
    gap: '0.75rem',
}

interface NotaEntradaFormProps {
    nota?: NotaEntradaView | null
    itensIniciais?: ItemNotaEntrada[]
}

// --- LINHA DE ITEM (componente próprio) ---
// Precisa ser um componente separado (em vez de JSX solto dentro do .map) porque usa
// useWatch para saber, em tempo real, qual produto está selecionado NESSA linha e assim
// mostrar a unidade de medida dele. Hooks não podem ser chamados dentro de um loop/.map
// diretamente — o React exige que cada "instância" que usa hooks seja seu próprio componente.
interface ItemRowProps {
    index: number
    control: Control<NotaFormValues>
    register: UseFormRegister<NotaFormValues>
    errors: FieldErrors<NotaFormValues>
    produtos: ProdutoSelect[]
    calcularTotais: () => void
    onProdutoSelecionado: (index: number, produtoId: string) => void
    onProdutoCriado: (novo: ProdutoSelect, indexLinha: number) => void
    onRemover: () => void
}

function ItemRow({
    index, control, register, errors, produtos,
    calcularTotais, onProdutoSelecionado, onProdutoCriado, onRemover,
}: ItemRowProps) {
    // Observa o produtoId dessa linha específica para reagir assim que o usuário troca o produto.
    const produtoIdSelecionado = useWatch({ control, name: `itens.${index}.produtoId` })
    const produtoSelecionado = produtos.find(p => String(p.id) === produtoIdSelecionado)

    return (
        <div style={ITENS_GRID_STYLE} className="items-center px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <div>
                <Controller
                    name={`itens.${index}.produtoId`}
                    control={control}
                    render={({ field: f }) => (
                        <ProdutoLookup
                            produtos={produtos}
                            value={f.value}
                            onChange={(id) => {
                                f.onChange(id)
                                onProdutoSelecionado(index, id)
                            }}
                            error={errors.itens?.[index]?.produtoId?.message}
                            onCriado={(novo) => onProdutoCriado(novo, index)}
                        />
                    )}
                />
            </div>
            {/* Unidade de medida do produto selecionado (ex: un, kg, cx) - coluna so de
                visualizacao (nao faz parte dos dados enviados, e derivada do produto). */}
            <div
                className="w-full h-full min-h-[38px] flex items-center justify-left px-1 border border-slate-200 rounded bg-slate-50 text-xs font-medium text-slate-500 text-center"
                title={produtoSelecionado ? `Unidade: ${produtoSelecionado.unidadeMedida}` : undefined}
            >
                {produtoSelecionado ? produtoSelecionado.unidadeMedida : '-'}
            </div>
            <div>
                <FormInput
                    type="number"
                    step="0.001" min="0.01"
                    onKeyDown={bloquearTeclasInvalidas}
                    {...register(`itens.${index}.quantidade`, { setValueAs: paraNumero, onChange: calcularTotais })}
                />
            </div>
            <div>
                <FormInput
                    type="number"
                    step="0.01" min="0"
                    onKeyDown={bloquearTeclasInvalidas}
                    {...register(`itens.${index}.valorUnitario`, { setValueAs: paraNumero, onChange: calcularTotais })}
                />
            </div>
            <div>
                <FormInput
                    type="number"
                    step="0.01" min="0"
                    onKeyDown={bloquearTeclasInvalidas}
                    {...register(`itens.${index}.valorDesconto`, { setValueAs: paraNumero, onChange: calcularTotais })}
                />
                {errors.itens?.[index]?.valorDesconto && (
                    <p className="text-xs text-red-500 mt-1">{errors.itens[index]?.valorDesconto?.message}</p>
                )}
            </div>
            <div>
                <FormInput
                    type="number"
                    className="bg-slate-100 font-semibold"
                    readOnly
                    {...register(`itens.${index}.valorTotal`, { valueAsNumber: true })}
                />
            </div>
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={onRemover}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                    <HiTrash size={16} />
                </button>
            </div>
        </div>
    )
}

export function NotaEntradaForm({ nota, itensIniciais = [] }: NotaEntradaFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isEdicao = !!nota

    // Estados das listas
    const [fornecedores, setFornecedores]       = useState<FornecedorSelect[]>([])
    const [transportadoras, setTransportadoras] = useState<TransportadoraSelect[]>([])
    const [condicoes, setCondicoes]             = useState<CondicaoPagamentoSelect[]>([])
    const [produtos, setProdutos]               = useState<ProdutoSelect[]>([])
    const [carregandoListas, setCarregandoListas] = useState(true)

    useEffect(() => {
        Promise.all([
            listarFornecedoresAtivos(),
            listarTransportadorasAtivas(),
            listarCondicoesPagamentoAtivas(),
            listarProdutosAtivos(),
        ]).then(([f, t, c, p]) => {
            setFornecedores(f)
            setTransportadoras(t)
            setCondicoes(c)
            setProdutos(p)
        }).finally(() => setCarregandoListas(false))
    }, [])

    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm<NotaFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            numero:              nota?.numero ?? '',
            modelo:              nota?.modelo ?? '55',
            serie:               nota?.serie ?? '1',
            fornecedorId:        nota?.fornecedorId ? nota.fornecedorId.toString() : '',
            transportadoraId:    nota?.transportadoraId ? nota.transportadoraId.toString() : undefined,
            condicaoPagamentoId: nota?.condicaoPagamentoId ? nota.condicaoPagamentoId.toString() : '',
            dataEmissao:         toDateString(nota?.dataEmissao) ?? new Date().toISOString().split('T')[0],
            dataEntrada:         toDateString(nota?.dataChegada) ?? new Date().toISOString().split('T')[0],
            valorFrete:          nota?.valorFrete ?? 0,
            valorDesconto:       nota?.valorDesconto ?? 0,
            valorTotalProdutos:  nota?.valorProdutos ?? 0,
            valorTotalNota:      nota?.valorTotal ?? 0,
            observacoes:         nota?.observacoes ?? '',
            situacao:            (nota?.situacao as NotaFormValues['situacao']) ?? 'LANCADA',
            itens: itensIniciais.length > 0 
                ? itensIniciais.map(i => ({
                    produtoId:     String(i.produtoId),
                    quantidade:    Number(i.quantidade),
                    valorUnitario: Number(i.valorUnitario),
                    valorDesconto: Number(i.valorDesconto ?? 0),
                    valorTotal:    Number(i.valorTotal)
                }))
                : []
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'itens' })

    // --- REGRA: CHAVE PRIMÁRIA DA NOTA (numero + modelo + serie + fornecedorId) ---
    const numeroAtual       = useWatch({ control, name: 'numero' })
    const modeloAtual       = useWatch({ control, name: 'modelo' })
    const serieAtual        = useWatch({ control, name: 'serie' })
    const fornecedorIdAtual = useWatch({ control, name: 'fornecedorId' })

    // Assim que existir pelo menos 1 produto na lista, a chave (nº, modelo, série, fornecedor)
    // fica travada — só volta a ficar editável se todos os produtos forem removidos da lista.
    const chaveBloqueada = fields.length > 0

    const chaveCompleta = Boolean(numeroAtual && modeloAtual && serieAtual && fornecedorIdAtual)
    const chaveAtualStr = chaveCompleta
        ? `${numeroAtual}|${modeloAtual}|${serieAtual}|${fornecedorIdAtual}`
        : null

    // Em edição a chave já existe por definição (é o próprio registro sendo editado), então
    // não precisa da verificação de duplicidade — só numa nota nova é que isso importa.
    const [chaveLiberadaPara, setChaveLiberadaPara] = useState<string | null>(
        isEdicao ? chaveAtualStr : null
    )
    const [verificandoChave, setVerificandoChave] = useState(false)
    const [erroChave, setErroChave] = useState<string | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isEdicao) return
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!chaveCompleta) {
            setErroChave(null)
            setVerificandoChave(false)
            return
        }
        if (chaveAtualStr === chaveLiberadaPara) return // já verificada, nada mudou desde então

        setErroChave(null)
        debounceRef.current = setTimeout(async () => {
            setVerificandoChave(true)
            try {
                const existe = await verificarChaveNotaEntradaExiste(
                    numeroAtual, modeloAtual, serieAtual, Number(fornecedorIdAtual)
                )
                if (existe) {
                    setErroChave("Já existe uma nota com este número, modelo, série e fornecedor.")
                    setChaveLiberadaPara(null)
                } else {
                    setErroChave(null)
                    setChaveLiberadaPara(chaveAtualStr)
                }
            } catch {
                setErroChave("Não foi possível verificar a chave da nota. Tente novamente.")
                setChaveLiberadaPara(null)
            } finally {
                setVerificandoChave(false)
            }
        }, 500)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaveAtualStr, chaveCompleta, isEdicao])

    // Libera as Datas assim que a chave foi conferida e está livre (em edição, sempre liberado,
    // pois a chave já é a do registro existente).
    const outrasSecoesLiberadas = isEdicao || (chaveAtualStr !== null && chaveAtualStr === chaveLiberadaPara)

    // Cascata (rule): Chave -> Datas -> Restante. O restante da nota (Produtos, Frete,
    // Condição de Pagamento, Fechamento) só libera depois que as próprias Datas forem
    // preenchidas E válidas — não basta a chave estar liberada e as datas terem algum
    // valor, elas precisam passar nas mesmas regras que o Zod aplicaria no submit.
    const dataEmissaoAtual = useWatch({ control, name: 'dataEmissao' })
    const dataEntradaAtual = useWatch({ control, name: 'dataEntrada' })
    const datasCompletas = Boolean(dataEmissaoAtual && dataEntradaAtual)

    // Mesmas duas regras do .refine() do schema, replicadas aqui para rodar em tempo real
    // (a cada mudança nas datas) e não só no submit. Sem isso, o usuário preenchia uma data
    // errada, liberava e preenchia todo o resto da nota (produtos, condição de pagamento...)
    // e só descobria o erro ao clicar em "Gravar".
    const erroDatas = useMemo(() => {
        if (!datasCompletas) return null
        const hoje = new Date().toISOString().split('T')[0]
        if (dataEntradaAtual < dataEmissaoAtual) {
            return "A data de entrada não pode ser anterior à data de emissão."
        }
        if (dataEntradaAtual > hoje) {
            return "A data de entrada não pode ser posterior à data de hoje."
        }
        return null
    }, [dataEmissaoAtual, dataEntradaAtual, datasCompletas])

    const restoLiberado = outrasSecoesLiberadas && datasCompletas && !erroDatas

    // --- MOTOR DE CÁLCULO ---
    const calcularTotais = useCallback(() => {
        const itensAtuais = getValues('itens') || []
        let totProd = 0

        itensAtuais.forEach((item, index) => {
            const qtd = Number(item.quantidade) || 0
            const unit = Number(item.valorUnitario) || 0
            const desconto = Number(item.valorDesconto) || 0
            // Desconto por item não pode deixar o total da linha negativo.
            const totItem = Math.max(0, (qtd * unit) - desconto)
            totProd += totItem
            
            setValue(`itens.${index}.valorTotal`, parseFloat(totItem.toFixed(2)))
        })

        const frete = Number(getValues('valorFrete')) || 0
        const desconto = Number(getValues('valorDesconto')) || 0
        const totNota = totProd + frete - desconto

        setValue('valorTotalProdutos', parseFloat(totProd.toFixed(2)))
        setValue('valorTotalNota', parseFloat(totNota.toFixed(2)))
    }, [getValues, setValue])

    // --- QUADRO DE PARCELAS (derivado da Condição de Pagamento escolhida) ---
    // Busca a config de parcelas (dias + percentual de cada uma) só quando a condição muda —
    // não a cada tecla digitada em frete/desconto/etc, já que isso não depende dessas datas.
    // (dataEmissaoAtual já foi declarado acima, junto com a cascata Chave -> Datas -> Resto.)
    const condicaoPagamentoIdAtual = useWatch({ control, name: 'condicaoPagamentoId' })
    const valorTotalNotaAtual      = useWatch({ control, name: 'valorTotalNota' })

    const [parcelasCondicao, setParcelasCondicao] = useState<ParcelaCondicao[]>([])
    const [carregandoParcelas, setCarregandoParcelas] = useState(false)

    useEffect(() => {
        const id = Number(condicaoPagamentoIdAtual)
        if (!id) {
            setParcelasCondicao([])
            return
        }
        let cancelado = false
        setCarregandoParcelas(true)
        listarParcelasPorCondicao(id)
            .then(p => { if (!cancelado) setParcelasCondicao(p) })
            .catch(() => { if (!cancelado) setParcelasCondicao([]) })
            .finally(() => { if (!cancelado) setCarregandoParcelas(false) })
        return () => { cancelado = true }
    }, [condicaoPagamentoIdAtual])

    // Vencimento de cada parcela = Data de Emissão + "dias" daquela parcela (não é cumulativo
    // sobre a parcela anterior — cada parcela já guarda o total de dias desde a emissão).
    // Valor de cada parcela = percentual sobre o Total da Nota; a última parcela absorve a
    // diferença de arredondamento para a soma bater exatamente com o total.
    const parcelasCalculadas = useMemo(() => {
        if (!dataEmissaoAtual || parcelasCondicao.length === 0) return []

        const totalNota = Number(valorTotalNotaAtual) || 0
        const valores = parcelasCondicao.map(p => Math.round(((totalNota * Number(p.percentual)) / 100) * 100) / 100)
        const somaArredondada = valores.reduce((acc, v) => acc + v, 0)
        const diferenca = Math.round((totalNota - somaArredondada) * 100) / 100
        if (valores.length > 0) {
            valores[valores.length - 1] = Math.round((valores[valores.length - 1] + diferenca) * 100) / 100
        }

        const base = new Date(`${dataEmissaoAtual}T00:00:00`)
        return parcelasCondicao.map((p, i) => {
            const vencimento = new Date(base)
            vencimento.setDate(vencimento.getDate() + Number(p.dias))
            return {
                numero: p.numero,
                dataVencimento: vencimento,
                valor: valores[i],
            }
        })
    }, [parcelasCondicao, dataEmissaoAtual, valorTotalNotaAtual])

    // --- HANDLERS DOS MODAIS ---
    const handleFornecedorCriado = useCallback((novo: FornecedorSelect) => {
        setFornecedores(prev => [...prev, novo].sort((a, b) => a.fornecedor.localeCompare(b.fornecedor)))
        setValue('fornecedorId', String(novo.id), { shouldValidate: true })
    }, [setValue])

    const handleTransportadoraCriada = useCallback((novo: TransportadoraSelect) => {
        setTransportadoras(prev => [...prev, novo].sort((a, b) => a.razaoSocialNome.localeCompare(b.razaoSocialNome)))
        setValue('transportadoraId', String(novo.id))
    }, [setValue])

    const handleCondicaoCriada = useCallback((novo: CondicaoPagamentoSelect) => {
        setCondicoes(prev => [...prev, novo].sort((a, b) => a.condicaoPagamento.localeCompare(b.condicaoPagamento)))
        setValue('condicaoPagamentoId', String(novo.id), { shouldValidate: true })
    }, [setValue])

    // Preenche o valor unitário do item com o custo cadastrado do produto (valorCompra),
    // assim que o produto é selecionado no lookup. O campo continua editável depois —
    // é só um ponto de partida, já que o preço negociado nessa compra pode ser diferente.
    const preencherValorDoProduto = useCallback((index: number, produtoId: string) => {
        const produtoSelecionado = produtos.find(p => String(p.id) === produtoId)
        if (!produtoSelecionado) return

        setValue(`itens.${index}.valorUnitario`, Number(produtoSelecionado.valorCompra) || 0)
        calcularTotais()
    }, [produtos, setValue, calcularTotais])

    const handleProdutoCriado = useCallback((novo: ProdutoSelect, indexLinha: number) => {
        setProdutos(prev => [...prev, novo].sort((a, b) => a.produto.localeCompare(b.produto)))
        setValue(`itens.${indexLinha}.produtoId`, String(novo.id), { shouldValidate: true })
        setValue(`itens.${indexLinha}.valorUnitario`, Number(novo.valorCompra) || 0)
        calcularTotais()
    }, [setValue, calcularTotais])


    const onSubmit = async (data: NotaFormValues) => {
        setLoading(true)
        const formPayload = new FormData()
        
        formPayload.append('isEdicao', isEdicao ? 'true' : 'false')
        if (isEdicao && nota) {
            formPayload.append('originalNumero', nota.numero)
            formPayload.append('originalModelo', nota.modelo)
            formPayload.append('originalSerie', nota.serie)
            formPayload.append('originalFornecedorId', String(nota.fornecedorId))
        }

        const { itens, ...scalar } = data
        Object.entries(scalar).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formPayload.append(key, String(value))
        })
        
        formPayload.append('itens', JSON.stringify(itens))

        try {
            await salvarNotaEntrada(formPayload)
            toast.success(isEdicao ? "Nota de entrada atualizada!" : "Nota de entrada lançada com sucesso!")
            router.push("/notas-entrada")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof NotaFormValues }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{(errors[campo] as any)?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-slate-900">

            {/* A situação não é escolhida ao lançar/editar a nota — nasce como LANCADA e só
                muda pra CANCELADA através da ação "Cancelar" na listagem (NotasEntradaClientTable),
                que reflete um evento real (a nota foi cancelada). Não existe mais estado
                intermediário (PENDENTE/CONFIRMADA) nem edição livre do status. Mantemos o campo
                aqui apenas como hidden para reenviar o valor atual e não resetá-lo a cada edição. */}
            <input type="hidden" {...register('situacao')} />

            {/* Não existe mais um desconto genérico "solto" na nota — desconto agora só se dá
                por produto (ver coluna Desconto em Produtos), que é rastreável até o item.
                Mantemos o campo oculto (sempre 0 numa nota nova) só para não quebrar quem
                já tinha uma nota antiga com esse valor preenchido. */}
            <input type="hidden" {...register('valorDesconto', { valueAsNumber: true })} />

            {/* --- CHAVE DA NOTA (numero + modelo + serie + fornecedor) --- */}
            {/* Fica sempre acessível para permitir a verificação de duplicidade, mas trava
                (rule 3) assim que existir pelo menos 1 produto na lista — só volta a ficar
                editável se todos os produtos forem removidos. */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados da Nota</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <FormLabel required>Modelo</FormLabel>
                        <FormInput {...register('modelo')} disabled={chaveBloqueada} placeholder="Ex: 55" maxLength={2} />
                        <Erro campo="modelo" />
                    </div>
                    <div>
                        <FormLabel required>Série</FormLabel>
                        <FormInput {...register('serie')} disabled={chaveBloqueada} placeholder="Ex: 1" maxLength={3} />
                        <Erro campo="serie" />
                    </div>
                    <div>
                        <FormLabel required>Nº da NF</FormLabel>
                        <FormInput
                            {...register('numero', {
                                onChange: (e) => {
                                    const digits = e.target.value.replace(/\D/g, '')
                                    if (digits !== e.target.value) setValue('numero', digits)
                                },
                            })}
                            disabled={chaveBloqueada}
                            placeholder="Ex: 000123"
                            maxLength={20}
                            inputMode="numeric"
                        />
                        <Erro campo="numero" />
                    </div>
                    <div>
                        <FormLabel required>Fornecedor</FormLabel>
                        <Controller
                            name="fornecedorId"
                            control={control}
                            render={({ field }) => (
                                <FornecedorLookup
                                    fornecedores={fornecedores}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.fornecedorId?.message}
                                    onCriado={handleFornecedorCriado}
                                    disabled={chaveBloqueada}
                                />
                            )}
                        />
                    </div>
                </div>

                {chaveBloqueada && (
                    <p className="text-xs text-amber-600">
                        Para alterar número, modelo, série, fornecedor ou as datas, remova todos os produtos da lista abaixo primeiro.
                    </p>
                )}

                {!isEdicao && chaveCompleta && (
                    <p className="text-xs">
                        {verificandoChave && (
                            <span className="text-slate-400">Verificando se já existe uma nota com esses dados...</span>
                        )}
                        {!verificandoChave && erroChave && (
                            <span className="text-red-500 font-medium">{erroChave}</span>
                        )}
                        {!verificandoChave && !erroChave && chaveAtualStr === chaveLiberadaPara && (
                            <span className="text-emerald-600 font-medium">Chave disponível — pode continuar preenchendo a nota.</span>
                        )}
                    </p>
                )}

                {/* Datas ficam no mesmo cartão da chave (igual à referência), mas continuam
                    travadas (fieldset próprio) até a chave acima ser conferida — mesma regra
                    de antes, só mudou o agrupamento visual. */}
                <fieldset
                    disabled={!outrasSecoesLiberadas || chaveBloqueada}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 disabled:opacity-50"
                >
                    <div>
                        <FormLabel required>Data de Emissão</FormLabel>
                        <FormInput type="date" {...register('dataEmissao')} />
                        <Erro campo="dataEmissao" />
                    </div>
                    <div>
                        <FormLabel required>Data de Entrada</FormLabel>
                        <FormInput type="date" {...register('dataEntrada')} />
                        {/* Erro calculado em tempo real (erroDatas) tem prioridade sobre o erro
                            do react-hook-form/zod, que só apareceria depois de um submit. */}
                        {erroDatas ? (
                            <p className="text-xs text-red-500 mt-1">{erroDatas}</p>
                        ) : (
                            <Erro campo="dataEntrada" />
                        )}
                    </div>
                </fieldset>

                {outrasSecoesLiberadas && !datasCompletas && (
                    <p className="text-xs text-amber-600">
                        Preencha a Data de Emissão e a Data de Entrada para liberar o restante da nota.
                    </p>
                )}

                {outrasSecoesLiberadas && datasCompletas && erroDatas && (
                    <p className="text-xs text-red-500 font-medium">
                        Corrija as datas acima para liberar o restante da nota.
                    </p>
                )}
            </div>

            {/* --- RESTANTE DO FORMULÁRIO --- */}
            {/* Cascata (rule): só libera depois que a chave foi verificada/confirmada como livre
                E as Datas acima já foram preenchidas E são válidas (ver erroDatas). Em edição, a
                chave já vem liberada e as datas já vêm preenchidas pelos dados existentes, então
                cai liberado de cara (a não ser que os dados existentes violem as regras). */}
            <fieldset disabled={!restoLiberado} className="flex flex-col gap-6 disabled:opacity-50">

            {/* --- PRODUTOS (ITENS DA NOTA) --- */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Produtos</h2>
                    <button
                        type="button"
                        onClick={() => append({ produtoId: '', quantidade: 1, valorUnitario: 0, valorDesconto: 0, valorTotal: 0 })}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <HiPlus size={14} /> Adicionar Produto
                    </button>
                </div>

                {errors.itens?.message && <p className="text-xs text-red-500 mb-2">{errors.itens.message}</p>}
                {errors.itens?.root && <p className="text-xs text-red-500 mb-2">{errors.itens.root.message}</p>}

                {/* Sem "overflow-hidden" aqui — ver ItemRow/BaseLookup: um overflow-hidden no
                    container pai corta o dropdown (position:absolute) do ProdutoLookup. Os
                    cantos arredondados vêm do rounded-t-lg no cabeçalho e rounded-b-lg na
                    última linha / estado vazio. */}
                <div className="border border-slate-200 rounded-lg">
                    <div
                        style={ITENS_GRID_STYLE}
                        className="bg-slate-100 rounded-t-lg px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600"
                    >
                        <span>Produto</span>
                        <span>Und.</span>
                        <span>Qtd.</span>
                        <span>Val. Unitário</span>
                        <span>Desconto</span>
                        <span>Total Item</span>
                        <span></span>
                    </div>

                    {fields.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6 rounded-b-lg">Nenhum produto adicionado na nota.</p>
                    ) : (
                        <div className="flex flex-col">
                            {fields.map((field, index) => (
                                <ItemRow
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    produtos={produtos}
                                    calcularTotais={calcularTotais}
                                    onProdutoSelecionado={preencherValorDoProduto}
                                    onProdutoCriado={handleProdutoCriado}
                                    onRemover={() => { remove(index); calcularTotais() }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-5">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Frete e Transportadora</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel>Valor Frete</FormLabel>
                        <FormInput type="number" step="0.01" min="0" onKeyDown={bloquearTeclasInvalidas} {...register('valorFrete', { setValueAs: paraNumero, onChange: calcularTotais })} />
                    </div>
                    <div>
                        <FormLabel>Transportadora</FormLabel>
                        <Controller
                            name="transportadoraId"
                            control={control}
                            render={({ field }) => (
                                <TransportadoraLookup
                                    transportadoras={transportadoras}
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    onCriado={handleTransportadoraCriada}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-5">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Condição de Pagamento</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel required>Condição de Pagamento</FormLabel>
                        <Controller
                            name="condicaoPagamentoId"
                            control={control}
                            render={({ field }) => (
                                <CondicaoPagamentoLookup
                                    condicoes={condicoes}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.condicaoPagamentoId?.message}
                                    onCriado={handleCondicaoCriada}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Quadro de parcelas: só informativo (derivado da condição escolhida),
                    não é editado aqui — quem edita dias/percentual é o cadastro de
                    Condições de Pagamento. */}
                <div className="border-t border-slate-200 pt-4">
                    <div style={PARCELAS_GRID_STYLE} className="px-1 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        <span>Parcela</span>
                        <span>Data Vencimento</span>
                        <span className="text-right">Valor Parcela</span>
                    </div>

                    {carregandoParcelas ? (
                        <p className="text-xs text-slate-400 text-center py-4">Carregando parcelas...</p>
                    ) : parcelasCalculadas.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                            Nenhuma parcela configurada na condição de pagamento.
                        </p>
                    ) : (
                        <div className="flex flex-col">
                            {parcelasCalculadas.map(p => (
                                <div
                                    key={p.numero}
                                    style={PARCELAS_GRID_STYLE}
                                    className="items-center px-1 py-2 border-t border-slate-100 first:border-0 text-sm"
                                >
                                    <span className="font-medium text-slate-600">{p.numero}</span>
                                    <span className="text-slate-600">{p.dataVencimento.toLocaleDateString('pt-BR')}</span>
                                    <span className="text-right font-medium text-slate-800">
                                        {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- TOTAIS DA NOTA --- */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-lg flex flex-col gap-4">
                <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Fechamento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <FormLabel className="text-emerald-900">Total Produtos</FormLabel>
                        <FormInput type="number" readOnly className="bg-emerald-100 border-emerald-200" {...register('valorTotalProdutos')} />
                    </div>
                    <div>
                        <FormLabel className="text-emerald-900 font-bold">TOTAL DA NOTA</FormLabel>
                        <FormInput type="number" readOnly className="bg-emerald-600 text-white font-bold border-transparent" {...register('valorTotalNota')} />
                    </div>
                </div>
                
                <div>
                    <FormLabel className="text-emerald-900">Observações da Nota</FormLabel>
                    <FormInput {...register('observacoes')} placeholder="Informações adicionais..." maxLength={500} />
                </div>
            </div>

            {carregandoListas && <p className="text-xs text-slate-400 text-center animate-pulse">Carregando informações base...</p>}

            </fieldset>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <Button type="submit" disabled={loading || !restoLiberado} className="px-8">
                    {loading ? "Salvando..." : "Gravar Nota de Entrada"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/notas-entrada")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}