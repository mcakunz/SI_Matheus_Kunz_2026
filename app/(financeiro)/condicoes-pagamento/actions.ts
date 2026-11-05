"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { listarFormasPagamentoAtivas } from "@/app/(financeiro)/formas-pagamento/actions"
import { ParcelaCondicao } from "@/lib/types"


const CONDICAO_PAGAMENTO_ERROR_LABELS: DBErrorLabels = {
    unique: {
        condicaoPagamento: "este nome de condição de pagamento",
    },
    foreignKey: "Esta condição de pagamento não pode ser excluída pois está vinculada a clientes ou documentos.",
}

const parcelaSchema = z.object({
    numero:           z.coerce.number().int().positive(),
    dias:             z.coerce.number().int().min(0),
    percentual:       z.coerce.number().min(0.01, "Percentual deve ser maior que 0."),
    formaPagamentoId: z.coerce.number().int().positive("Selecione uma forma de pagamento."),
})

const condicaoPagamentoSchema = z.object({
    condicaoPagamento:   z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    numeroParcelas:      z.coerce.number().int().min(1, "Informe pelo menos 1 parcela."),
    diasPrimeiraParcela: z.coerce.number().int().min(0, "Dias não pode ser negativo."),
    percentualJuros:     z.coerce.number().min(0).max(100, "Percentual inválido."),
    percentualMulta:     z.coerce.number().min(0).max(100, "Percentual inválido."),
    percentualDesconto:  z.coerce.number().min(0).max(100, "Percentual inválido."),
    ativo:               z.boolean(),
    parcelas:            z.array(parcelaSchema).min(1, "Adicione ao menos uma parcela."),
}).superRefine((data, ctx) => {
    const totalPercentual = data.parcelas.reduce((acc, p) => acc + Number(p.percentual), 0)
    if (Math.abs(totalPercentual - 100) > 0.01) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parcelas'],
            message: `A soma dos percentuais das parcelas deve ser 100%. Atual: ${totalPercentual.toFixed(2)}%.`,
        })
    }
    if (data.parcelas.length !== data.numeroParcelas) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['parcelas'],
            message: `O número de parcelas cadastradas (${data.parcelas.length}) não corresponde ao campo "Número de Parcelas" (${data.numeroParcelas}).`,
        })
    }
})

function parseParcelasFromFormData(formData: FormData): z.infer<typeof parcelaSchema>[] {
    const parcelas: z.infer<typeof parcelaSchema>[] = []
    let i = 0
    while (formData.has(`parcelas[${i}].numero`)) {
        parcelas.push({
            numero:           Number(formData.get(`parcelas[${i}].numero`)),
            dias:             Number(formData.get(`parcelas[${i}].dias`)),
            percentual:       Number(formData.get(`parcelas[${i}].percentual`)),
            formaPagamentoId: Number(formData.get(`parcelas[${i}].formaPagamentoId`)),
        })
        i++
    }
    return parcelas
}

export async function salvarCondicaoPagamento(formData: FormData) {
    const dados = {
        condicaoPagamento:   (formData.get('condicaoPagamento') as string || "").trim(),
        numeroParcelas:      formData.get('numeroParcelas'),
        diasPrimeiraParcela: formData.get('diasPrimeiraParcela'),
        percentualJuros:     formData.get('percentualJuros'),
        percentualMulta:     formData.get('percentualMulta'),
        percentualDesconto:  formData.get('percentualDesconto'),
        ativo:               formData.get('ativo') === 'true',
        parcelas:            parseParcelasFromFormData(formData),
    }

    const validacao = condicaoPagamentoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const idInput = formData.get('id')
    const id = idInput ? Number(idInput) : null

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        let condicaoPagamentoId: number

        if (id) {
            await client.query(
                `UPDATE tb_condicoes_pagamento
                    SET "condicaoPagamento"   = $1,
                        "numeroParcelas"      = $2,
                        "diasPrimeiraParcela" = $3,
                        "percentualJuros"     = $4,
                        "percentualMulta"     = $5,
                        "percentualDesconto"  = $6,
                        "ativo"               = $7
                  WHERE id = $8`,
                  [
                    v.condicaoPagamento, v.numeroParcelas, v.diasPrimeiraParcela,
                    v.percentualJuros, v.percentualMulta,
                    v.percentualDesconto, v.ativo, id,
                  ]
            )

            await client.query(
                `DELETE FROM tb_parcelas_condicao_pagamento WHERE "condicaoPagamentoId" = $1`,
                [id]
            )
            condicaoPagamentoId = id
        } else {
            const res = await client.query<{ id: number }>(
                `INSERT INTO tb_condicoes_pagamento (
                    "condicaoPagamento", "numeroParcelas", "diasPrimeiraParcela",
                    "percentualJuros", "percentualMulta",
                    "percentualDesconto", "ativo"
                ) VALUES ($1,$2,$3,$4,$5,$6,$7)
                RETURNING id`,
                [
                    v.condicaoPagamento, v.numeroParcelas, v.diasPrimeiraParcela,
                    v.percentualJuros, v.percentualMulta,
                    v.percentualDesconto, v.ativo,
                ]
            )
            condicaoPagamentoId = res.rows[0].id
        }

        for (const p of v.parcelas) {
            await client.query(
                `INSERT INTO tb_parcelas_condicao_pagamento
                    ("condicaoPagamentoId", "numero", "dias", "percentual", "formaPagamentoId")
                VALUES ($1,$2,$3,$4,$5)`,
                [condicaoPagamentoId, p.numero, p.dias, p.percentual, p.formaPagamentoId]
            )
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, CONDICAO_PAGAMENTO_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/condicoes-pagamento')
}

export async function salvarCondicaoPagamentoComRetorno(
    formData: FormData
): Promise<{ id: number; condicaoPagamento: string }> {

    const dados = {
        condicaoPagamento:   (formData.get('condicaoPagamento') as string || "").trim(),
        numeroParcelas:      formData.get('numeroParcelas'),
        diasPrimeiraParcela: formData.get('diasPrimeiraParcela'),
        percentualJuros:     formData.get('percentualJuros'),
        percentualMulta:     formData.get('percentualMulta'),
        percentualDesconto:  formData.get('percentualDesconto'),
        ativo:               formData.get('ativo') === 'true',
        parcelas:            parseParcelasFromFormData(formData),
    }

    const validacao = condicaoPagamentoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const res = await client.query<{ id: number; condicaoPagamento: string }>(
            `INSERT INTO tb_condicoes_pagamento (
                "condicaoPagamento", "numeroParcelas", "diasPrimeiraParcela",
                "percentualJuros", "percentualMulta",
                "percentualDesconto", "ativo"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id, "condicaoPagamento"`,
            [
                v.condicaoPagamento, v.numeroParcelas, v.diasPrimeiraParcela,
                v.percentualJuros, v.percentualMulta,
                v.percentualDesconto, v.ativo,
            ]
        )

        const condicaoPagamentoId = res.rows[0].id

        for (const p of v.parcelas) {
            await client.query(
                `INSERT INTO tb_parcelas_condicao_pagamento
                    ("condicaoPagamentoId", "numero", "dias", "percentual", "formaPagamentoId")
                VALUES ($1,$2,$3,$4,$5)`,
                [condicaoPagamentoId, p.numero, p.dias, p.percentual, p.formaPagamentoId]
            )
        }

        await client.query('COMMIT')
        revalidatePath('/condicoes-pagamento')
        return res.rows[0]
    } catch (error: any) {
        await client.query('ROLLBACK')
        throw new Error(error.message)
    } finally {
        client.release()
    }
}

export async function alternarStatusCondicaoPagamento(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_condicoes_pagamento SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/condicoes-pagamento')
}

export async function excluirCondicaoPagamento(id: number) {
    try {
        await pool.query(`DELETE FROM tb_condicoes_pagamento WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, CONDICAO_PAGAMENTO_ERROR_LABELS)
    }
    
    revalidatePath('/condicoes-pagamento')
}

/**
 * Lista simplificada (id + condicaoPagamento) usada em selects/lookups.
 * Útil, por exemplo, para popular combobox/selects em formulários de clientes ou vendas
 * quando aberto pelo modal de cadastro rápido (sem SSR disponível).
 */
export async function listarCondicoesPagamentoAtivas(): Promise<{ id: number; condicaoPagamento: string }[]> {
    const result = await pool.query<{ id: number; condicaoPagamento: string }>(
        `SELECT id, "condicaoPagamento" FROM tb_condicoes_pagamento WHERE ativo = true ORDER BY "condicaoPagamento" ASC`
    )
    return result.rows
}

/**
 * Lista as parcelas configuradas para UMA condição de pagamento específica, já com o nome
 * da forma de pagamento de cada parcela resolvido via join. Usada em telas que precisam
 * mostrar o quadro de parcelas (vencimento e valor) de uma nota, como Notas de Entrada e
 * Notas de Saída, a partir da condição de pagamento escolhida.
 */
export async function listarParcelasPorCondicao(condicaoPagamentoId: number): Promise<ParcelaCondicao[]> {
    const result = await pool.query<ParcelaCondicao>(`
        SELECT pc.*, fp."formaPagamento"
        FROM tb_parcelas_condicao_pagamento pc
        INNER JOIN tb_formas_pagamento fp ON fp.id = pc."formaPagamentoId"
        WHERE pc."condicaoPagamentoId" = $1
        ORDER BY pc.numero ASC
    `, [condicaoPagamentoId])
    return result.rows
}

// ---------------------------------------------------------------------------
// EDIÇÃO EM MODAL
// Carrega o registro e tudo o que o formulário precisa, já no formato das props do Form
// (as mesmas que a página [id] passa). Usado por lib/cadastroModal/registry.tsx para abrir
// a edição num modal (ex.: lápis do modal de pesquisa da nota de entrada).
// ---------------------------------------------------------------------------
export async function carregarCondicaoPagamentoParaEdicao(id: number) {
    const [condicaoResult, parcelasResult, listaFormasPagamento] = await Promise.all([
        pool.query(`SELECT * FROM tb_condicoes_pagamento WHERE id = $1`, [id]),
        pool.query(
            `SELECT p.*, fp."formaPagamento"
             FROM tb_parcelas_condicao_pagamento p
             JOIN tb_formas_pagamento fp ON fp.id = p."formaPagamentoId"
             WHERE p."condicaoPagamentoId" = $1
             ORDER BY p.numero ASC`,
            [id]
        ),
        listarFormasPagamentoAtivas(),
    ])
    if (!condicaoResult.rows[0]) return null
    return { condicao: condicaoResult.rows[0], parcelas: parcelasResult.rows, listaFormasPagamento }
}
