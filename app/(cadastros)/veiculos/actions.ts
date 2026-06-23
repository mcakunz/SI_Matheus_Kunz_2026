"use server"

import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"

const VEICULO_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        placa: "esta placa",
    },
    foreignKey: "Este veículo não pode ser excluído pois está vinculado a uma ou mais transportadoras.",
}

const veiculoSchema = z.object({
    placa:      z.string()
                  .min(7, "Placa inválida.")
                  .max(8)
                  .regex(
                      /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/,
                      "Placa inválida. Informe no formato AAA0000 (padrão) ou AAA0A00 (Mercosul)."
                  ),
    modelo:     z.string().min(2, "O modelo deve ter no mínimo 2 caracteres.").max(50),
    marca:      z.string().min(2, "A marca deve ter no mínimo 2 caracteres.").max(50),
    ano:        z.coerce.number()
                  .int("Ano inválido.")
                  .min(1900, "Ano inválido.")
                  .max(new Date().getFullYear() + 1, `Ano não pode ser maior que ${new Date().getFullYear() + 1}.`),
    capacidade: z.coerce.number().min(0, "A capacidade não pode ser negativa.").nullable().optional(),
    ativo:      z.boolean(),
})

function parseDadosVeiculo(formData: FormData) {
    return {
        placa:      (formData.get('placa') as string).toUpperCase().replace(/[^A-Z0-9]/g, ''),
        modelo:     (formData.get('modelo') as string).trim(),
        marca:      (formData.get('marca') as string).trim(),
        ano:        formData.get('ano'),
        capacidade: formData.get('capacidade') || null,
        ativo:      formData.get('ativo') === 'true',
    }
}

export async function salvarVeiculo(formData: FormData) {
    const dados    = parseDadosVeiculo(formData)
    const validacao = veiculoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v  = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_veiculos
                    SET "placa"      = $1,
                        "modelo"     = $2,
                        "marca"      = $3,
                        "ano"        = $4,
                        "capacidade" = $5,
                        "ativo"      = $6
                 WHERE id = $7`,
                [v.placa, v.modelo, v.marca, v.ano, v.capacidade ?? null, v.ativo, Number(id)]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_veiculos ("placa", "modelo", "marca", "ano", "capacidade", "ativo")
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [v.placa, v.modelo, v.marca, v.ano, v.capacidade ?? null, v.ativo]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, VEICULO_DB_ERROR_LABELS)
    }

    revalidatePath('/veiculos')
}

export async function salvarVeiculoComRetorno(
    formData: FormData
): Promise<{ id: number; placa: string; modelo: string; marca: string }> {
    const dados     = parseDadosVeiculo(formData)
    const validacao = veiculoSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data

    try {
        const res = await pool.query<{ id: number; placa: string; modelo: string; marca: string }>(
            `INSERT INTO tb_veiculos ("placa", "modelo", "marca", "ano", "capacidade", "ativo")
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, "placa", "modelo", "marca"`,
            [v.placa, v.modelo, v.marca, v.ano, v.capacidade ?? null, v.ativo]
        )

        revalidatePath('/veiculos')
        return res.rows[0]
    } catch (error: any) {
        tratarErroDB(error, VEICULO_DB_ERROR_LABELS)
        throw error  
    }
}

export async function alternarStatusVeiculo(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_veiculos SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/veiculos')
}

export async function excluirVeiculo(id: number) {
    try {
        await pool.query(`DELETE FROM tb_veiculos WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, VEICULO_DB_ERROR_LABELS)
    }

    revalidatePath('/veiculos')
}