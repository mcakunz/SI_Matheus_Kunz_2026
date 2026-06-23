"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"


const MARCA_ERROR_LABELS: DBErrorLabels = {
    unique: {
        marca: "este nome de marca",
    },
    foreignKey: "Esta marca não pode ser excluída pois está vinculada a produtos.",
}

const marcaSchema = z.object({
    marca: z.string().min(1, "Marca é obrigatória").max(50, "Máximo de 50 caracteres"),
    ativo: z.boolean(),
})

export async function salvarMarca(formData: FormData) {
    const dados = {
        marca: (formData.get('marca') as string || "").trim(),
        ativo: formData.get('ativo') === 'true',
    }

    const validacao = marcaSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const idInput = formData.get('id')
    const id = idInput ? Number(idInput) : null

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_marcas
                    SET "marca" = $1,
                        "ativo" = $2
                 WHERE id = $3`,
                [v.marca, v.ativo, id]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_marcas ("marca", "ativo")
                 VALUES ($1, $2)`,
                [v.marca, v.ativo]
            )
        }
        revalidatePath('/marcas')
    } catch (error: any) {
        tratarErroDB(error, MARCA_ERROR_LABELS)
    }
}

export async function alternarStatusMarca(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_marcas SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/marcas')
}

export async function excluirMarca(id: number) {
    try {
        await pool.query(`DELETE FROM tb_marcas WHERE id = $1`, [id])
        revalidatePath('/marcas')
    } catch (error: any) {
        tratarErroDB(error, MARCA_ERROR_LABELS)
    }
}