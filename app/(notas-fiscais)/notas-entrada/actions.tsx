"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { PoolClient } from "pg"
import { nullableString, parseJsonField } from "@/lib/utils/helpers"
import { NotaEntradaView } from "@/lib/types"
import { mulDiv, r4, r6 } from "@/lib/utils/arredondamento"
import { recalcularCustoMedio } from "@/lib/utils/custoMedio"

// ---------------------------------------------------------------------------
// ESTOQUE
// A nota de entrada mexe em tb_produtos.quantidade:
//   • lançar a nota        -> soma a quantidade de cada item
//   • cancelar a nota      -> desfaz a soma (se ainda houver estoque suficiente para isso)
// A nota nunca é editada nem excluída depois de lançada — só cancelada.
// O mesmo movimento atualiza tb_produtos."custoMedio" (custo médio ponderado):
//   custoMedio = ((saldo x custoMedioAtual) + (qtdEntrada x custoFinal)) / (saldo + qtdEntrada)
// onde saldo/custoMedioAtual são do produto e qtdEntrada/custoFinal ("custoPrecoFinal", já com
// desconto e rateios) são do item da nota. Estornos fazem a conta inversa. Ver "@/lib/utils/custoMedio".
// Tudo roda dentro da mesma transação da nota: se o estoque não puder ser ajustado, a nota também
// não é gravada/cancelada.
// ---------------------------------------------------------------------------

// Erros de regra de negócio (mensagem já pronta para o usuário). Passam direto, sem
// serem reescritos pelo tratarErroDB, que é pensado para erros do banco.
class ErroNegocio extends Error {}

interface MovimentoEstoque {
    produtoId: number
    quantidade: number // positivo = entra no estoque, negativo = sai
    // Custo final do item da nota ("custoPrecoFinal", por unidade). Sem ele (item antigo, de antes do custo
    // médio existir) o movimento entra/sai ao custo médio atual do produto, que não altera a média.
    custoUnitario?: number | null
}

interface MovimentoConsolidado {
    produtoId: number
    quantidade: number          // variação líquida do estoque
    valorComCusto: number       // soma de (quantidade x custo) dos movimentos que têm custo
    quantidadeSemCusto: number  // quantidade líquida dos movimentos sem custo
}

// Junta linhas repetidas do mesmo produto (a nota pode ter o mesmo produto em mais de uma linha)
// e soma entradas com saídas, resultando na variação líquida de quantidade e de valor de cada produto.
function consolidarMovimentos(movimentos: MovimentoEstoque[]): MovimentoConsolidado[] {
    const porProduto = new Map<number, MovimentoConsolidado>()
    for (const m of movimentos) {
        const atual = porProduto.get(m.produtoId)
            ?? { produtoId: m.produtoId, quantidade: 0, valorComCusto: 0, quantidadeSemCusto: 0 }
        const q = Number(m.quantidade)
        atual.quantidade += q
        if (m.custoUnitario === null || m.custoUnitario === undefined) {
            atual.quantidadeSemCusto += q
        } else {
            atual.valorComCusto += mulDiv(q, Number(m.custoUnitario), 1, 6)
        }
        porProduto.set(m.produtoId, atual)
    }
    return Array.from(porProduto.values())
        .map(m => ({
            ...m,
            quantidade: r4(m.quantidade),
            valorComCusto: r6(m.valorComCusto),
            quantidadeSemCusto: r4(m.quantidadeSemCusto),
        }))
        // Quantidade zerada mas valor diferente de zero (editou só o custo) ainda muda a média.
        .filter(m => m.quantidade !== 0 || m.valorComCusto !== 0)
        .sort((a, b) => a.produtoId - b.produtoId) // ordem fixa evita deadlock entre notas simultâneas
}

async function estoqueGuardaSoInteiros(client: PoolClient): Promise<boolean> {
    const r = await client.query<{ data_type: string }>(
        `SELECT data_type FROM information_schema.columns
         WHERE table_schema = current_schema() AND table_name = 'tb_produtos' AND column_name = 'quantidade'`
    )
    return ['smallint', 'integer', 'bigint'].includes(r.rows[0]?.data_type)
}

async function ajustarEstoque(client: PoolClient, movimentos: MovimentoEstoque[]) {
    const lista = consolidarMovimentos(movimentos)
    if (lista.length === 0) return

    // Se a coluna de estoque for inteira, o Postgres arredondaria 2,5 para 3 em silêncio.
    // Melhor recusar do que gravar um estoque errado.
    if (lista.some(m => !Number.isInteger(m.quantidade)) && await estoqueGuardaSoInteiros(client)) {
        throw new ErroNegocio(
            "O estoque dos produtos só aceita quantidades inteiras, mas esta nota tem quantidade fracionada. " +
            "Ajuste a quantidade ou altere a coluna tb_produtos.quantidade para numeric."
        )
    }

    for (const m of lista) {
        // FOR UPDATE: trava o produto até o COMMIT, então duas telas não calculam saldo nem custo
        // médio em cima do mesmo valor antigo e o estoque não fica negativo por corrida.
        const res = await client.query<{ produto: string; quantidade: string; custoMedio: string }>(
            `SELECT produto, quantidade, "custoMedio" FROM tb_produtos WHERE id = $1 FOR UPDATE`,
            [m.produtoId]
        )
        if (res.rowCount === 0) throw new ErroNegocio(`Produto ${m.produtoId} não encontrado ao atualizar o estoque.`)

        const p = res.rows[0]
        const saldo = Number(p.quantidade)
        const custoAtual = Number(p.custoMedio)
        const novoSaldo = r4(saldo + m.quantidade)

        if (novoSaldo < 0) {
            throw new ErroNegocio(
                `Estoque insuficiente de "${p.produto}": é preciso retirar ${Math.abs(m.quantidade)} da nota, ` +
                `mas há só ${saldo} em estoque (parte já foi vendida ou baixada).`
            )
        }

        // Movimentos sem custo entram/saem ao custo médio atual (não mexem na média).
        const variacaoValor = r6(m.valorComCusto + mulDiv(m.quantidadeSemCusto, custoAtual, 1, 6))
        const novoCusto = recalcularCustoMedio(saldo, custoAtual, m.quantidade, variacaoValor)

        await client.query(
            `UPDATE tb_produtos SET quantidade = $1, "custoMedio" = $2 WHERE id = $3`,
            [novoSaldo, novoCusto, m.produtoId]
        )
    }
}

async function carregarItensDaNota(client: PoolClient, numero: string, modelo: string, serie: string, fornecedorId: number): Promise<MovimentoEstoque[]> {
    const r = await client.query<{ produtoId: number; quantidade: string; custoPrecoFinal: string | null }>(
        `SELECT "produtoId", quantidade, "custoPrecoFinal" FROM tb_produtos_nota_entrada
         WHERE "notaNumero" = $1 AND "notaModelo" = $2 AND "notaSerie" = $3 AND "fornecedorId" = $4`,
        [numero, modelo, serie, fornecedorId]
    )
    return r.rows.map(i => ({
        produtoId: i.produtoId,
        quantidade: Number(i.quantidade),
        custoUnitario: i.custoPrecoFinal === null ? null : Number(i.custoPrecoFinal),
    }))
}

const inverter = (movs: MovimentoEstoque[]): MovimentoEstoque[] =>
    movs.map(m => ({ ...m, quantidade: -m.quantidade }))

const NOTA_ENTRADA_ERROR_LABELS: DBErrorLabels = {
    unique: {
        tb_notas_entrada_pkey: "Já existe uma nota fiscal com este número, modelo e série para este fornecedor.",
    },
    // Ao gravar, uma FK só falha se algum cadastro escolhido na nota deixou de existir.
    foreignKey: "Algum cadastro usado na nota (fornecedor, produto, condição de pagamento ou transportadora) não existe mais. Recarregue a página e tente de novo.",
}

const itemNotaEntradaSchema = z.object({
    id:            z.number().optional(),
    produtoId:     z.coerce.number().int().positive("Selecione um produto válido."),
    sequencia:     z.coerce.number().int().positive().default(1),
    quantidade:    z.coerce.number().min(0.01, "A quantidade deve ser maior que zero."),
    valorUnitario: z.coerce.number().min(0, "O valor unitário não pode ser negativo."),
    // Desconto TOTAL do item (desconto unitário x quantidade). O formulário calcula e envia pronto.
    valorDesconto: z.coerce.number().min(0).default(0),
    // O formulário envia o percentual junto (desconto em R$ e em % são sincronizados na tela).
    // Se vier ausente, é derivado do valor no momento de gravar (ver mais abaixo).
    percentualDesconto: z.coerce.number().min(0).max(100).optional(),
    valorTotal:    z.coerce.number().min(0),
    rateioFrete:   z.coerce.number().min(0).default(0),
    rateioSeguro:  z.coerce.number().min(0).default(0),
    rateioOutras:  z.coerce.number().min(0).default(0),
    // Custo final (por unidade): (total do item + rateios de frete/seguro/outras) / quantidade.
    custoPrecoFinal: z.coerce.number().min(0).default(0),
})

const notaEntradaSchema = z.object({
    numero:              z.string().min(1, "O número da NF é obrigatório.").max(9, "O número da NF pode ter no máximo 9 dígitos."),
    modelo:              z.string().min(1).max(2),
    serie:               z.string().min(1).max(3),
    fornecedorId:        z.coerce.number().int().positive("Selecione um fornecedor."),
    condicaoPagamentoId: z.coerce.number().int().positive("Selecione uma condição de pagamento."),
    formaPagamentoId:    z.coerce.number().int().positive("Selecione uma forma de pagamento."),
    transportadoraId:    z.coerce.number().int().positive().nullable().optional(),
    dataEmissao:         z.string().min(1, "Informe a data de emissão."),
    dataChegada:         z.string().nullable().optional(),
    tipoFrete:           z.string().default("CIF"),
    valorProdutos:       z.coerce.number().min(0),
    valorFrete:          z.coerce.number().min(0),
    valorSeguro:         z.coerce.number().min(0),
    outrasDespesas:      z.coerce.number().min(0),
    valorDesconto:       z.coerce.number().min(0),
    valorTotal:          z.coerce.number().min(0),
    placaVeiculo:        z.string().max(8).nullable().optional(),
    observacoes:         z.string().nullable().optional(),
    situacao:            z.enum(["LANCADA", "CANCELADA"]).default("LANCADA"),
    itens:               z.array(itemNotaEntradaSchema).min(1, "A nota deve ter pelo menos um item."),
}).refine((data) => !data.dataChegada || data.dataChegada >= data.dataEmissao, {
    message: "A data de chegada não pode ser anterior à data de emissão.",
    path: ["dataChegada"],
}).refine((data) => !data.dataChegada || data.dataChegada <= new Date().toISOString().split('T')[0], {
    message: "A data de chegada não pode ser posterior à data de hoje.",
    path: ["dataChegada"],
})

function parseDadosNotaEntrada(formData: FormData) {
    const itens = parseJsonField(formData.get('itens'), z.array(itemNotaEntradaSchema))

    return {
        numero:              (formData.get('numero') as string || "").trim(),
        modelo:              (formData.get('modelo') as string || "55").trim(),
        serie:               (formData.get('serie') as string || "1").trim(),
        fornecedorId:        formData.get('fornecedorId'),
        condicaoPagamentoId: formData.get('condicaoPagamentoId'),
        formaPagamentoId:    formData.get('formaPagamentoId') || 1, // o form envia a forma da 1ª parcela gerada; 1 é só o último recurso
        transportadoraId:    formData.get('transportadoraId') ? formData.get('transportadoraId') : null,
        dataEmissao:         formData.get('dataEmissao'),
        // O form envia o campo como "dataEntrada" (ver NotaEntradaForm.tsx) — antes lia
        // "dataChegada", que nunca existia no FormData, então o valor sempre ia nulo.
        dataChegada:         nullableString(formData.get('dataEntrada')),
        tipoFrete:           formData.get('tipoFrete') || 'CIF',
        valorProdutos:       formData.get('valorTotalProdutos') || 0,
        valorFrete:          formData.get('valorFrete') || 0,
        valorSeguro:         formData.get('valorSeguro') || 0,
        outrasDespesas:      formData.get('outrasDespesas') || 0,
        valorDesconto:       formData.get('valorDesconto') || 0,
        valorTotal:          formData.get('valorTotalNota') || 0,
        placaVeiculo:        nullableString(formData.get('placaVeiculo')),
        observacoes:         nullableString(formData.get('observacoes')),
        situacao:            formData.get('situacao') || 'LANCADA',
        itens,
    }
}

export async function salvarNotaEntrada(formData: FormData) {
    const dados = parseDadosNotaEntrada(formData)
    const validacao = notaEntradaSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // Cabeçalho da nota
        await client.query(
            `INSERT INTO tb_notas_entrada (
                numero, modelo, serie, "fornecedorId",
                "condicaoPagamentoId", "formaPagamentoId", "transportadoraId",
                "dataEmissao", "dataChegada", "tipoFrete",
                "valorProdutos", "valorFrete", "valorSeguro",
                "outrasDespesas", "valorDesconto", "valorTotal",
                "placaVeiculo", observacoes, situacao
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            )`,
            [
                v.numero, v.modelo, v.serie, v.fornecedorId,
                v.condicaoPagamentoId, v.formaPagamentoId, v.transportadoraId ?? null,
                v.dataEmissao, v.dataChegada ?? null, v.tipoFrete,
                v.valorProdutos, v.valorFrete, v.valorSeguro,
                v.outrasDespesas, v.valorDesconto, v.valorTotal,
                v.placaVeiculo ?? null, v.observacoes ?? null, v.situacao
            ]
        )

        // Itens da nota
        let seq = 1
        for (const item of v.itens) {
            // O formulário já manda o percentual sincronizado com o valor. Só se ele não vier
            // é que derivamos aqui: valor do desconto sobre o valor bruto (quantidade x valorUnitario).
            const valorBruto = mulDiv(item.quantidade, item.valorUnitario, 1, 2)
            const percentualDesconto = item.percentualDesconto
                ?? (valorBruto > 0 ? mulDiv(item.valorDesconto, 100, valorBruto, 6) : 0)

            await client.query(
                `INSERT INTO tb_produtos_nota_entrada (
                    "notaNumero", "notaModelo", "notaSerie", "fornecedorId",
                    "produtoId", sequencia, quantidade, "valorUnitario",
                    "valorDesconto", "percentualDesconto", "valorTotal",
                    "rateioFrete", "rateioSeguro", "rateioOutras", "custoPrecoFinal"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [
                    v.numero, v.modelo, v.serie, v.fornecedorId,
                    item.produtoId, seq, item.quantidade, item.valorUnitario,
                    item.valorDesconto, percentualDesconto, item.valorTotal,
                    item.rateioFrete, item.rateioSeguro, item.rateioOutras, item.custoPrecoFinal
                ]
            )
            seq++
        }

        // Estoque e custo médio: só notas LANCADA entram.
        if (v.situacao === 'LANCADA') {
            await ajustarEstoque(client, v.itens.map(i => ({
                produtoId: Number(i.produtoId),
                quantidade: Number(i.quantidade),
                custoUnitario: Number(i.custoPrecoFinal),
            })))
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        if (error instanceof ErroNegocio) throw error
        tratarErroDB(error, NOTA_ENTRADA_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/notas-entrada')
    revalidatePath('/produtos')
}

// Única transição de situação permitida hoje: LANCADA -> CANCELADA. Não existe mais um
// "atualizarSituacao" genérico que aceita qualquer string — isso deixava a porta aberta pra
// setar um status inválido (ou pior, "reabrir" uma nota cancelada) direto pelo código do
// client sem passar por nenhuma regra. A nota nunca é editada nem excluída depois de lançada,
// só cancelada.
//
// Cancelar também desfaz a entrada no estoque. Se parte do que entrou já foi vendida/baixada e o
// estoque atual não cobre a devolução, o cancelamento é recusado (e a nota continua LANCADA).
export async function cancelarNotaEntrada(numero: string, modelo: string, serie: string, fornecedorId: number) {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // O UPDATE só acerta se a nota ainda está LANCADA e trava a linha até o COMMIT: um segundo
        // clique (ou outra aba) espera, encontra a nota já CANCELADA e não estorna o estoque de novo.
        const res = await client.query(
            `UPDATE tb_notas_entrada SET situacao = 'CANCELADA' WHERE numero = $1 AND modelo = $2 AND serie = $3 AND "fornecedorId" = $4 AND situacao = 'LANCADA'`,
            [numero, modelo, serie, fornecedorId]
        )

        if ((res.rowCount ?? 0) > 0) {
            const itens = await carregarItensDaNota(client, numero, modelo, serie, fornecedorId)
            await ajustarEstoque(client, inverter(itens))
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        if (error instanceof ErroNegocio) throw error
        tratarErroDB(error)
    } finally {
        client.release()
    }
    revalidatePath('/notas-entrada')
    revalidatePath('/produtos')
}

export async function verificarChaveNotaEntradaExiste(numero: string, modelo: string, serie: string, fornecedorId: number): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1 FROM tb_notas_entrada WHERE numero = $1 AND modelo = $2 AND serie = $3 AND "fornecedorId" = $4 LIMIT 1`,
        [numero, modelo, serie, fornecedorId]
    )
    return (result.rowCount ?? 0) > 0
}

export async function listarNotasEntrada(): Promise<NotaEntradaView[]> {
    const result = await pool.query(`
        SELECT n.*, 
               n.numero as "numeroNf",
               n."valorTotal" as "valorTotalNota",
               f.fornecedor,
               c."condicaoPagamento"
        FROM tb_notas_entrada n
        LEFT JOIN tb_fornecedores f ON f.id = n."fornecedorId"
        LEFT JOIN tb_condicoes_pagamento c ON c.id = n."condicaoPagamentoId"
        ORDER BY n."dataEmissao" DESC, n.numero DESC
    `)
    return result.rows
}
