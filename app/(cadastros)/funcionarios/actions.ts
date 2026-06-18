"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { nullableString } from "@/lib/utils/helpers"

const funcionarioSchema = z.object({
    funcionario:          z.string().min(2).max(100),
    apelido:              z.string().max(50).nullable().optional(),
    cpfCnpj:              z.string().min(11).max(14),
    rgInscricaoEstadual:  z.string().max(20).nullable().optional(),
    telefone:             z.string().min(10, "Telefone inválido.").max(15),
    email:                z.string().email("E-mail inválido.").max(80),
    cep:                  z.string().min(8, "CEP inválido.").max(9),
    endereco:             z.string().min(1, "Informe o endereço.").max(100),
    numero:               z.string().min(1, "Informe o número.").max(10),
    complemento:          z.string().max(50).nullable().optional(),
    bairro:               z.string().min(1, "Informe o bairro.").max(50),
    cidadeId:             z.coerce.number().positive(),
    funcaoFuncionarioId:  z.coerce.number().int().positive(),
    dataNascimento:       z.string().min(1, "Informe a data de nascimento."),
    dataAdmissao:         z.string().min(1, "Informe a data de admissão."),
    dataDemissao:         z.string().nullable().optional(),
    cnh:                  z.string().max(11).nullable().optional(),
    dataValidadeCnh:      z.string().nullable().optional(),
    sexo:                 z.enum(['M', 'F', 'O']),
    salario:              z.coerce.number().min(0),
    tipo:                 z.enum(['INTERNO', 'EXTERNO', 'TERCEIRIZADO']),
    observacao:           z.string().max(150).nullable().optional(),
    ativo:                z.boolean(),
}).superRefine((data, ctx) => {
    if (data.dataDemissao && data.dataDemissao < data.dataAdmissao) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dataDemissao'],
            message: "A data de demissão não pode ser anterior à data de admissão.",
        })
    }
})

const FUNCIONARIO_DB_ERROR_LABELS: DBErrorLabels = {
    unique: { cpfCnpj: "este CPF/CNPJ" },
    foreignKey: "Este funcionário não pode ser excluído pois possui vínculos com outros registros.",
}

export async function salvarFuncionario(formData: FormData) {
    const dados = {
        funcionario:         (formData.get('funcionario') as string).trim(),
        apelido:             nullableString(formData.get('apelido')),
        cpfCnpj:             (formData.get('cpfCnpj') as string).replace(/\D/g, ''),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
        telefone:            (formData.get('telefone') as string).replace(/\D/g, ''),
        email:               (formData.get('email') as string).trim().toLowerCase(),
        cep:                 (formData.get('cep') as string).replace(/\D/g, ''),
        endereco:            formData.get('endereco') as string,
        numero:              formData.get('numero') as string,
        complemento:         nullableString(formData.get('complemento')),
        bairro:              formData.get('bairro') as string,
        cidadeId:            formData.get('cidadeId'),
        funcaoFuncionarioId: formData.get('funcaoFuncionarioId'),
        dataNascimento:      formData.get('dataNascimento'),
        dataAdmissao:        formData.get('dataAdmissao'),
        dataDemissao:        nullableString(formData.get('dataDemissao')),
        cnh:                 nullableString(formData.get('cnh')),
        dataValidadeCnh:     nullableString(formData.get('dataValidadeCnh')),
        sexo:                formData.get('sexo') as string,
        salario:             formData.get('salario'),
        tipo:                formData.get('tipo') as string,
        observacao:          nullableString(formData.get('observacao')),
        ativo:               formData.get('ativo') === 'true',
    }

    const validacao = funcionarioSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_funcionarios
                    SET "funcionario"          = $1,
                        "apelido"              = $2,
                        "cpfCnpj"              = $3,
                        "rgInscricaoEstadual"  = $4,
                        "telefone"             = $5,
                        "email"                = $6,
                        "cep"                  = $7,
                        "endereco"             = $8,
                        "numero"               = $9,
                        "complemento"          = $10,
                        "bairro"               = $11,
                        "cidadeId"             = $12,
                        "funcaoFuncionarioId"  = $13,
                        "dataNascimento"       = $14,
                        "dataAdmissao"         = $15,
                        "dataDemissao"         = $16,
                        "cnh"                  = $17,
                        "dataValidadeCnh"      = $18,
                        "sexo"                 = $19,
                        "salario"              = $20,
                        "tipo"                 = $21,
                        "observacao"           = $22,
                        "ativo"                = $23
                  WHERE id = $24`,
                [
                    v.funcionario, v.apelido, v.cpfCnpj, v.rgInscricaoEstadual,
                    v.telefone, v.email, v.cep, v.endereco, v.numero,
                    v.complemento, v.bairro, v.cidadeId, v.funcaoFuncionarioId,
                    v.dataNascimento, v.dataAdmissao, v.dataDemissao ?? null,
                    v.cnh, v.dataValidadeCnh ?? null, v.sexo, v.salario,
                    v.tipo, v.observacao, v.ativo, Number(id)
                ]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_funcionarios (
                    "funcionario", "apelido", "cpfCnpj", "rgInscricaoEstadual",
                    "telefone", "email", "cep", "endereco", "numero",
                    "complemento", "bairro", "cidadeId", "funcaoFuncionarioId",
                    "dataNascimento", "dataAdmissao", "dataDemissao",
                    "cnh", "dataValidadeCnh", "sexo", "salario",
                    "tipo", "observacao", "ativo"
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
                [
                    v.funcionario, v.apelido, v.cpfCnpj, v.rgInscricaoEstadual,
                    v.telefone, v.email, v.cep, v.endereco, v.numero,
                    v.complemento, v.bairro, v.cidadeId, v.funcaoFuncionarioId,
                    v.dataNascimento, v.dataAdmissao, v.dataDemissao ?? null,
                    v.cnh, v.dataValidadeCnh ?? null, v.sexo, v.salario,
                    v.tipo, v.observacao, v.ativo
                ]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, FUNCIONARIO_DB_ERROR_LABELS)
    }

    revalidatePath('/funcionarios')
}

export async function alternarStatusFuncionario(id: number, statusAtual: boolean) {
    try {
        await pool.query(`UPDATE tb_funcionarios SET "ativo" = $1 WHERE id = $2`, [!statusAtual, id])
    } catch (error: any) { tratarErroDB(error) }
    revalidatePath('/funcionarios')
}

export async function excluirFuncionario(id: number) {
    try {
        await pool.query(`DELETE FROM tb_funcionarios WHERE id = $1`, [id])
    } catch (error: any) { tratarErroDB(error, FUNCIONARIO_DB_ERROR_LABELS) }
    revalidatePath('/funcionarios')
}