"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { nullableString } from "@/lib/utils/helpers"

const funcionarioEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['PESSOAL', 'CORPORATIVO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const funcionarioTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['PESSOAL', 'CORPORATIVO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const funcionarioSchema = z.object({
    funcionario:          z.string().min(2).max(100),
    apelido:              z.string().max(50).nullable().optional(),
    cpfCnpj:              z.string().min(11).max(14),
    rgInscricaoEstadual:  z.string().max(20).nullable().optional(),
    emails:               z.array(funcionarioEmailSchema),
    telefones:            z.array(funcionarioTelefoneSchema),
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

    const emailsPrincipais = data.emails.filter(e => e.principal).length
    if (emailsPrincipais > 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['emails'],
            message: "Apenas um e-mail pode ser marcado como principal.",
        })
    }

    const telPrincipais = data.telefones.filter(t => t.principal).length
    if (telPrincipais > 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['telefones'],
            message: "Apenas um telefone pode ser marcado como principal.",
        })
    }
})

const FUNCIONARIO_DB_ERROR_LABELS: DBErrorLabels = {
    unique: { cpfCnpj: "este CPF/CNPJ" },
    foreignKey: "Este funcionário não pode ser excluído pois possui vínculos com outros registros.",
}

export async function salvarFuncionario(formData: FormData) {
    const emails    = JSON.parse(formData.get('emails')    as string ?? '[]')
    const telefones = JSON.parse(formData.get('telefones') as string ?? '[]')

    const dados = {
        funcionario:         (formData.get('funcionario') as string).trim(),
        apelido:             nullableString(formData.get('apelido')),
        cpfCnpj:             (formData.get('cpfCnpj') as string).replace(/\D/g, ''),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
        emails,
        telefones,
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

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        if (id) {
            await client.query(
                `UPDATE tb_funcionarios
                    SET "funcionario"          = $1,
                        "apelido"              = $2,
                        "cpfCnpj"              = $3,
                        "rgInscricaoEstadual"  = $4,
                        "cep"                  = $5,
                        "endereco"             = $6,
                        "numero"               = $7,
                        "complemento"          = $8,
                        "bairro"               = $9,
                        "cidadeId"             = $10,
                        "funcaoFuncionarioId"  = $11,
                        "dataNascimento"       = $12,
                        "dataAdmissao"         = $13,
                        "dataDemissao"         = $14,
                        "cnh"                  = $15,
                        "dataValidadeCnh"      = $16,
                        "sexo"                 = $17,
                        "salario"              = $18,
                        "tipo"                 = $19,
                        "observacao"           = $20,
                        "ativo"                = $21
                  WHERE id = $22`,
                [
                    v.funcionario, v.apelido, v.cpfCnpj, v.rgInscricaoEstadual,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.cidadeId, v.funcaoFuncionarioId,
                    v.dataNascimento, v.dataAdmissao, v.dataDemissao ?? null,
                    v.cnh, v.dataValidadeCnh ?? null,
                    v.sexo, v.salario, v.tipo, v.observacao, v.ativo,
                    Number(id)
                ]
            )

            const emailIdsEnviados = v.emails.filter(e => e.id).map(e => e.id!)
            if (emailIdsEnviados.length > 0) {
                await client.query(
                    `DELETE FROM tb_funcionario_email
                      WHERE "funcionarioId" = $1 AND id <> ALL($2::int[])`,
                    [Number(id), emailIdsEnviados]
                )
            } else {
                await client.query(
                    `DELETE FROM tb_funcionario_email WHERE "funcionarioId" = $1`,
                    [Number(id)]
                )
            }

            for (const email of v.emails) {
                if (email.id) {
                    await client.query(
                        `UPDATE tb_funcionario_email
                            SET "email" = $1, "tipo" = $2, "principal" = $3, "ativo" = $4
                          WHERE id = $5`,
                        [email.email, email.tipo, email.principal, email.ativo, email.id]
                    )
                } else {
                    await client.query(
                        `INSERT INTO tb_funcionario_email ("funcionarioId","email","tipo","principal","ativo")
                         VALUES ($1,$2,$3,$4,$5)`,
                        [Number(id), email.email, email.tipo, email.principal, email.ativo]
                    )
                }
            }

            const telefoneIdsEnviados = v.telefones.filter(t => t.id).map(t => t.id!)
            if (telefoneIdsEnviados.length > 0) {
                await client.query(
                    `DELETE FROM tb_funcionario_telefone
                      WHERE "funcionarioId" = $1 AND id <> ALL($2::int[])`,
                    [Number(id), telefoneIdsEnviados]
                )
            } else {
                await client.query(
                    `DELETE FROM tb_funcionario_telefone WHERE "funcionarioId" = $1`,
                    [Number(id)]
            )
            }

            for (const tel of v.telefones) {
                if (tel.id) {
                    await client.query(
                        `UPDATE tb_funcionario_telefone
                            SET "telefone" = $1, "tipo" = $2, "principal" = $3, "ativo" = $4
                          WHERE id = $5`,
                        [tel.telefone, tel.tipo, tel.principal, tel.ativo, tel.id]
                    )
                } else {
                    await client.query(
                        `INSERT INTO tb_funcionario_telefone ("funcionarioId","telefone","tipo","principal","ativo")
                         VALUES ($1,$2,$3,$4,$5)`,
                        [Number(id), tel.telefone, tel.tipo, tel.principal, tel.ativo]
                    )
                }
            }

        } else {
            const res = await client.query<{ id: number }>(
                `INSERT INTO tb_funcionarios (
                    "funcionario", "apelido", "cpfCnpj", "rgInscricaoEstadual",
                    "cep", "endereco", "numero", "complemento", "bairro",
                    "cidadeId", "funcaoFuncionarioId",
                    "dataNascimento", "dataAdmissao", "dataDemissao",
                    "cnh", "dataValidadeCnh", "sexo", "salario",
                    "tipo", "observacao", "ativo"
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
                [
                    v.funcionario, v.apelido, v.cpfCnpj, v.rgInscricaoEstadual,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.cidadeId, v.funcaoFuncionarioId,
                    v.dataNascimento, v.dataAdmissao, v.dataDemissao ?? null,
                    v.cnh, v.dataValidadeCnh ?? null, v.sexo, v.salario,
                    v.tipo, v.observacao, v.ativo
                ]
            )

            const novoId = res.rows[0].id

            for (const email of v.emails) {
                await client.query(
                    `INSERT INTO tb_funcionario_email ("funcionarioId","email","tipo","principal","ativo")
                     VALUES ($1,$2,$3,$4,$5)`,
                    [novoId, email.email, email.tipo, email.principal, email.ativo]
                )
            }

            for (const tel of v.telefones) {
                await client.query(
                    `INSERT INTO tb_funcionario_telefone ("funcionarioId","telefone","tipo","principal","ativo")
                     VALUES ($1,$2,$3,$4,$5)`,
                    [novoId, tel.telefone, tel.tipo, tel.principal, tel.ativo]
                )
            }
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, FUNCIONARIO_DB_ERROR_LABELS)
    } finally {
        client.release()
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