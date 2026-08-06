"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { EstadoSelect } from "@/lib/types"

const estadoSchema = z.object({
    ativo:  z.boolean(),
    estado: z.string().trim().min(2, "O nome do estado deve ter no mínimo 2 caracteres.").max(100, "O nome do estado é muito longo."),
    uf:     z.string().trim().length(2, "A UF deve ter exatamente 2 caracteres.").toUpperCase(),
    paisId: z.coerce.number().positive("Selecione um país válido.")
})

const ESTADO_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        uf:     "esta UF para o país selecionado",
        estado: "este nome de estado para o país selecionado",
    },
    foreignKey: "Este estado não pode ser excluído pois existem cidades vinculadas a ele.",
}

export async function salvarEstado(formData: FormData) {
    const dados = {
        ativo:  formData.get('ativo') === 'true',
        estado: formData.get('estado') as string,
        uf:     formData.get('uf') as string,
        paisId: formData.get('pais_id'),
    }

    const validacao = estadoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { ativo, estado, uf, paisId } = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_estados
                    SET estado = $1, uf = $2, "paisId" = $3, ativo = $4, "dataAlteracao" = NOW()
                  WHERE id = $5`,
                [estado, uf, paisId, ativo, Number(id)]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_estados (estado, uf, "paisId", ativo)
                 VALUES ($1, $2, $3, $4)`,
                [estado, uf, paisId, ativo]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, ESTADO_DB_ERROR_LABELS)
    }

    revalidatePath('/estados')
}

export async function salvarEstadoComRetorno(formData: FormData): Promise<{ id: number; estado: string; paisId: number }> {
    const dados = {
        ativo:  formData.get('ativo') === 'true',
        estado: formData.get('estado') as string,
        uf:     formData.get('uf') as string,
        paisId: formData.get('pais_id'),
    }

    const validacao = estadoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const { ativo, estado, uf, paisId } = validacao.data

    try {
        const result = await pool.query<{ id: number; estado: string; paisId: number }>(
            `INSERT INTO tb_estados (estado, uf, "paisId", ativo)
            VALUES ($1, $2, $3, $4)
            RETURNING id, estado, "paisId"`,
            [estado, uf, paisId, ativo]
        )

        revalidatePath('/estados')
        return result.rows[0]
    } catch (error: any) {
        tratarErroDB(error, ESTADO_DB_ERROR_LABELS)
        throw error
    }
}

export async function alternarStatusEstado(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_estados SET ativo = $1, "dataAlteracao" = NOW() WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/estados')
}

export async function excluirEstado(id: number) {
    try {
        await pool.query(`DELETE FROM tb_estados WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, ESTADO_DB_ERROR_LABELS)
    }

    revalidatePath('/estados')
}

/**
 * Lista simplificada (id + estado) usada em selects/lookups.
 * Reaproveitada tanto pela página /estados quanto pelo EstadoForm quando
 * ele é aberto dentro do modal de cadastro rápido (sem SSR disponível).
 */
export async function listarEstadosAtivos(): Promise<EstadoSelect[]> {
    const result = await pool.query<EstadoSelect>(
        `SELECT id, estado FROM tb_estados WHERE ativo = true ORDER BY estado ASC`
    )
    return result.rows
}