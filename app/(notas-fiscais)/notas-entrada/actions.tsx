"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { nullableString, parseJsonField } from "@/lib/utils/helpers"
import { NotaEntradaView, ItemNotaEntrada } from "@/lib/types"

const NOTA_ENTRADA_ERROR_LABELS: DBErrorLabels = {
    unique: {
        tb_notas_entrada_pkey: "Já existe uma nota fiscal com este número, modelo e série para este fornecedor.",
    },
    foreignKey: "Esta nota não pode ser excluída pois possui vínculos com contas a pagar ou estoque.",
}

const itemNotaEntradaSchema = z.object({
    id:            z.number().optional(),
    produtoId:     z.coerce.number().int().positive("Selecione um produto válido."),
    sequencia:     z.coerce.number().int().positive().default(1),
    quantidade:    z.coerce.number().min(0.01, "A quantidade deve ser maior que zero."),
    valorUnitario: z.coerce.number().min(0, "O valor unitário não pode ser negativo."),
    valorDesconto: z.coerce.number().min(0).default(0),
    valorTotal:    z.coerce.number().min(0),
    rateioFrete:   z.coerce.number().min(0).default(0),
    rateioSeguro:  z.coerce.number().min(0).default(0),
    rateioOutras:  z.coerce.number().min(0).default(0),
})

const notaEntradaSchema = z.object({
    numero:              z.string().min(1, "O número da NF é obrigatório.").max(20),
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
        formaPagamentoId:    formData.get('formaPagamentoId') || 1, // TODO: adicionar FormaPagamentoLookup no form
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
    const isEdicao = formData.get('isEdicao') === 'true'

    // Chave primária original, usada para localizar a nota e seus itens ANTES da atualização,
    // já que o usuário pode ter alterado numero/modelo/serie/fornecedor na tela.
    const originalNumero = formData.get('originalNumero') as string
    const originalModelo = formData.get('originalModelo') as string
    const originalSerie = formData.get('originalSerie') as string
    const originalFornecedorId = Number(formData.get('originalFornecedorId'))

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        if (isEdicao && originalNumero) {
            // 1º) Apaga os itens antigos usando a CHAVE ORIGINAL, ANTES de mexer no cabeçalho.
            // Isso é essencial: como a nota usa PK composta e os itens têm FK para ela,
            // se a UPDATE do cabeçalho rodasse primeiro e mudasse numero/serie/modelo/fornecedor,
            // os itens filhos ficariam órfãos apontando para uma chave que deixou de existir
            // e o Postgres rejeitaria a UPDATE por violação de FOREIGN KEY.
            await client.query(
                `DELETE FROM tb_produtos_nota_entrada 
                 WHERE "notaNumero" = $1 AND "notaModelo" = $2 AND "notaSerie" = $3 AND "fornecedorId" = $4`,
                [originalNumero, originalModelo, originalSerie, originalFornecedorId]
            )

            // 2º) Agora sim atualiza o cabeçalho, podendo alterar a PK com segurança.
            await client.query(
                `UPDATE tb_notas_entrada
                    SET numero = $1, modelo = $2, serie = $3, "fornecedorId" = $4,
                        "condicaoPagamentoId" = $5, "formaPagamentoId" = $6, "transportadoraId" = $7,
                        "dataEmissao" = $8, "dataChegada" = $9, "tipoFrete" = $10,
                        "valorProdutos" = $11, "valorFrete" = $12, "valorSeguro" = $13,
                        "outrasDespesas" = $14, "valorDesconto" = $15, "valorTotal" = $16,
                        "placaVeiculo" = $17, observacoes = $18, situacao = $19
                 WHERE numero = $20 AND modelo = $21 AND serie = $22 AND "fornecedorId" = $23`,
                [
                    v.numero, v.modelo, v.serie, v.fornecedorId,
                    v.condicaoPagamentoId, v.formaPagamentoId, v.transportadoraId ?? null,
                    v.dataEmissao, v.dataChegada ?? null, v.tipoFrete,
                    v.valorProdutos, v.valorFrete, v.valorSeguro,
                    v.outrasDespesas, v.valorDesconto, v.valorTotal,
                    v.placaVeiculo ?? null, v.observacoes ?? null, v.situacao,
                    originalNumero, originalModelo, originalSerie, originalFornecedorId
                ]
            )
        } else {
            // Insere nova Nota de Entrada
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
        }

        // 3º) Insere os itens usando a chave NOVA (igual à antiga, se numero/modelo/serie/fornecedor não mudaram)
        let seq = 1
        for (const item of v.itens) {
            // "percentualDesconto" é derivado do valor do desconto sobre o valor bruto do item
            // (quantidade x valorUnitario), não é digitado pelo usuário — o formulário só
            // captura o valor do desconto em R$.
            const valorBruto = item.quantidade * item.valorUnitario
            const percentualDesconto = valorBruto > 0
                ? Number(((item.valorDesconto / valorBruto) * 100).toFixed(2))
                : 0

            await client.query(
                `INSERT INTO tb_produtos_nota_entrada (
                    "notaNumero", "notaModelo", "notaSerie", "fornecedorId",
                    "produtoId", sequencia, quantidade, "valorUnitario",
                    "valorDesconto", "percentualDesconto", "valorTotal",
                    "rateioFrete", "rateioSeguro", "rateioOutras"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    v.numero, v.modelo, v.serie, v.fornecedorId,
                    item.produtoId, seq, item.quantidade, item.valorUnitario,
                    item.valorDesconto, percentualDesconto, item.valorTotal,
                    item.rateioFrete, item.rateioSeguro, item.rateioOutras
                ]
            )
            seq++
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, NOTA_ENTRADA_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/notas-entrada')
}

// Única transição de situação permitida hoje: LANCADA -> CANCELADA. Não existe mais um
// "atualizarSituacao" genérico que aceita qualquer string — isso deixava a porta aberta pra
// setar um status inválido (ou pior, "reabrir" uma nota cancelada) direto pelo código do
// client sem passar por nenhuma regra. A nota nunca é editada nem excluída depois de lançada,
// só cancelada.
export async function cancelarNotaEntrada(numero: string, modelo: string, serie: string, fornecedorId: number) {
    try {
        await pool.query(
            `UPDATE tb_notas_entrada SET situacao = 'CANCELADA' WHERE numero = $1 AND modelo = $2 AND serie = $3 AND "fornecedorId" = $4 AND situacao = 'LANCADA'`,
            [numero, modelo, serie, fornecedorId]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }
    revalidatePath('/notas-entrada')
}

export async function verificarChaveNotaEntradaExiste(numero: string, modelo: string, serie: string, fornecedorId: number): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1 FROM tb_notas_entrada WHERE numero = $1 AND modelo = $2 AND serie = $3 AND "fornecedorId" = $4 LIMIT 1`,
        [numero, modelo, serie, fornecedorId]
    )
    return (result.rowCount ?? 0) > 0
}

// ⚠️ Sem uso na interface a partir de agora — a política atual é "nunca excluir, só cancelar"
// (ver cancelarNotaEntrada acima). Deixei a função aqui em vez de apagar porque excluir
// código de banco é mais arriscado de reverter do que remover um botão; se vocês tiverem
// certeza de que nunca vai precisar mais disso (nem via alguma ferramenta interna/admin),
// pode remover esta função com segurança.
export async function excluirNotaEntrada(numero: string, modelo: string, serie: string, fornecedorId: number) {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        // Exclui os itens baseados na chave composta
        await client.query(
            `DELETE FROM tb_produtos_nota_entrada WHERE "notaNumero" = $1 AND "notaModelo" = $2 AND "notaSerie" = $3 AND "fornecedorId" = $4`,
            [numero, modelo, serie, fornecedorId]
        )
        // Exclui a nota
        await client.query(
            `DELETE FROM tb_notas_entrada WHERE numero = $1 AND modelo = $2 AND serie = $3 AND "fornecedorId" = $4`,
            [numero, modelo, serie, fornecedorId]
        )
        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, NOTA_ENTRADA_ERROR_LABELS)
    } finally {
        client.release()
    }
    revalidatePath('/notas-entrada')
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

export async function buscarNotaEntradaPorChaveComposta(numero: string, modelo: string, serie: string, fornecedorId: number): Promise<{ nota: NotaEntradaView, itens: ItemNotaEntrada[] } | null> {
    const resNota = await pool.query(`
        SELECT n.*, 
               n.numero as "numeroNf",
               n."valorTotal" as "valorTotalNota",
               f.fornecedor, 
               c."condicaoPagamento"
        FROM tb_notas_entrada n
        LEFT JOIN tb_fornecedores f ON f.id = n."fornecedorId"
        LEFT JOIN tb_condicoes_pagamento c ON c.id = n."condicaoPagamentoId"
        WHERE n.numero = $1 AND n.modelo = $2 AND n.serie = $3 AND n."fornecedorId" = $4
    `, [numero, modelo, serie, fornecedorId])

    if (resNota.rows.length === 0) return null

    const resItens = await pool.query(`
        SELECT i.*, p.produto
        FROM tb_produtos_nota_entrada i
        INNER JOIN tb_produtos p ON p.id = i."produtoId"
        WHERE i."notaNumero" = $1 AND i."notaModelo" = $2 AND i."notaSerie" = $3 AND i."fornecedorId" = $4
        ORDER BY i.sequencia ASC
    `, [numero, modelo, serie, fornecedorId])

    return {
        nota: resNota.rows[0],
        itens: resItens.rows
    }
}