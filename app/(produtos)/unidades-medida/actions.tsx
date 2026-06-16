"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"


const UNIDADE_MEDIDA_ERROR_LABELS: DBErrorLabels = {
    unique: {
        unidadeMedida: "esta unidade de medida",
    },
    foreignKey: "Esta unidade de medida não pode ser excluída pois está vinculada a produtos.",
}

const unidadeMedidaSchema = z.object({
    unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória").max(3, "Máximo de 3 caracteres"),
    ativo:         z.boolean(),
})

export async function salvarUnidadeMedida(formData: FormData) {
    const dados = {
        unidadeMedida: (formData.get('unidadeMedida') as string || "").trim().toUpperCase(),
        ativo:         formData.get('ativo') === 'true',
    }

    const validacao = unidadeMedidaSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const idInput = formData.get('id')
    const id = idInput ? Number(idInput) : null

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_unidades_medida
                    SET "unidadeMedida" = $1,
                        "ativo"         = $2
                 WHERE id = $3`,
                [v.unidadeMedida, v.ativo, id]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_unidades_medida ("unidadeMedida", "ativo")
                 VALUES ($1, $2)`,
                [v.unidadeMedida, v.ativo]
            )
        }
        revalidatePath('/unidades-medida')
    } catch (error: any) {
        tratarErroDB(error, UNIDADE_MEDIDA_ERROR_LABELS)
    }
}

export async function alternarStatusUnidadeMedida(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_unidades_medida SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
        revalidatePath('/unidades-medida')
    } catch (error: any) {
        tratarErroDB(error)
    }
}

export async function excluirUnidadeMedida(id: number) {
    try {
        await pool.query(`DELETE FROM tb_unidades_medida WHERE id = $1`, [id])
        revalidatePath('/unidades-medida')
    } catch (error: any) {
        tratarErroDB(error, UNIDADE_MEDIDA_ERROR_LABELS)
    }
}