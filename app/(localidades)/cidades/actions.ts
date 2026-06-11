"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const cidadeSchema = z.object({
    ativo:      z.boolean(),
    cidade:     z.string().min(2, "O nome da cidade deve ter no mínimo 2 caracteres.").max(100, "O nome da cidade é muito longo."),
    codigoIbge: z.string().length(7, "O código IBGE deve ter exatos 7 dígitos."),
    estadoId:   z.coerce.number().positive("Selecione um estado válido.")
})

const CIDADE_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        codigoIbge: "este código IBGE",
        cidade:     "este nome de cidade para o estado selecionado",
    },
    foreignKey: "Esta cidade não pode ser excluída pois existem clientes ou endereços vinculados a ela.",
}

export async function salvarCidade(formData: FormData) {
    const dados = {
        ativo:      formData.get('ativo') === 'true',
        cidade:     (formData.get('cidade') as string).trim(),
        codigoIbge: (formData.get('codigo_ibge') as string).trim(),
        estadoId:   formData.get('estado_id'),
    }

    const validacao = cidadeSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { ativo, cidade, codigoIbge, estadoId } = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_cidades
                    SET cidade = $1, "codigoIbge" = $2, "estadoId" = $3, ativo = $4, "dataAlteracao" = NOW()
                  WHERE id = $5`,
                [cidade, codigoIbge, estadoId, ativo, Number(id)]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_cidades (cidade, "codigoIbge", "estadoId", ativo)
                 VALUES ($1, $2, $3, $4)`,
                [cidade, codigoIbge, estadoId, ativo]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, CIDADE_DB_ERROR_LABELS)
    }

    revalidatePath('/cidades')
}

export async function salvarCidadeComRetorno(formData: FormData): Promise<{ id: number; cidade: string; estadoId: number }> {
    const dados = {
        ativo:      formData.get('ativo') === 'true',
        cidade:     (formData.get('cidade') as string).trim(),
        codigoIbge: (formData.get('codigo_ibge') as string).trim(),
        estadoId:   formData.get('estado_id'),
    }

    const validacao = cidadeSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { ativo, cidade, codigoIbge, estadoId } = validacao.data

    try {
        const result = await pool.query<{ id: number; cidade: string; estadoId: number }>(
            `INSERT INTO tb_cidades (cidade, "codigoIbge", "estadoId", ativo)
             VALUES ($1, $2, $3, $4)
             RETURNING id, cidade, "estadoId"`,
            [cidade, codigoIbge, estadoId, ativo]
        )
        revalidatePath('/cidades')
        return result.rows[0]
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export async function alternarStatusCidade(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_cidades SET ativo = $1, "dataAlteracao" = NOW() WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/cidades')
}

export async function excluirCidade(id: number) {
    try {
        await pool.query(`DELETE FROM tb_cidades WHERE id = $1`, [id])
    } catch (error: any) {
        if (error.code === '23503') {
            throw new Error("Esta cidade não pode ser excluída pois existem clientes, endereços ou registros vinculados a ela.")
        }
        throw new Error(error.message)
    }

    revalidatePath('/cidades')
}