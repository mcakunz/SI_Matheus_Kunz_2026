"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { query, queryOne } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const paisSchema = z.object({
    pais:           z.string().min(2, "O nome do país deve ter no mínimo 2 caracteres.").max(100, "O nome do país é muito longo."),
    codigo:         z.string().min(1, "O código é obrigatório.").max(5, "O código não pode passar de 5 caracteres."),
    sigla:          z.string().length(3, "A sigla deve ter exatamente 3 caracteres.").toUpperCase(),
    moeda:          z.string().length(3, "A moeda deve ter 3 caracteres."),
    nacionalidade:  z.string().min(2, "A nacionalidade é obrigatória.").max(100),
    ativo:          z.boolean()
})

const PAIS_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        pais:          "este nome de país",
        sigla:         "esta sigla",
        codigo:        "este código BACEN",
        nacionalidade: "esta nacionalidade",
    },
    foreignKey: "Este país não pode ser excluído pois existem estados vinculados a ele.",
}

export async function salvarPais(formData: FormData) {
    const dados = {
        pais:           (formData.get('pais') as string).trim(),
        codigo:         (formData.get('codigo') as string).trim(),
        sigla:          (formData.get('sigla') as string).trim().toUpperCase(),
        moeda:          (formData.get('moeda') as string).trim().toUpperCase(),
        nacionalidade:  (formData.get('nacionalidade') as string).trim(),
        ativo:          (formData.get('ativo') === 'true'),
    }

    const validacao = paisSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { pais, codigo, sigla, moeda, nacionalidade, ativo } = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await query(
                `UPDATE tb_paises
                    SET pais = $1, codigo = $2, sigla = $3, moeda = $4,
                        nacionalidade = $5, ativo = $6
                  WHERE id = $7`,
                [pais, codigo, sigla, moeda, nacionalidade, ativo, Number(id)]
            )
        } else {
            await query(
                `INSERT INTO tb_paises (pais, codigo, sigla, moeda, nacionalidade, ativo)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [pais, codigo, sigla, moeda, nacionalidade, ativo]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, PAIS_DB_ERROR_LABELS)
    }

    revalidatePath('/paises')
}

export async function salvarPaisComRetorno(formData: FormData) {
    const dados = {
        pais:           formData.get('pais') as string,
        codigo:         formData.get('codigo') as string,
        sigla:          formData.get('sigla') as string,
        moeda:          formData.get('moeda') as string,
        nacionalidade:  formData.get('nacionalidade') as string,
        ativo:          formData.get('ativo') === 'true',
    }

    const validacao = paisSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { pais, codigo, sigla, moeda, nacionalidade, ativo } = validacao.data

    try {
        const inserted = await queryOne<{ id: number; pais: string }>(
            `INSERT INTO tb_paises (pais, codigo, sigla, moeda, nacionalidade, ativo)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, pais`,
            [pais, codigo, sigla, moeda, nacionalidade, ativo]
        )

        revalidatePath('/paises')
        return inserted!
    } catch (error: any) {
        tratarErroDB(error)
    }
}

export async function alternarStatusPais(id: number, statusAtual: boolean) {
    try {
        await query(
            `UPDATE tb_paises SET ativo = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/paises')
}

export async function excluirPais(id: number) {
    try {
        await query(`DELETE FROM tb_paises WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/paises')
}
