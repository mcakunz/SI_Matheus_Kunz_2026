"use client"

import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, useWatch, Controller, Control, UseFormRegister, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { HiPlus, HiTrash } from "react-icons/hi"

import { salvarNotaEntrada, verificarChaveNotaEntradaExiste } from "../actions"
import {
    listarFornecedoresParaNota,
    listarTransportadorasParaNota,
    listarCondicoesParaNota,
    listarProdutosParaNota,
} from "../pesquisaActions"
import { listarParcelasPorCondicao } from "@/app/(financeiro)/condicoes-pagamento/actions"
import type {
    FornecedorPesquisa,
    TransportadoraPesquisa,
    CondicaoPesquisa,
    ProdutoPesquisa,
} from "../pesquisaTipos"
import {
    COLUNAS_FORNECEDOR, CAMPOS_FORNECEDOR,
    COLUNAS_TRANSPORTADORA, CAMPOS_TRANSPORTADORA,
    COLUNAS_CONDICAO, CAMPOS_CONDICAO,
    COLUNAS_PRODUTO, CAMPOS_PRODUTO,
} from "./pesquisaConfigs"

import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { PesquisaModal } from "@/components/ui/PesquisaModal"
import { CampoNumerico } from "@/components/ui/CampoNumerico"
import { mulDiv, r2, r6 } from "@/lib/utils/arredondamento"
import { ratearParcelas } from "@/lib/utils/parcelas"

import { FornecedorCampos } from "./FornecedorCampos"
import { TransportadoraCampos } from "./TransportadoraCampos"
import { CondicaoPagamentoLookup } from "@/app/components/ui/CondicaoPagamentoLookup"
import { ProdutoLookup } from "@/app/components/ui/ProdutoLookup"

import { ParcelaCondicao } from "@/lib/types"

// ---------------------------------------------------------------------------
// SCHEMA
// ---------------------------------------------------------------------------

const itemSchema = z.object({
    produtoId:          z.string().min(1, "Selecione um produto"),
    quantidade:         z.number().min(0.01, "Min. 0.01"),
    valorUnitario:      z.number().min(0, "Inválido"),
    // Total do item SEM desconto (quantidade x valor unitário). Calculado; não vai para o banco.
    valorTotalBruto:    z.number().min(0),
    // O desconto é UNITÁRIO: R$ de desconto por unidade e o percentual sobre o valor unitário
    // (os dois campos são sincronizados na tela).
    valorDescontoUnitario: z.number().min(0, "Inválido"),
    percentualDesconto: z.number().min(0, "Inválido").max(100, "Máx. 100%"),
    // Qual dos dois campos de desconto o usuário editou por último — é ele que manda no outro
    // quando a quantidade ou o valor unitário mudam. Não vai para o banco.
    origemDesconto:     z.enum(['valor', 'percentual']),
    // Desconto TOTAL do item (desconto unitário x quantidade). Calculado; é o que vai para o banco.
    valorDesconto:      z.number().min(0),
    // Total do item COM desconto (ainda sem rateio).
    valorTotal:         z.number().min(0),
    rateioFrete:        z.number().min(0),
    rateioSeguro:       z.number().min(0),
    rateioOutras:       z.number().min(0),
    // Custo final (por unidade, já com desconto e rateio de frete/seguro/outras despesas).
    custoPrecoFinal:    z.number().min(0),
}).refine((data) => r6(data.valorDescontoUnitario) <= r6(data.valorUnitario), {
    message: "O desconto unitário não pode ser maior que o valor unitário.",
    path: ["valorDescontoUnitario"],
})

const schema = z.object({
    numero:              z.string().min(1, "Número da NF é obrigatório").max(9, "Máx. 9 dígitos").regex(/^\d+$/, "O número da NF deve conter apenas dígitos."),
    modelo:              z.string().min(1, "Obrigatório").max(2),
    serie:               z.string().min(1, "Obrigatório").max(3),
    fornecedorId:        z.string().min(1, "Fornecedor é obrigatório"),
    transportadoraId:    z.string().optional().nullable(),
    condicaoPagamentoId: z.string().min(1, "Condição é obrigatória"),
    dataEmissao:         z.string().min(1, "Data de emissão é obrigatória"),
    dataEntrada:         z.string().min(1, "Data de entrada é obrigatória"),
    valorFrete:          z.number().min(0),
    valorSeguro:         z.number().min(0),
    outrasDespesas:      z.number().min(0),
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
type ItemFormValues = NotaFormValues['itens'][number]

// ---------------------------------------------------------------------------
// HELPERS DE NÚMERO
// ---------------------------------------------------------------------------

// Arredondamentos (r2 = reais, 2 casas; r6 = unitários, custo, rateios e percentuais, 6 casas)
// seguem a ABNT NBR 5891 — ver "@/lib/utils/arredondamento".

// Formata para exibição: sempre pelo menos `min` casas, até `max` (sem zeros inúteis além do mínimo).
function fmt(n: number, min = 2, max = min) {
    return (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max })
}
const fmtMoeda = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso: string) => iso.split('-').reverse().join('/')

// ---------------------------------------------------------------------------
// LAYOUT (grids via style inline — classes com colchetes do Tailwind não eram geradas neste projeto)
// ---------------------------------------------------------------------------

const DADOS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    // Modelo | Série | Nº NF | ID do fornecedor | Fornecedor | CPF/CNPJ
    gridTemplateColumns: '80px 80px 150px 84px minmax(0, 1fr) 200px',
    gap: '1rem',
}

const DATAS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '150px 150px',
    gap: '1rem',
}

// Ordem segue a conta do item, da esquerda para a direita:
// Produto | Und. | Qtd. | Val. Unit. | Total Itens (sem desc.) | Desc. Unit. R$ | Desc. Unit. % |
// Total c/ Desc. | Rateio | Custo Final (c/ desc. e rateio) | remover
const ITENS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    // Colunas flexíveis (fr) com um mínimo cada uma: a grade encolhe junto com o formulário em vez de
    // vazar para a direita. Soma dos mínimos ≈ 820px; o que sobrar é dividido proporcionalmente
    // (o Produto leva a maior fatia, para o nome caber).
    gridTemplateColumns: 'minmax(160px, 6fr) 36px minmax(48px, 1fr) minmax(64px, 1.3fr) minmax(68px, 1.4fr) minmax(64px, 1.3fr) minmax(52px, 1fr) minmax(68px, 1.4fr) minmax(60px, 1.2fr) minmax(72px, 1.5fr) 28px',
    gap: '0.375rem',
}

const FRETE_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    // ID | Transportadora | CPF/CNPJ | Frete | Seguro | Outras despesas (mesmo padrão do fornecedor)
    gridTemplateColumns: '84px minmax(0, 1fr) 200px 150px 150px 150px',
    gap: '1rem',
}

const FECHAMENTO_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
}

// Parcela, vencimento e valor ficam colados (colunas fixas e estreitas), a forma de pagamento sobra à direita.
const PARCELAS_GRID_STYLE: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '70px 120px 130px minmax(0, 1fr)',
    gap: '0.75rem',
}

const ITEM_VAZIO: ItemFormValues = {
    produtoId: '',
    quantidade: 1,
    valorUnitario: 0,
    valorTotalBruto: 0,
    valorDescontoUnitario: 0,
    percentualDesconto: 0,
    origemDesconto: 'valor',
    valorDesconto: 0,
    valorTotal: 0,
    rateioFrete: 0,
    rateioSeguro: 0,
    rateioOutras: 0,
    custoPrecoFinal: 0,
}

interface ParcelaGerada {
    numero: number
    dataVencimento: string // yyyy-mm-dd
    valor: number
    formaPagamentoId: number
    formaPagamento: string
}

type PesquisaAberta =
    | { tipo: 'fornecedor' | 'transportadora' | 'condicao' }
    | { tipo: 'produto'; linha: number }
    | null

// Campo só de leitura (valores calculados), alinhado à direita, com a mesma altura dos inputs.
const TONS_CAMPO_CALCULADO = {
    neutro:   'bg-slate-100 border-slate-200 font-semibold text-slate-700',
    verde:    'bg-emerald-100 border-emerald-200 font-semibold text-emerald-900',
    destaque: 'bg-emerald-600 border-transparent font-bold text-white',
}

function CampoCalculado({ children, tom = 'neutro', className = "", compacto = false }: { children: React.ReactNode, tom?: keyof typeof TONS_CAMPO_CALCULADO, className?: string, compacto?: boolean }) {
    return (
        <div
            style={{ minHeight: 42 }}
            className={`w-full min-w-0 flex items-center justify-end border rounded tabular-nums ${compacto ? 'px-1.5 text-xs' : 'px-2 text-sm'} ${TONS_CAMPO_CALCULADO[tom]} ${className}`}
        >
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------
// LINHA DE ITEM (componente próprio: usa useWatch por linha)
// ---------------------------------------------------------------------------
interface ItemRowProps {
    index: number
    control: Control<NotaFormValues>
    register: UseFormRegister<NotaFormValues>
    errors: FieldErrors<NotaFormValues>
    produtos: ProdutoPesquisa[]
    travado: boolean
    calcularTotais: () => void
    onProdutoSelecionado: (index: number, produtoId: string) => void
    onPesquisarProduto: (index: number) => void
    onEditarDescontoValor: (index: number) => void
    onEditarDescontoPercentual: (index: number) => void
    onRemover: () => void
}

function ItemRow({
    index, control, register, errors, produtos, travado,
    calcularTotais, onProdutoSelecionado, onPesquisarProduto,
    onEditarDescontoValor, onEditarDescontoPercentual, onRemover,
}: ItemRowProps) {
    const produtoIdSelecionado = useWatch({ control, name: `itens.${index}.produtoId` })
    const custoUnitario        = useWatch({ control, name: `itens.${index}.custoPrecoFinal` })
    const valorTotalBruto      = useWatch({ control, name: `itens.${index}.valorTotalBruto` })
    const valorTotalItem       = useWatch({ control, name: `itens.${index}.valorTotal` })
    const rateioFrete          = useWatch({ control, name: `itens.${index}.rateioFrete` })
    const rateioSeguro         = useWatch({ control, name: `itens.${index}.rateioSeguro` })
    const rateioOutras         = useWatch({ control, name: `itens.${index}.rateioOutras` })
    const rateioTotal          = r6((Number(rateioFrete) || 0) + (Number(rateioSeguro) || 0) + (Number(rateioOutras) || 0))
    const produtoSelecionado   = produtos.find(p => String(p.id) === produtoIdSelecionado)
    const erroItem             = errors.itens?.[index]

    return (
        <div style={ITENS_GRID_STYLE} className="items-start px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
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
                            error={erroItem?.produtoId?.message}
                            disabled={travado}
                            onPesquisar={() => onPesquisarProduto(index)}
                        />
                    )}
                />
            </div>

            {/* Unidade de medida do produto selecionado — só visualização, derivada do produto. */}
            <div
                style={{ height: 42 }}
                className="flex items-center justify-center border border-slate-200 rounded bg-slate-50 text-sm font-medium text-slate-600 overflow-hidden whitespace-nowrap"
                title={produtoSelecionado ? `Unidade: ${produtoSelecionado.unidadeMedida}` : undefined}
            >
                {produtoSelecionado ? produtoSelecionado.unidadeMedida : '-'}
            </div>

            <div>
                <Controller
                    name={`itens.${index}.quantidade`}
                    control={control}
                    render={({ field: f }) => (
                        <CampoNumerico
                            ariaLabel="Quantidade"
                            value={f.value}
                            onChange={(n) => { f.onChange(n); calcularTotais() }}
                            onBlur={f.onBlur}
                            casas={4} casasMinimas={0} maxInteiros={7}
                            disabled={travado}
                        />
                    )}
                />
                {erroItem?.quantidade && <p className="text-xs text-red-500 mt-1">{erroItem.quantidade.message}</p>}
            </div>

            <div>
                <Controller
                    name={`itens.${index}.valorUnitario`}
                    control={control}
                    render={({ field: f }) => (
                        <CampoNumerico
                            ariaLabel="Valor unitário"
                            value={f.value}
                            onChange={(n) => { f.onChange(n); calcularTotais() }}
                            onBlur={f.onBlur}
                            casas={6} casasMinimas={2} maxInteiros={7}
                            disabled={travado}
                        />
                    )}
                />
            </div>

            {/* Total dos itens SEM desconto: quantidade x valor unitário. Calculado, não editável. */}
            <CampoCalculado compacto>
                <span title="Quantidade x valor unitário, sem desconto">{fmt(valorTotalBruto, 2)}</span>
            </CampoCalculado>

            {/* Desconto por UNIDADE (R$ e %). O desconto total do item = desconto unitário x quantidade. */}
            <div>
                <Controller
                    name={`itens.${index}.valorDescontoUnitario`}
                    control={control}
                    render={({ field: f }) => (
                        <CampoNumerico
                            ariaLabel="Desconto unitário em reais"
                            value={f.value}
                            onChange={(n) => { f.onChange(n); onEditarDescontoValor(index) }}
                            onBlur={f.onBlur}
                            casas={6} casasMinimas={2} maxInteiros={7}
                            disabled={travado}
                        />
                    )}
                />
                {erroItem?.valorDescontoUnitario && (
                    <p className="text-xs text-red-500 mt-1">{erroItem.valorDescontoUnitario.message}</p>
                )}
            </div>

            <div>
                <Controller
                    name={`itens.${index}.percentualDesconto`}
                    control={control}
                    render={({ field: f }) => (
                        <CampoNumerico
                            ariaLabel="Desconto em percentual"
                            value={f.value}
                            onChange={(n) => { f.onChange(n); onEditarDescontoPercentual(index) }}
                            onBlur={f.onBlur}
                            casas={6} casasMinimas={2} maxInteiros={3}
                            disabled={travado}
                        />
                    )}
                />
                {erroItem?.percentualDesconto && (
                    <p className="text-xs text-red-500 mt-1">{erroItem.percentualDesconto.message}</p>
                )}
            </div>

            {/* Total do item COM desconto (ainda sem rateio). */}
            <CampoCalculado compacto>
                <span title="Total dos itens com o desconto aplicado (ainda sem rateio)">{fmt(valorTotalItem, 2)}</span>
            </CampoCalculado>

            {/* Parte deste item no frete, seguro e outras despesas da nota. */}
            <CampoCalculado compacto>
                <span title="Parte deste item no frete, seguro e outras despesas">{fmt(rateioTotal, 2, 6)}</span>
            </CampoCalculado>

            {/* Custo final: (total com desconto + rateio) ÷ quantidade. Calculado, não editável. */}
            <CampoCalculado compacto className="font-semibold">
                <span title="Já inclui desconto do produto e rateio de frete, seguro e outras despesas">
                    {fmt(custoUnitario, 2, 6)}
                </span>
            </CampoCalculado>

            <div style={{ minHeight: 42 }} className="flex justify-center items-center">
                <button
                    type="button"
                    onClick={onRemover}
                    disabled={travado}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                >
                    <HiTrash size={16} />
                </button>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// FORMULÁRIO
// ---------------------------------------------------------------------------
// Só lança notas novas: uma nota de entrada nunca é editada nem excluída, só cancelada (na listagem).
export function NotaEntradaForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Listas "ricas" (com CPF/CNPJ, referência, código de barras...) usadas tanto pelos
    // lookups quanto pelos modais de pesquisa.
    const [fornecedores, setFornecedores]       = useState<FornecedorPesquisa[]>([])
    const [transportadoras, setTransportadoras] = useState<TransportadoraPesquisa[]>([])
    const [condicoes, setCondicoes]             = useState<CondicaoPesquisa[]>([])
    const [produtos, setProdutos]               = useState<ProdutoPesquisa[]>([])
    const [carregandoListas, setCarregandoListas] = useState(true)
    const [pesquisa, setPesquisa]               = useState<PesquisaAberta>(null)

    useEffect(() => {
        Promise.all([
            listarFornecedoresParaNota(),
            listarTransportadorasParaNota(),
            listarCondicoesParaNota(),
            listarProdutosParaNota(),
        ]).then(([f, t, c, p]) => {
            setFornecedores(f)
            setTransportadoras(t)
            setCondicoes(c)
            setProdutos(p)
        }).catch(() => {
            toast.error("Não foi possível carregar as listas de apoio. Recarregue a página.")
        }).finally(() => setCarregandoListas(false))
    }, [])

    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm<NotaFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            numero:              '',
            modelo:              '55',
            serie:               '1',
            fornecedorId:        '',
            transportadoraId:    undefined,
            condicaoPagamentoId: '',
            dataEmissao:         '',
            dataEntrada:         '',
            valorFrete:          0,
            valorSeguro:         0,
            outrasDespesas:      0,
            valorDesconto:       0,
            valorTotalProdutos:  0,
            valorTotalNota:      0,
            observacoes:         '',
            situacao:            'LANCADA',
            itens:               [],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'itens' })

    // --- REGRA: CHAVE PRIMÁRIA DA NOTA (numero + modelo + serie + fornecedorId) ---
    const numeroAtual       = useWatch({ control, name: 'numero' })
    const modeloAtual       = useWatch({ control, name: 'modelo' })
    const serieAtual        = useWatch({ control, name: 'serie' })
    const fornecedorIdAtual = useWatch({ control, name: 'fornecedorId' })

    // Assim que existir pelo menos 1 produto na lista, a chave fica travada — só volta a ficar
    // editável se todos os produtos forem removidos da lista.
    const chaveBloqueada = fields.length > 0

    const chaveCompleta = Boolean(numeroAtual && modeloAtual && serieAtual && fornecedorIdAtual)
    const chaveAtualStr = chaveCompleta
        ? `${numeroAtual}|${modeloAtual}|${serieAtual}|${fornecedorIdAtual}`
        : null

    const [chaveLiberadaPara, setChaveLiberadaPara] = useState<string | null>(null)
    const [verificandoChave, setVerificandoChave] = useState(false)
    const [erroChave, setErroChave] = useState<string | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
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
    }, [chaveAtualStr, chaveCompleta])

    const outrasSecoesLiberadas = chaveAtualStr !== null && chaveAtualStr === chaveLiberadaPara

    // Cascata: Chave -> Datas -> Restante.
    const dataEmissaoAtual = useWatch({ control, name: 'dataEmissao' })
    const dataEntradaAtual = useWatch({ control, name: 'dataEntrada' })
    const datasCompletas = Boolean(dataEmissaoAtual && dataEntradaAtual)

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

    // --- PARCELAS GERADAS (travam produtos e despesas) ---
    // As parcelas deixaram de ser automáticas: o usuário clica em "Gerar parcelas" e, a partir
    // daí, produtos, desconto, frete, seguro e outras despesas ficam travados — qualquer um deles
    // mudaria o total da nota e deixaria as parcelas desatualizadas. "Desfazer parcelas" destrava.
    const [parcelasGeradas, setParcelasGeradas] = useState<ParcelaGerada[] | null>(null)
    const travado = parcelasGeradas !== null

    // --- MOTOR DE CÁLCULO ---
    // Por item: total sem desconto = qtd x unitário; o desconto é UNITÁRIO (R$ por unidade <->
    // percentual do valor unitário, sincronizados, mandando o campo editado por último);
    // desconto total = desconto unitário x qtd; total com desconto = total sem desconto - desconto total.
    // Frete, seguro e outras despesas são rateados entre os itens proporcionalmente ao total com
    // desconto (a diferença de centavos vai para o último item com valor). Custo final =
    // (total com desconto + rateios) / quantidade.
    // Todos os arredondamentos seguem a ABNT NBR 5891 (ver "@/lib/utils/arredondamento").
    const calcularTotais = useCallback(() => {
        const itensAtuais = getValues('itens') || []
        const frete  = Number(getValues('valorFrete')) || 0
        const seguro = Number(getValues('valorSeguro')) || 0
        const outras = Number(getValues('outrasDespesas')) || 0
        const descontoNota = Number(getValues('valorDesconto')) || 0

        const liquidos: number[] = []

        itensAtuais.forEach((item, index) => {
            const qtd  = Number(item.quantidade) || 0
            const unit = Number(item.valorUnitario) || 0
            const bruto = mulDiv(qtd, unit, 1, 2)

            let descontoUnitario: number
            if (item.origemDesconto === 'percentual') {
                const pct = Math.min(100, Number(item.percentualDesconto) || 0)
                descontoUnitario = mulDiv(unit, pct, 100, 6)
                setValue(`itens.${index}.valorDescontoUnitario`, descontoUnitario)
            } else {
                descontoUnitario = Number(item.valorDescontoUnitario) || 0
                const pct = unit > 0 ? mulDiv(descontoUnitario, 100, unit, 6) : 0
                setValue(`itens.${index}.percentualDesconto`, pct)
            }

            const descontoTotal = mulDiv(qtd, descontoUnitario, 1, 2)
            setValue(`itens.${index}.valorTotalBruto`, bruto)
            setValue(`itens.${index}.valorDesconto`, descontoTotal)

            // Desconto não pode deixar o total da linha negativo (o erro de validação avisa o usuário).
            liquidos.push(Math.max(0, r2(bruto - descontoTotal)))
        })

        const totProd = liquidos.reduce((acc, v) => acc + v, 0)

        const ratear = (total: number): number[] => {
            if (total <= 0 || totProd <= 0) return liquidos.map(() => 0)
            // Rateio com 6 casas (a precisão das colunas rateio* do banco): arredondar em centavos
            // aqui deslocava o custo final na 3ª/4ª casa em relação ao cálculo exato.
            const partes = liquidos.map(l => mulDiv(total, l, totProd, 6))
            const diferenca = r6(total - partes.reduce((acc, v) => acc + v, 0))
            if (diferenca !== 0) {
                let ultimo = -1
                liquidos.forEach((l, i) => { if (l > 0) ultimo = i })
                if (ultimo >= 0) partes[ultimo] = r6(partes[ultimo] + diferenca)
            }
            return partes
        }

        const rateioFrete  = ratear(frete)
        const rateioSeguro = ratear(seguro)
        const rateioOutras = ratear(outras)

        itensAtuais.forEach((item, index) => {
            const qtd = Number(item.quantidade) || 0
            const custoTotal = r6(liquidos[index] + rateioFrete[index] + rateioSeguro[index] + rateioOutras[index])

            setValue(`itens.${index}.valorTotal`, liquidos[index])
            setValue(`itens.${index}.rateioFrete`, rateioFrete[index])
            setValue(`itens.${index}.rateioSeguro`, rateioSeguro[index])
            setValue(`itens.${index}.rateioOutras`, rateioOutras[index])
            setValue(`itens.${index}.custoPrecoFinal`, qtd > 0 ? mulDiv(custoTotal, 1, qtd, 6) : 0)
        })

        setValue('valorTotalProdutos', r2(totProd))
        setValue('valorTotalNota', r2(totProd + frete + seguro + outras - descontoNota))
    }, [getValues, setValue])

    // Recalcula sempre que entra ou sai um produto (os rateios dependem de todos os itens).
    useEffect(() => {
        calcularTotais()
    }, [fields.length, calcularTotais])

    const aoEditarDescontoValor = useCallback((index: number) => {
        setValue(`itens.${index}.origemDesconto`, 'valor')
        calcularTotais()
    }, [setValue, calcularTotais])

    const aoEditarDescontoPercentual = useCallback((index: number) => {
        setValue(`itens.${index}.origemDesconto`, 'percentual')
        calcularTotais()
    }, [setValue, calcularTotais])

    // --- CONDIÇÃO DE PAGAMENTO (config de parcelas da condição escolhida) ---
    const condicaoPagamentoIdAtual = useWatch({ control, name: 'condicaoPagamentoId' })
    const valorTotalNotaAtual      = useWatch({ control, name: 'valorTotalNota' })
    const valorTotalProdutosAtual  = useWatch({ control, name: 'valorTotalProdutos' })
    const valorFreteAtual          = useWatch({ control, name: 'valorFrete' })
    const valorSeguroAtual         = useWatch({ control, name: 'valorSeguro' })
    const outrasDespesasAtual      = useWatch({ control, name: 'outrasDespesas' })

    const [parcelasCondicao, setParcelasCondicao] = useState<ParcelaCondicao[]>([])
    // Muda quando a condição é editada pelo modal de pesquisa, para recarregar as parcelas dela.
    const [versaoCondicoes, setVersaoCondicoes] = useState(0)
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
    }, [condicaoPagamentoIdAtual, versaoCondicoes])

    // Vencimento de cada parcela = Data de Emissão + "dias" daquela parcela (não é cumulativo).
    // Valor = parte do Total da Nota; o resto de centavos vai para uma única parcela para a soma
    // bater exatamente com o total.
    const gerarParcelas = () => {
        const itensAtuais = getValues('itens') || []

        if (itensAtuais.length === 0) {
            toast.error("Adicione ao menos um produto antes de gerar as parcelas.")
            return
        }
        if (itensAtuais.some(i => !i.produtoId || !(Number(i.quantidade) > 0))) {
            toast.error("Preencha o produto e a quantidade de todos os itens antes de gerar as parcelas.")
            return
        }
        if (itensAtuais.some(i => r6(Number(i.valorDescontoUnitario) || 0) > r6(Number(i.valorUnitario) || 0))) {
            toast.error("Há produto com desconto unitário maior que o valor unitário. Corrija antes de gerar as parcelas.")
            return
        }
        if (!condicaoPagamentoIdAtual) {
            toast.error("Selecione a condição de pagamento.")
            return
        }
        if (parcelasCondicao.length === 0) {
            toast.error("A condição de pagamento escolhida não tem parcelas configuradas.")
            return
        }

        calcularTotais()
        const totalNota = Number(getValues('valorTotalNota')) || 0
        if (totalNota <= 0) {
            toast.error("O total da nota precisa ser maior que zero para gerar as parcelas.")
            return
        }

        // Parcelas iguais quando os percentuais são iguais (33,34/33,33/33,33 conta como igual);
        // o resto dos centavos fica numa parcela só. Ver "@/lib/utils/parcelas".
        const valores = ratearParcelas(totalNota, parcelasCondicao.map(p => Number(p.percentual)))

        setParcelasGeradas(parcelasCondicao.map((p, i) => {
            // Em UTC para o fuso do navegador não deslocar o dia.
            const venc = new Date(`${dataEmissaoAtual}T00:00:00Z`)
            venc.setUTCDate(venc.getUTCDate() + Number(p.dias))
            return {
                numero: p.numero,
                dataVencimento: venc.toISOString().slice(0, 10),
                valor: valores[i],
                formaPagamentoId: p.formaPagamentoId,
                formaPagamento: p.formaPagamento,
            }
        }))
    }

    const desfazerParcelas = () => setParcelasGeradas(null)

    // --- SELEÇÕES (lookup ou modal de pesquisa) ---
    // Ao escolher o fornecedor, a condição de pagamento padrão dele já vem preenchida
    // (se estiver ativa e ainda não houver parcelas geradas).
    const selecionarFornecedor = useCallback((id: string, lista: FornecedorPesquisa[] = fornecedores, listaCondicoes: CondicaoPesquisa[] = condicoes) => {
        setValue('fornecedorId', id, { shouldValidate: true })
        const f = lista.find(x => String(x.id) === id)
        if (f?.condicaoPagamentoId && listaCondicoes.some(c => c.id === f.condicaoPagamentoId)) {
            setValue('condicaoPagamentoId', String(f.condicaoPagamentoId), { shouldValidate: true })
        }
    }, [fornecedores, condicoes, setValue])

    const preencherValorDoProduto = useCallback((index: number, produtoId: string, lista: ProdutoPesquisa[] = produtos) => {
        const produto = lista.find(p => String(p.id) === produtoId)
        if (!produto) return
        // Ponto de partida: o custo cadastrado. Continua editável (o preço negociado pode ser outro).
        setValue(`itens.${index}.valorUnitario`, Number(produto.valorCompra) || 0)
        calcularTotais()
    }, [produtos, setValue, calcularTotais])

    // Depois de cadastrar pelo modal de pesquisa, recarrega a lista (para trazer CPF/CNPJ,
    // referência etc. do registro novo) e já seleciona o item criado.
    const aoCadastrarFornecedor = useCallback(async (novo: { id: number }) => {
        try {
            const lista = await listarFornecedoresParaNota()
            setFornecedores(lista)
            selecionarFornecedor(String(novo.id), lista)
        } catch {
            toast.error("Fornecedor cadastrado, mas não foi possível atualizar a lista. Recarregue a página.")
        }
    }, [selecionarFornecedor])

    const aoCadastrarTransportadora = useCallback(async (novo: { id: number }) => {
        try {
            setTransportadoras(await listarTransportadorasParaNota())
            setValue('transportadoraId', String(novo.id))
        } catch {
            toast.error("Transportadora cadastrada, mas não foi possível atualizar a lista. Recarregue a página.")
        }
    }, [setValue])

    const aoCadastrarCondicao = useCallback(async (novo: { id: number }) => {
        try {
            setCondicoes(await listarCondicoesParaNota())
            setValue('condicaoPagamentoId', String(novo.id), { shouldValidate: true })
        } catch {
            toast.error("Condição cadastrada, mas não foi possível atualizar a lista. Recarregue a página.")
        }
    }, [setValue])

    const aoCadastrarProduto = useCallback(async (novo: { id: number }, linha: number) => {
        try {
            const lista = await listarProdutosParaNota()
            setProdutos(lista)
            setValue(`itens.${linha}.produtoId`, String(novo.id), { shouldValidate: true })
            preencherValorDoProduto(linha, String(novo.id), lista)
        } catch {
            toast.error("Produto cadastrado, mas não foi possível atualizar a lista. Recarregue a página.")
        }
    }, [setValue, preencherValorDoProduto])

    // Edição pelo lápis do modal de pesquisa: só recarrega a lista (o que já está escolhido na nota
    // continua igual; valores digitados nos itens não são mexidos).
    const aoEditarFornecedor = useCallback(async () => {
        try { setFornecedores(await listarFornecedoresParaNota()) }
        catch { toast.error("Fornecedor salvo, mas não foi possível atualizar a lista. Recarregue a página.") }
    }, [])

    const aoEditarTransportadora = useCallback(async () => {
        try { setTransportadoras(await listarTransportadorasParaNota()) }
        catch { toast.error("Transportadora salva, mas não foi possível atualizar a lista. Recarregue a página.") }
    }, [])

    const aoEditarCondicao = useCallback(async () => {
        try {
            setCondicoes(await listarCondicoesParaNota())
            // Força recarregar as parcelas da condição escolhida (podem ter mudado na edição).
            setVersaoCondicoes(v => v + 1)
        } catch {
            toast.error("Condição salva, mas não foi possível atualizar a lista. Recarregue a página.")
        }
    }, [])

    const aoEditarProduto = useCallback(async () => {
        try { setProdutos(await listarProdutosParaNota()) }
        catch { toast.error("Produto salvo, mas não foi possível atualizar a lista. Recarregue a página.") }
    }, [])

    const fecharPesquisa = useCallback(() => setPesquisa(null), [])

    const onSubmit = async (data: NotaFormValues) => {
        if (!parcelasGeradas) {
            toast.error("Gere as parcelas da condição de pagamento antes de gravar a nota.")
            return
        }

        setLoading(true)
        const formPayload = new FormData()

        const { itens, ...scalar } = data
        Object.entries(scalar).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formPayload.append(key, String(value))
        })

        formPayload.append('itens', JSON.stringify(itens))
        // Forma de pagamento da nota = a da primeira parcela (antes era fixa em 1).
        formPayload.append('formaPagamentoId', String(parcelasGeradas[0].formaPagamentoId))
        // As parcelas já seguem no envio; a action ainda não as grava (ver observações da entrega).
        formPayload.append('parcelas', JSON.stringify(parcelasGeradas))

        try {
            await salvarNotaEntrada(formPayload)
            toast.success("Nota de entrada lançada com sucesso!")
            router.push("/notas-entrada")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof NotaFormValues }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{(errors[campo] as any)?.message}</p> : null

    const somaParcelas = parcelasGeradas ? r2(parcelasGeradas.reduce((acc, p) => acc + p.valor, 0)) : 0

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 text-slate-900">

            {/* A situação não é escolhida ao lançar a nota — nasce como LANCADA e só
                muda pra CANCELADA através da ação "Cancelar" na listagem. Campo oculto só para
                reenviar o valor atual. */}
            <input type="hidden" {...register('situacao')} />

            {/* Desconto geral da nota não existe na tela (desconto é por produto). Campo oculto, sempre 0,
                mantido porque a coluna existe em tb_notas_entrada. */}
            <input type="hidden" {...register('valorDesconto', { valueAsNumber: true })} />

            {/* --- DADOS DA NOTA (chave: modelo + série + número + fornecedor) --- */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados da Nota</h2>

                <div style={DADOS_GRID_STYLE} className="items-start">
                    <div>
                        <FormLabel required>Modelo</FormLabel>
                        <FormInput {...register('modelo')} disabled={chaveBloqueada} placeholder="55" maxLength={2} />
                        <Erro campo="modelo" />
                    </div>
                    <div>
                        <FormLabel required>Série</FormLabel>
                        <FormInput {...register('serie')} disabled={chaveBloqueada} placeholder="1" maxLength={3} />
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
                            placeholder="000123"
                            maxLength={9}
                            inputMode="numeric"
                        />
                        <Erro campo="numero" />
                    </div>
                    {/* ID, Fornecedor e CPF/CNPJ: digitar o ID ou o documento já seleciona o fornecedor. */}
                    <Controller
                        name="fornecedorId"
                        control={control}
                        render={({ field }) => (
                            <FornecedorCampos
                                fornecedores={fornecedores}
                                value={field.value}
                                onChange={(id) => {
                                    field.onChange(id)
                                    if (id) selecionarFornecedor(id)
                                }}
                                error={errors.fornecedorId?.message}
                                disabled={chaveBloqueada}
                                onPesquisar={() => setPesquisa({ tipo: 'fornecedor' })}
                            />
                        )}
                    />
                </div>

                {chaveBloqueada && (
                    <p className="text-xs text-amber-600">
                        Para alterar número, modelo, série, fornecedor ou as datas, remova todos os produtos da lista abaixo primeiro.
                    </p>
                )}

                {chaveCompleta && (
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

                {/* Datas: continuam travadas até a chave acima ser conferida. */}
                <fieldset
                    disabled={!outrasSecoesLiberadas || chaveBloqueada}
                    style={DATAS_GRID_STYLE}
                    className="pt-4 border-t border-slate-200 disabled:opacity-50"
                >
                    <div>
                        <FormLabel required>Emissão</FormLabel>
                        <FormInput type="date" {...register('dataEmissao')} />
                        <Erro campo="dataEmissao" />
                    </div>
                    <div>
                        <FormLabel required>Entrada</FormLabel>
                        <FormInput type="date" {...register('dataEntrada')} />
                        {erroDatas ? (
                            <p className="text-xs text-red-500 mt-1">{erroDatas}</p>
                        ) : (
                            <Erro campo="dataEntrada" />
                        )}
                    </div>
                </fieldset>

                {outrasSecoesLiberadas && !datasCompletas && (
                    <p className="text-xs text-amber-600">
                        Preencha as datas de emissão e entrada para liberar o restante da nota.
                    </p>
                )}

                {outrasSecoesLiberadas && datasCompletas && erroDatas && (
                    <p className="text-xs text-red-500 font-medium">
                        Corrija as datas acima para liberar o restante da nota.
                    </p>
                )}
            </div>

            {/* --- RESTANTE DO FORMULÁRIO (só libera com chave livre e datas válidas) --- */}
            <fieldset disabled={!restoLiberado} className="flex flex-col gap-6 min-w-0 disabled:opacity-50">

                {/* --- PRODUTOS --- */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Produtos</h2>
                        <button
                            type="button"
                            disabled={travado}
                            onClick={() => append(ITEM_VAZIO)}
                            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <HiPlus size={14} /> Adicionar Produto
                        </button>
                    </div>

                    {travado && (
                        <p className="text-xs text-amber-600 mb-2">
                            Parcelas geradas: produtos, frete, seguro e outras despesas estão travados. Para alterá-los, desfaça as parcelas na seção Condição de Pagamento.
                        </p>
                    )}

                    {errors.itens?.message && <p className="text-xs text-red-500 mb-2">{errors.itens.message}</p>}
                    {errors.itens?.root && <p className="text-xs text-red-500 mb-2">{errors.itens.root.message}</p>}

                    {/* Sem "overflow-hidden" aqui: ele cortaria o dropdown (position:absolute) dos lookups. */}
                    <div className="border border-slate-200 rounded-lg">
                        <div
                            style={ITENS_GRID_STYLE}
                            className="bg-slate-100 rounded-t-lg px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600 leading-tight items-end"
                        >
                            <span>Produto</span>
                            <span>Und.</span>
                            <span className="text-right">Qtd.</span>
                            <span className="text-right">Val. Unitário</span>
                            <span className="text-right" title="Quantidade x valor unitário, sem desconto">Total Itens</span>
                            <span className="text-right" title="Desconto por unidade, em reais">Desc. Unit. (R$)</span>
                            <span className="text-right" title="Desconto por unidade, em % do valor unitário">Desc. Unit. (%)</span>
                            <span className="text-right" title="Total dos itens já com o desconto (ainda sem rateio)">Total c/ Desc.</span>
                            <span className="text-right" title="Parte do item no frete, seguro e outras despesas">Rateio</span>
                            <span className="text-right" title="Custo de cada unidade já com desconto e rateio de frete, seguro e outras despesas">Custo Final</span>
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
                                        travado={travado}
                                        calcularTotais={calcularTotais}
                                        onProdutoSelecionado={(i, id) => preencherValorDoProduto(i, id)}
                                        onPesquisarProduto={(i) => setPesquisa({ tipo: 'produto', linha: i })}
                                        onEditarDescontoValor={aoEditarDescontoValor}
                                        onEditarDescontoPercentual={aoEditarDescontoPercentual}
                                        onRemover={() => remove(index)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Total dos produtos logo abaixo da lista, na altura da coluna "Total Item". */}
                        <div className="flex items-center justify-end gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                            <span className="text-sm font-semibold text-slate-600">Total dos produtos</span>
                            <span style={{ minWidth: 120 }} className="text-base font-bold text-emerald-700 tabular-nums text-right">
                                {fmtMoeda(valorTotalProdutosAtual)}
                            </span>
                            <span style={{ width: 28 }} />
                        </div>
                    </div>
                </div>

                {/* --- FRETE E TRANSPORTADORA --- */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-5">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Frete e Transportadora</h2>

                    <div style={FRETE_GRID_STYLE} className="items-start">
                        {/* ID, Transportadora e CPF/CNPJ: digitar o ID ou o documento já seleciona a transportadora. */}
                        <Controller
                            name="transportadoraId"
                            control={control}
                            render={({ field }) => (
                                <TransportadoraCampos
                                    transportadoras={transportadoras}
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    onPesquisar={() => setPesquisa({ tipo: 'transportadora' })}
                                />
                            )}
                        />
                        <div>
                            <FormLabel>Valor Frete</FormLabel>
                            <Controller
                                name="valorFrete"
                                control={control}
                                render={({ field: f }) => (
                                    <CampoNumerico
                                        ariaLabel="Valor frete"
                                        value={f.value}
                                        onChange={(n) => { f.onChange(n); calcularTotais() }}
                                        onBlur={f.onBlur}
                                        casas={2} casasMinimas={2} maxInteiros={9}
                                        disabled={travado}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <FormLabel>Valor Seguro</FormLabel>
                            <Controller
                                name="valorSeguro"
                                control={control}
                                render={({ field: f }) => (
                                    <CampoNumerico
                                        ariaLabel="Valor seguro"
                                        value={f.value}
                                        onChange={(n) => { f.onChange(n); calcularTotais() }}
                                        onBlur={f.onBlur}
                                        casas={2} casasMinimas={2} maxInteiros={9}
                                        disabled={travado}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <FormLabel>Outras Despesas</FormLabel>
                            <Controller
                                name="outrasDespesas"
                                control={control}
                                render={({ field: f }) => (
                                    <CampoNumerico
                                        ariaLabel="Outras despesas"
                                        value={f.value}
                                        onChange={(n) => { f.onChange(n); calcularTotais() }}
                                        onBlur={f.onBlur}
                                        casas={2} casasMinimas={2} maxInteiros={9}
                                        disabled={travado}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Frete, seguro e outras despesas são rateados entre os produtos, proporcionalmente ao valor de cada um, e entram no custo final.
                    </p>
                </div>

                {/* --- FECHAMENTO (antes da condição de pagamento) --- */}
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-lg flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Fechamento</h2>

                    <div style={FECHAMENTO_GRID_STYLE} className="items-end">
                        <div>
                            <FormLabel className="text-emerald-900">Total Produtos</FormLabel>
                            <CampoCalculado tom="verde">{fmtMoeda(valorTotalProdutosAtual)}</CampoCalculado>
                        </div>
                        <div>
                            <FormLabel className="text-emerald-900">Frete</FormLabel>
                            <CampoCalculado tom="verde">{fmtMoeda(valorFreteAtual)}</CampoCalculado>
                        </div>
                        <div>
                            <FormLabel className="text-emerald-900">Seguro</FormLabel>
                            <CampoCalculado tom="verde">{fmtMoeda(valorSeguroAtual)}</CampoCalculado>
                        </div>
                        <div>
                            <FormLabel className="text-emerald-900">Outras Despesas</FormLabel>
                            <CampoCalculado tom="verde">{fmtMoeda(outrasDespesasAtual)}</CampoCalculado>
                        </div>
                        <div>
                            <FormLabel className="text-emerald-900 font-bold">TOTAL DA NOTA</FormLabel>
                            <CampoCalculado tom="destaque">{fmtMoeda(valorTotalNotaAtual)}</CampoCalculado>
                        </div>
                    </div>

                    <div>
                        <FormLabel className="text-emerald-900">Observações da Nota</FormLabel>
                        <FormInput {...register('observacoes')} placeholder="Informações adicionais..." maxLength={500} />
                    </div>
                </div>

                {/* --- CONDIÇÃO DE PAGAMENTO --- */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-5">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Condição de Pagamento</h2>

                    <div className="flex flex-wrap items-end gap-3">
                        <div className="w-full max-w-md">
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
                                        disabled={travado}
                                        onPesquisar={() => setPesquisa({ tipo: 'condicao' })}
                                    />
                                )}
                            />
                        </div>

                        {travado ? (
                            <button
                                type="button"
                                onClick={desfazerParcelas}
                                className="px-4 py-2 text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-md transition-colors"
                            >
                                Desfazer parcelas
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={gerarParcelas}
                                disabled={!condicaoPagamentoIdAtual || carregandoParcelas}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Gerar parcelas
                            </button>
                        )}
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        {parcelasGeradas ? (
                            <>
                                <div style={PARCELAS_GRID_STYLE} className="px-1 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    <span>Parcela</span>
                                    <span>Vencimento</span>
                                    <span className="text-right">Valor</span>
                                    <span>Forma de pagamento</span>
                                </div>
                                <div className="flex flex-col">
                                    {parcelasGeradas.map(p => (
                                        <div
                                            key={p.numero}
                                            style={PARCELAS_GRID_STYLE}
                                            className="items-center px-1 py-2 border-t border-slate-100 first:border-0 text-sm"
                                        >
                                            <span className="font-medium text-slate-600">{p.numero}</span>
                                            <span className="text-slate-600">{fmtData(p.dataVencimento)}</span>
                                            <span className="text-right font-medium text-slate-800 tabular-nums">{fmtMoeda(p.valor)}</span>
                                            <span className="text-slate-500 truncate">{p.formaPagamento}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={PARCELAS_GRID_STYLE} className="items-center px-1 pt-2 mt-1 border-t border-slate-200 text-sm font-semibold text-slate-700">
                                    <span>Total</span>
                                    <span></span>
                                    <span className="text-right tabular-nums">{fmtMoeda(somaParcelas)}</span>
                                    <span></span>
                                </div>
                            </>
                        ) : carregandoParcelas ? (
                            <p className="text-xs text-slate-400 py-2">Carregando parcelas da condição...</p>
                        ) : condicaoPagamentoIdAtual && parcelasCondicao.length === 0 ? (
                            <p className="text-xs text-amber-600 py-2">
                                A condição de pagamento escolhida não tem parcelas configuradas.
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 py-2">
                                {condicaoPagamentoIdAtual
                                    ? `Condição com ${parcelasCondicao.length} parcela(s). Confira o total da nota e clique em "Gerar parcelas".`
                                    : "Escolha a condição de pagamento e clique em \"Gerar parcelas\"."}
                            </p>
                        )}
                    </div>
                </div>

                {carregandoListas && <p className="text-xs text-slate-400 text-center animate-pulse">Carregando informações base...</p>}

            </fieldset>

            {/* --- MODAIS DE PESQUISA (fora dos fieldsets, para nunca ficarem desabilitados) --- */}
            <PesquisaModal
                isOpen={pesquisa?.tipo === 'fornecedor'}
                onClose={fecharPesquisa}
                titulo="Pesquisar fornecedor"
                maxWidth="max-w-6xl"
                itens={fornecedores}
                colunas={COLUNAS_FORNECEDOR}
                campos={CAMPOS_FORNECEDOR}
                placeholderBusca="Nome, apelido, CPF/CNPJ ou ID..."
                onSelecionar={(f) => selecionarFornecedor(String(f.id))}
                tipoCadastro="fornecedor"
                rotuloCadastro="Cadastrar novo fornecedor"
                onEditado={aoEditarFornecedor}
                onCadastrado={aoCadastrarFornecedor}
            />

            <PesquisaModal
                isOpen={pesquisa?.tipo === 'transportadora'}
                onClose={fecharPesquisa}
                titulo="Pesquisar transportadora"
                maxWidth="max-w-6xl"
                itens={transportadoras}
                colunas={COLUNAS_TRANSPORTADORA}
                campos={CAMPOS_TRANSPORTADORA}
                placeholderBusca="Razão social, nome fantasia, CNPJ ou ID..."
                onSelecionar={(t) => setValue('transportadoraId', String(t.id))}
                tipoCadastro="transportadora"
                rotuloCadastro="Cadastrar nova transportadora"
                onEditado={aoEditarTransportadora}
                onCadastrado={aoCadastrarTransportadora}
            />

            <PesquisaModal
                isOpen={pesquisa?.tipo === 'condicao'}
                onClose={fecharPesquisa}
                titulo="Pesquisar condição de pagamento"
                itens={condicoes}
                colunas={COLUNAS_CONDICAO}
                campos={CAMPOS_CONDICAO}
                maxWidth="max-w-4xl"
                placeholderBusca="Nome ou ID..."
                onSelecionar={(c) => setValue('condicaoPagamentoId', String(c.id), { shouldValidate: true })}
                tipoCadastro="condicaoPagamento"
                rotuloCadastro="Cadastrar nova condição"
                onEditado={aoEditarCondicao}
                onCadastrado={aoCadastrarCondicao}
            />

            <PesquisaModal
                isOpen={pesquisa?.tipo === 'produto'}
                onClose={fecharPesquisa}
                titulo="Pesquisar produto"
                itens={produtos}
                colunas={COLUNAS_PRODUTO}
                campos={CAMPOS_PRODUTO}
                maxWidth="max-w-6xl"
                placeholderBusca="Nome, referência, código de barras ou ID..."
                onSelecionar={(p) => {
                    if (pesquisa?.tipo !== 'produto') return
                    setValue(`itens.${pesquisa.linha}.produtoId`, String(p.id), { shouldValidate: true })
                    preencherValorDoProduto(pesquisa.linha, String(p.id))
                }}
                tipoCadastro="produto"
                rotuloCadastro="Cadastrar novo produto"
                onEditado={aoEditarProduto}
                onCadastrado={(novo) => {
                    if (pesquisa?.tipo === 'produto') aoCadastrarProduto(novo, pesquisa.linha)
                }}
            />

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