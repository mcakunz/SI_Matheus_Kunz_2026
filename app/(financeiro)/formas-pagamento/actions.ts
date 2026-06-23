"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"


const FORMA_PAGAMENTO_ERROR_LABELS: DBErrorLabels = {
    unique: {
        formaPagamento: "este nome de forma de pagamento",
    },
    foreignKey: "Esta forma de pagamento não pode ser excluída pois está vinculada a condições de pagamento ou documentos.",
}

const formaPagamentoSchema = z.object({
    formaPagamento: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(50),
    descricao:      z.string().max(100, "A descrição deve ter no máximo 100 caracteres."),
    ativo:          z.boolean(),
})

export async function salvarFormaPagamento(formData: FormData) {
    const dados = {
        formaPagamento: (formData.get('formaPagamento') as string || "").trim(),
        descricao:      (formData.get('descricao')      as string || "").trim(),
        ativo:          formData.get('ativo') === 'true',
    }

    const validacao = formaPagamentoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

        const v = validacao.data
        const idInput = formData.get('id')
        const id = idInput ? Number(idInput) : null

        try {
            if (id) {
                await pool.query(
                    `UPDATE tb_formas_pagamento
                        SET "formaPagamento" = $1,
                            "descricao"      = $2,
                            "ativo"          = $3
                     WHERE id = $4`,
                    [v.formaPagamento, v.descricao, v.ativo, id]        
                )
            } else {
                await pool.query(
                    `INSERT INTO tb_formas_pagamento ("formaPagamento", "descricao", "ativo")
                     VALUES ($1, $2, $3)`,
                     [v.formaPagamento, v.descricao, v.ativo]
                )
            }
        } catch (error: any) {
            tratarErroDB(error, FORMA_PAGAMENTO_ERROR_LABELS)
        }

        revalidatePath('/formas-pagamento')
}

export async function alternarStatusFormaPagamento(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_formas_pagamento SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/formas-pagamento')
}

export async function excluirFormaPagamento(id: number) {
    try {
        await pool.query(`DELETE FROM tb_formas_pagamento WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, FORMA_PAGAMENTO_ERROR_LABELS)
    }

    revalidatePath('/formas-pagamento')
}
