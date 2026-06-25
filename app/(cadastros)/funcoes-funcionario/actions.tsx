"use server"

import { DBErrorLabels, tratarErroDB } from "@/lib/utils/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { nullableString } from "@/lib/utils/helpers"

const funcaoFuncionarioSchema = z.object({
    funcaoFuncionario: z.string().min(2, "A função deve ter no mínimo 2 caracteres.").max(100),
    descricao:         z.string().max(255).nullable().optional(),
    salarioBase:       z.coerce.number().min(0, "Salário base inválido."),
    cargaHoraria:      z.coerce.number().int().min(1, "Informe a carga horária.").max(744),
    requerCnh:         z.boolean(),
    observacao:        z.string().max(150).nullable().optional(),
    ativo:             z.boolean(),
})

const FUNCAO_DB_ERROR_LABELS: DBErrorLabels = {
    unique: { funcaoFuncionario: "esta função" },
    foreignKey: "Esta função não pode ser excluída pois possui vínculos com funcionários cadastrados.",
}

export async function salvarFuncaoFuncionario(formData: FormData) {
    const dados = {
        funcaoFuncionario: (formData.get('funcaoFuncionario') as string).trim(),
        descricao:         nullableString(formData.get('descricao')),
        salarioBase:       formData.get('salarioBase'),
        cargaHoraria:      formData.get('cargaHoraria'),
        requerCnh:         formData.get('requerCnh') === 'true',
        observacao:        nullableString(formData.get('observacao')),
        ativo:             formData.get('ativo') === 'true',
    }

    const validacao = funcaoFuncionarioSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v  = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_funcoes_funcionario
                    SET "funcaoFuncionario" = $1,
                        "descricao"         = $2,
                        "salarioBase"       = $3,
                        "cargaHoraria"      = $4,
                        "requerCnh"         = $5,
                        "observacao"        = $6,
                        "ativo"             = $7
                  WHERE id = $8`,
                [v.funcaoFuncionario, v.descricao, v.salarioBase, v.cargaHoraria,
                 v.requerCnh, v.observacao, v.ativo, Number(id)]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_funcoes_funcionario
                    ("funcaoFuncionario", "descricao", "salarioBase", "cargaHoraria", "requerCnh", "observacao", "ativo")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [v.funcaoFuncionario, v.descricao, v.salarioBase, v.cargaHoraria,
                 v.requerCnh, v.observacao, v.ativo]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, FUNCAO_DB_ERROR_LABELS)
    }

    revalidatePath('/funcoes-funcionario')
}

export async function alternarStatusFuncaoFuncionario(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_funcoes_funcionario SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) { tratarErroDB(error) }
    revalidatePath('/funcoes-funcionario')
}

export async function excluirFuncaoFuncionario(id: number) {
    try {
        await pool.query(`DELETE FROM tb_funcoes_funcionario WHERE id = $1`, [id])
    } catch (error: any) { tratarErroDB(error, FUNCAO_DB_ERROR_LABELS) }
    revalidatePath('/funcoes-funcionario')
}