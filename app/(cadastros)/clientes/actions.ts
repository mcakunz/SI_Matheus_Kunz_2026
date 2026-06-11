"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { nullableString } from "@/lib/utils/helpers"

const clienteSchema = z.object({
    // Obrigatórios
    cliente:             z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    cpfCnpj:             z.string().min(11, "CPF/CNPJ inválido.").max(14, "CPF/CNPJ inválido."),
    tipo:                z.enum(['F', 'J'], { message: "Tipo de pessoa inválido." }),
    cidadeId:            z.coerce.number().positive("Selecione uma cidade válida."),
    condicaoPagamentoId: z.coerce.number().int().positive("Selecione uma condição de pagamento"),
    limiteCredito:       z.coerce.number().min(0, "O limite de crédito não pode ser negativo."),
    ativo:               z.boolean(),

    // Opcionais
    apelido:             z.string().max(50).nullable().optional(),
    rgInscricaoEstadual: z.string().max(20).nullable().optional(),
    email:               z.string().email("E-mail inválido.").nullable().optional().or(z.literal('')),
    telefone:            z.string().max(15).nullable().optional(),
    cep:                 z.string().max(9).nullable().optional(),
    endereco:            z.string().max(100).nullable().optional(),
    numero:              z.string().max(10).nullable().optional(),
    complemento:         z.string().max(50).nullable().optional(),
    bairro:              z.string().max(50).nullable().optional(),
    dataNascimento:      z.string().nullable().optional(),
    sexo:                z.enum(['M', 'F', 'O']).nullable().optional(),
    observacao:          z.string().max(150).nullable().optional(),
}).superRefine((data, ctx) => {
    const valor = data.rgInscricaoEstadual?.trim() ?? ''
    if (!valor) return

    if (data.tipo === 'F') {
        const digitos = valor.replace(/[^\dXx]/g, '')
        if (!/^\d{6,8}[\dXx]$/.test(digitos)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgInscricaoEstadual'],
                message: "RG inválido. Informe entre 7 e 9 dígitos.",
            })
        }
    } else {
        const apenasAlfanum = valor.replace(/[\s.\-\/]/g, '')
        if (apenasAlfanum.length < 8 || apenasAlfanum.length > 14) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgInscricaoEstadual'],
                message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres.",
            })
        }
    }
})

const CLIENTE_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        cpfCnpj: "este CPF/CNPJ",
    },
    foreignKey: "Este cliente não pode ser excluído pois possui notas fiscais ou contas vinculadas.",
}

export async function salvarCliente(formData: FormData) {
    const dados = {
        cliente:             (formData.get('cliente') as string).trim(),
        cpfCnpj:             (formData.get('cpfCnpj') as string).replace(/\D/g, ''),
        tipo:                formData.get('tipo') as string,
        cidadeId:            formData.get('cidadeId'),
        condicaoPagamentoId: formData.get('condicaoPagamentoId'),
        limiteCredito:       formData.get('limiteCredito'),
        ativo:               formData.get('ativo') === 'true',

        apelido:             nullableString(formData.get('apelido')),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
        email:               nullableString(formData.get('email'))?.toLowerCase(),
        telefone:            nullableString(formData.get('telefone')),
        cep:                 nullableString(formData.get('cep'))?.replace(/\D/g, ''),
        endereco:            nullableString(formData.get('endereco')),
        numero:              nullableString(formData.get('numero')),
        complemento:         nullableString(formData.get('complemento')),
        bairro:              nullableString(formData.get('bairro')),
        dataNascimento:      nullableString(formData.get('dataNascimento')),
        sexo:                nullableString(formData.get('sexo')) as 'M' | 'F' | 'O' | null,
        observacao:          nullableString(formData.get('observacao')),
    }

    const validacao = clienteSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data
    const id = formData.get('id')

    try {
        if (id) {
            await pool.query(
                `UPDATE tb_clientes
                    SET "cliente"             = $1,
                        "cpfCnpj"             = $2,
                        "tipo"                = $3,
                        "cidadeId"            = $4,
                        "condicaoPagamentoId" = $5,
                        "limiteCredito"       = $6,
                        "ativo"               = $7,
                        "apelido"             = $8,
                        "rgInscricaoEstadual" = $9,
                        "email"               = $10,
                        "telefone"            = $11,
                        "cep"                 = $12,
                        "endereco"            = $13,
                        "numero"              = $14,
                        "complemento"         = $15,
                        "bairro"              = $16,
                        "dataNascimento"      = $17,
                        "sexo"                = $18,
                        "observacao"          = $19
                  WHERE id = $20`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId, 
                    v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.email, v.telefone,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao,
                    Number(id)
                ]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_clientes (
                    "cliente", "cpfCnpj", "tipo", "cidadeId",
                    "condicaoPagamentoId", "limiteCredito", "ativo",
                    "apelido", "rgInscricaoEstadual", "email", "telefone",
                    "cep", "endereco", "numero", "complemento", "bairro",
                    "dataNascimento", "sexo", "observacao"
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                    $11,$12,$13,$14,$15,$16,$17,$18,$19
                )`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId,
                    v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.email, v.telefone,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao
                ]
            )
        }
    } catch (error: any) {
        tratarErroDB(error, CLIENTE_DB_ERROR_LABELS)
    }

    revalidatePath('/clientes')
}

export async function alternarStatusCliente(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_clientes SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/clientes')
}

export async function excluirCliente(id: number) {
    try {
        await pool.query(`DELETE FROM tb_clientes WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, CLIENTE_DB_ERROR_LABELS)
    }

    revalidatePath('/clientes')
}
