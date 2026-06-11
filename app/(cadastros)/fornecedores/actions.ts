"use server"

import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { validarRG, validarIE } from "@/lib/utils/validacoes"
import { nullableString,parseJsonField } from "@/lib/utils/helpers"
import { DBErrorLabels, tratarErroDB } from "@/components/errors"

const FORNECEDOR_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        cpfCnpj: "este CPF/CNPJ",
    },
    foreignKey: "Este fornecedor não pode ser excluído pois possui produtos ou contas vinculadas.",
}

const fornecedorEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'FISCAL', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const fornecedorTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'CELULAR', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const fornecedorSchema = z.object({
    fornecedor:          z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    cpfCnpj:             z.string().min(11, "CPF/CNPJ inválido.").max(14),
    tipo:                z.enum(['F', 'J'], { message: "Tipo de pessoa inválido." }),
    cidadeId:            z.coerce.number().positive("Selecione uma cidade válida."),
    condicaoPagamentoId: z.coerce.number().int().positive("Selecione uma condição de pagamento."),
    limiteCredito:       z.coerce.number().min(0, "O limite de crédito não pode ser negativo."),
    ativo:               z.boolean(),

    apelido:             z.string().max(50).nullable().optional(),
    rgInscricaoEstadual: z.string().max(20).nullable().optional(),
    cep:                 z.string().max(9).nullable().optional(),
    endereco:            z.string().max(100).nullable().optional(),
    numero:              z.string().max(10).nullable().optional(),
    complemento:         z.string().max(50).nullable().optional(),
    bairro:              z.string().max(50).nullable().optional(),
    transportadoraId:    z.coerce.number().int().positive().nullable().optional(),
    observacoes:         z.string().max(150).nullable().optional(),
}).superRefine((data, ctx) => {
    const valor = data.rgInscricaoEstadual?.trim() ?? ''
    if (!valor) return

if (data.tipo === 'F') {
    if (!validarRG(valor)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rgInscricaoEstadual'],
            message: "RG inválido. Informe entre 7 e 9 dígitos.",
        })
    }
} else {
    if (!validarIE(valor)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rgInscricaoEstadual'],
            message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres.",
        })
    }
}
})

export async function salvarFornecedor(formData: FormData) {
    const dados = {
        fornecedor:          (formData.get('fornecedor') as string).trim(),
        cpfCnpj:             (formData.get('cpfCnpj') as string).replace(/\D/g, ''),
        tipo:                formData.get('tipo') as string,
        cidadeId:            formData.get('cidadeId'),
        condicaoPagamentoId: formData.get('condicaoPagamentoId'),
        limiteCredito:       formData.get('limiteCredito'),
        ativo:               formData.get('ativo') === 'true',

        apelido:             nullableString(formData.get('apelido')),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
        cep:                 nullableString(formData.get('cep'))?.replace(/\D/g, ''),
        endereco:            nullableString(formData.get('endereco')),
        numero:              nullableString(formData.get('numero')),
        complemento:         nullableString(formData.get('complemento')),
        bairro:              nullableString(formData.get('bairro')),
        transportadoraId:    formData.get('transportadoraId')
                                ? Number(formData.get('transportadoraId'))
                                : null,
        observacoes:         nullableString(formData.get('observacoes')),
    }

    const validacao = fornecedorSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)
    
    const v = validacao.data
    const id = formData.get('id')

    const emails    = parseJsonField(formData.get('emails'),    z.array(fornecedorEmailSchema))
    const telefones = parseJsonField(formData.get('telefones'), z.array(fornecedorTelefoneSchema))

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        let fornecedorId: number

        if (id) {
            fornecedorId = Number(id)
            await client.query(
                `UPDATE tb_fornecedores
                    SET "fornecedor"          = $1,
                        "cpfCnpj"             = $2,
                        "tipo"                = $3,
                        "cidadeId"            = $4,
                        "condicaoPagamentoId" = $5,
                        "limiteCredito"       = $6,
                        "ativo"               = $7,
                        "apelido"             = $8,
                        "rgInscricaoEstadual" = $9,
                        "cep"                 = $10,
                        "endereco"            = $11,
                        "numero"              = $12,
                        "complemento"         = $13,
                        "bairro"              = $14,
                        "transportadoraId"    = $15,
                        "observacoes"         = $16
                WHERE id = $17`,
                [
                    v.fornecedor, v.cpfCnpj, v.tipo, v.cidadeId,
                    v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.cep, v.endereco,
                    v.numero, v.complemento, v.bairro, v.transportadoraId ?? null,
                    v.observacoes, fornecedorId
                ]
            )
        } else {
            const res = await client.query<{ id: number }>(
                `INSERT INTO tb_fornecedores (
                    "fornecedor", "cpfCnpj", "tipo", "cidadeId",
                    "condicaoPagamentoId", "limiteCredito", "ativo",
                    "apelido", "rgInscricaoEstadual", "cep", "endereco",
                    "numero", "complemento", "bairro", "transportadoraId", "observacoes"
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
                ) RETURNING id`,
                [
                    v.fornecedor, v.cpfCnpj, v.tipo, v.cidadeId,
                    v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.cep, v.endereco,
                    v.numero, v.complemento, v.bairro, v.transportadoraId ?? null,
                    v.observacoes
                ]
            )
            fornecedorId = res.rows[0].id
        }

        await client.query(
            `DELETE FROM tb_fornecedor_email WHERE "fornecedorId" = $1`,
            [fornecedorId]
        )
        for (const email of emails) {
            await client.query(
                `INSERT INTO tb_fornecedor_email
                    ("fornecedorId", "email", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [fornecedorId, email.email.toLowerCase().trim(), email.tipo, email.principal, email.ativo]
            )
        }

        await client.query(
            `DELETE FROM tb_fornecedor_telefone WHERE "fornecedorId" = $1`,
            [fornecedorId]
        )
        for (const tel of telefones) {
            await client.query(
                `INSERT INTO tb_fornecedor_telefone
                    ("fornecedorId", "telefone", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [fornecedorId, tel.telefone, tel.tipo, tel.principal, tel.ativo]
        )
    }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
            tratarErroDB(error, FORNECEDOR_DB_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/fornecedores')
}


export async function alternarStatusFornecedor(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_fornecedores SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/fornecedores')
}

export async function excluirFornecedor(id: number) {
    try {
        await pool.query(`DELETE FROM tb_fornecedores WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, FORNECEDOR_DB_ERROR_LABELS)
    }

    revalidatePath('/fornecedores')
}
