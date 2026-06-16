"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"


const CATEGORIA_ERROR_LABELS: DBErrorLabels = {
    unique: {
        categoria: "este nome de categoria",
    },
    foreignKey: "Esta categoria não pode ser excluída pois está vinculada a produtos.",
}

const categoriaSchema = z.object({
    categoria: z.string().min(1, "Categoria é obrigatória").max(50, "Máximo de 50 caracteres"),
    ativo:          z.boolean(),
})

export async function salvarCategoria(formData: FormData) {
    const dados = {
        categoria: (formData.get('categoria') as string || "").trim(),
        ativo:          formData.get('ativo') === 'true',
    }

    const validacao = categoriaSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

        const v = validacao.data
        const idInput = formData.get('id')
        const id = idInput ? Number(idInput) : null

        try {
            if (id) {
                await pool.query(
                    `UPDATE tb_categorias
                        SET "categoria" = $1,
                            "ativo"     = $2
                     WHERE id = $3`,
                    [v.categoria, v.ativo, id]        
                )
            } else {
                await pool.query(
                    `INSERT INTO tb_categorias ("categoria", "ativo")
                     VALUES ($1, $2)`,
                     [v.categoria, v.ativo]
                )
            }
        } catch (error: any) {
            tratarErroDB(error, CATEGORIA_ERROR_LABELS)
        }

        revalidatePath('/categorias')
}

export async function alternarStatusCategoria(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_categorias SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/categorias')
}

export async function excluirCategoria(id: number) {
    try {
        await pool.query(`DELETE FROM tb_categorias WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, CATEGORIA_ERROR_LABELS)
    }

    revalidatePath('/categorias')
}
