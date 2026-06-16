"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"


const PRODUTO_ERROR_LABELS: DBErrorLabels = {
    unique: {
        codigoBarras: "este código de barras",
    },
    foreignKey: "Este produto não pode ser excluído pois está vinculado a outros registros.",
}

const produtoSchema = z.object({
    produto:          z.string().min(1, "Nome do produto é obrigatório").max(50, "Máximo de 50 caracteres"),
    codigoBarras:     z.string().max(20, "Máximo de 20 caracteres").nullable(),
    referencia:       z.string().max(30, "Máximo de 30 caracteres").nullable(),
    marcaId:          z.number({ error: "Marca é obrigatória" }).int().positive("Marca é obrigatória"),
    unidadeMedidaId:  z.number({ error: "Unidade de medida é obrigatória" }).int().positive("Unidade de medida é obrigatória"),
    categoriaId:      z.number({ error: "Categoria é obrigatória" }).int().positive("Categoria é obrigatória"),
    valorCompra:      z.number({ error: "Valor de compra inválido" }).min(0, "Valor de compra não pode ser negativo"),
    valorVenda:       z.number({ error: "Valor de venda inválido" }).min(0, "Valor de venda não pode ser negativo"),
    quantidade:       z.number({ error: "Quantidade inválida" }).int().min(0, "Quantidade não pode ser negativa"),
    quantidadeMinima: z.number({ error: "Quantidade mínima inválida" }).int().min(1, "Quantidade mínima deve ser ao menos 1"),
    percentualLucro:  z.number({ error: "Percentual de lucro inválido" }).min(0, "Percentual de lucro não pode ser negativo"),
    descricao:        z.string().nullable(),
    observacoes:      z.string().max(150, "Máximo de 150 caracteres").nullable(),
    ativo:            z.boolean(),
})

export async function salvarProduto(formData: FormData) {
    const codigoBarras = (formData.get('codigoBarras') as string || "").trim() || null
    const referencia   = (formData.get('referencia')   as string || "").trim() || null
    const descricao    = (formData.get('descricao')    as string || "").trim() || null
    const observacoes  = (formData.get('observacoes')  as string || "").trim() || null

    const dados = {
        produto:          (formData.get('produto') as string || "").trim(),
        codigoBarras,
        referencia,
        marcaId:          Number(formData.get('marcaId')),
        unidadeMedidaId:  Number(formData.get('unidadeMedidaId')),
        categoriaId:      Number(formData.get('categoriaId')),
        valorCompra:      Number(formData.get('valorCompra')),
        valorVenda:       Number(formData.get('valorVenda')),
        quantidade:       Number(formData.get('quantidade')),
        quantidadeMinima: Number(formData.get('quantidadeMinima')),
        percentualLucro:  Number(formData.get('percentualLucro')),
        descricao,
        observacoes,
        ativo:            formData.get('ativo') === 'true',
    }

    const validacao = produtoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const idInput = formData.get('id')
    const id = idInput ? Number(idInput) : null

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_produtos
                    SET "produto"          = $1,
                        "codigoBarras"     = $2,
                        "referencia"       = $3,
                        "marcaId"          = $4,
                        "unidadeMedidaId"  = $5,
                        "categoriaId"      = $6,
                        "valorCompra"      = $7,
                        "valorVenda"       = $8,
                        "quantidade"       = $9,
                        "quantidadeMinima" = $10,
                        "percentualLucro"  = $11,
                        "descricao"        = $12,
                        "observacoes"      = $13,
                        "ativo"            = $14
                 WHERE id = $15`,
                [
                    v.produto, v.codigoBarras, v.referencia,
                    v.marcaId, v.unidadeMedidaId, v.categoriaId,
                    v.valorCompra, v.valorVenda,
                    v.quantidade, v.quantidadeMinima, v.percentualLucro,
                    v.descricao, v.observacoes, v.ativo,
                    id,
                ]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_produtos
                    ("produto", "codigoBarras", "referencia",
                     "marcaId", "unidadeMedidaId", "categoriaId",
                     "valorCompra", "valorVenda",
                     "quantidade", "quantidadeMinima", "percentualLucro",
                     "descricao", "observacoes", "ativo")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
                [
                    v.produto, v.codigoBarras, v.referencia,
                    v.marcaId, v.unidadeMedidaId, v.categoriaId,
                    v.valorCompra, v.valorVenda,
                    v.quantidade, v.quantidadeMinima, v.percentualLucro,
                    v.descricao, v.observacoes, v.ativo,
                ]
            )
        }
        revalidatePath('/produtos')
    } catch (error: any) {
        tratarErroDB(error, PRODUTO_ERROR_LABELS)
    }
}

export async function alternarStatusProduto(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_produtos SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
        revalidatePath('/produtos')
    } catch (error: any) {
        tratarErroDB(error)
    }
}

export async function excluirProduto(id: number) {
    try {
        await pool.query(`DELETE FROM tb_produtos WHERE id = $1`, [id])
        revalidatePath('/produtos')
    } catch (error: any) {
        tratarErroDB(error, PRODUTO_ERROR_LABELS)
    }
}