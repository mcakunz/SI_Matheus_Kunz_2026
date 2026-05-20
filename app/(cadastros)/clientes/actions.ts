"use server"

import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const clienteSchema = z.object({
    // Obrigatórios
    cliente:             z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    cpfCnpj:             z.string().min(11, "CPF/CNPJ inválido.").max(14, "CPF/CNPJ inválido."),
    tipo:                z.enum(['F', 'J'], { message: "Tipo de pessoa inválido." }),
    cidadeId:            z.coerce.number().positive("Selecione uma cidade válida."),
    paisId:              z.coerce.number().positive("Selecione um país válido."),
    condicaoPagamentoId: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
        z.number().positive().optional()
    ),
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

function nullableString(value: FormDataEntryValue | null): string | null {
    if (!value || (value as string).trim() === '') return null
    return (value as string).trim()
}

export async function salvarCliente(formData: FormData) {
    const dados = {
        cliente:             (formData.get('cliente') as string)?.trim() ?? '',
        cpfCnpj:             ((formData.get('cpfCnpj') as string) ?? '').replace(/\D/g, ''),
        tipo:                formData.get('tipo') as string,
        cidadeId:            formData.get('cidadeId'),
        paisId:              formData.get('paisId'),
        condicaoPagamentoId: formData.get('condicaoPagamentoId'),
        limiteCredito:       formData.get('limiteCredito'),
        ativo:               formData.get('ativo') === 'true',

        apelido:             nullableString(formData.get('apelido')),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
        email:               nullableString(formData.get('email')),
        telefone:            nullableString(formData.get('telefone')),
        cep:                 nullableString(formData.get('cep')),
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
                        "paisId"              = $5,
                        "condicaoPagamentoId" = $6,
                        "limiteCredito"       = $7,
                        "ativo"               = $8,
                        "apelido"             = $9,
                        "rgInscricaoEstadual" = $10,
                        "email"               = $11,
                        "telefone"            = $12,
                        "cep"                 = $13,
                        "endereco"            = $14,
                        "numero"              = $15,
                        "complemento"         = $16,
                        "bairro"              = $17,
                        "dataNascimento"      = $18,
                        "sexo"                = $19,
                        "observacao"          = $20
                  WHERE id = $21`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId, v.paisId,
                    v.condicaoPagamentoId ?? null, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.email, v.telefone,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao,
                    Number(id)
                ]
            )
        } else {
            await pool.query(
                `INSERT INTO tb_clientes (
                    "cliente", "cpfCnpj", "tipo", "cidadeId", "paisId",
                    "condicaoPagamentoId", "limiteCredito", "ativo",
                    "apelido", "rgInscricaoEstadual", "email", "telefone",
                    "cep", "endereco", "numero", "complemento", "bairro",
                    "dataNascimento", "sexo", "observacao"
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                    $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
                )`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId, v.paisId,
                    v.condicaoPagamentoId ?? null, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.email, v.telefone,
                    v.cep, v.endereco, v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao
                ]
            )
        }
    } catch (error: any) {
        if (error.code === '23505') throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.")
        throw new Error(error.message)
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
        throw new Error(error.message)
    }

    revalidatePath('/clientes')
}

export async function excluirCliente(id: number) {
    try {
        await pool.query(`DELETE FROM tb_clientes WHERE id = $1`, [id])
    } catch (error: any) {
        if (error.code === '23503') {
            throw new Error("Este cliente não pode ser excluído pois possui notas fiscais ou contas vinculadas.")
        }
        throw new Error(error.message)
    }

    revalidatePath('/clientes')
}
