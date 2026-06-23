"use server"

import { pool }            from "@/lib/db"
import { revalidatePath }  from "next/cache"
import { z }               from "zod"

import { validarCNPJ, validarRG, validarIE } from "@/lib/utils/validacoes"
import { nullableString, parseJsonField }     from "@/lib/utils/helpers"
import { DBErrorLabels, tratarErroDB }        from "@/lib/utils/errors"

const TRANSPORTADORA_DB_ERROR_LABELS: DBErrorLabels = {
    unique: {
        cnpj: "este CNPJ",
    },
    foreignKey: "Esta transportadora não pode ser excluída pois possui vínculos com fornecedores ou outros registros.",
}

const transportadoraEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'FISCAL']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const transportadoraTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const transportadoraVeiculoSchema = z.object({
    veiculoId: z.coerce.number().int().positive("Selecione um veículo válido."),
})

const transportadoraSchema = z.object({
    razaoSocial:           z.string().min(2, "A razão social deve ter no mínimo 2 caracteres.").max(100),
    nomeFantasiaApelido:   z.string().max(80).nullable().optional(),
    cnpj:                  z.string().min(11, "CNPJ inválido.").max(14),
    tipo:                  z.enum(['F', 'J'], { message: "Tipo de pessoa inválido." }),
    cidadeId:              z.coerce.number().positive("Selecione uma cidade válida."),
    condicaoPagamentoId:   z.coerce.number().int().positive("Selecione uma condição de pagamento."),
    limiteCredito:         z.coerce.number().min(0, "O limite de crédito não pode ser negativo."),
    ativo:                 z.boolean(),

    rgIe:                  z.string().max(20).nullable().optional(),
    cep:                   z.string().max(9).nullable().optional(),
    endereco:              z.string().max(100).nullable().optional(),
    numero:                z.string().max(10).nullable().optional(),
    complemento:           z.string().max(50).nullable().optional(),
    bairro:                z.string().max(50).nullable().optional(),
    observacoes:           z.string().max(150).nullable().optional(),
}).superRefine((data, ctx) => {
    const valor = data.rgIe?.trim() ?? ''
    if (!valor) return

    if (data.tipo === 'F') {
        if (!validarRG(valor)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgIe'],
                message: "RG inválido. Informe entre 7 e 9 dígitos.",
            })
        }
    } else {
        if (!validarIE(valor)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgIe'],
                message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres.",
            })
        }
    }
})

function parseDadosTransportadora(formData: FormData) {
    return {
        razaoSocial:           (formData.get('razaoSocial') as string).trim(),
        nomeFantasiaApelido:   nullableString(formData.get('nomeFantasiaApelido')),
        cnpj:                  (formData.get('cnpj') as string).replace(/\D/g, ''),
        tipo:                  formData.get('tipo') as string,
        cidadeId:              formData.get('cidadeId'),
        condicaoPagamentoId:   formData.get('condicaoPagamentoId'),
        limiteCredito:         formData.get('limiteCredito'),
        ativo:                 formData.get('ativo') === 'true',

        rgIe:                  nullableString(formData.get('rgIe')),
        cep:                   nullableString(formData.get('cep'))?.replace(/\D/g, ''),
        endereco:              nullableString(formData.get('endereco')),
        numero:                nullableString(formData.get('numero')),
        complemento:           nullableString(formData.get('complemento')),
        bairro:                nullableString(formData.get('bairro')),
        observacoes:           nullableString(formData.get('observacoes')),
    }
}

export async function salvarTransportadora(formData: FormData) {
    const dados     = parseDadosTransportadora(formData)
    const validacao = transportadoraSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v  = validacao.data
    const id = formData.get('id')

    const emails    = parseJsonField(formData.get('emails'),    z.array(transportadoraEmailSchema))
    const telefones = parseJsonField(formData.get('telefones'), z.array(transportadoraTelefoneSchema))
    const veiculos  = parseJsonField(formData.get('veiculos'),  z.array(transportadoraVeiculoSchema))

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        let transportadoraId: number

        if (id) {
            transportadoraId = Number(id)
            await client.query(
                `UPDATE tb_transportadoras
                    SET "razaoSocial"         = $1,
                        "nomeFantasiaApelido" = $2,
                        "cnpj"                = $3,
                        "tipo"                = $4,
                        "cidadeId"            = $5,
                        "condicaoPagamentoId" = $6,
                        "limiteCredito"       = $7,
                        "ativo"               = $8,
                        "rgIe"                = $9,
                        "cep"                 = $10,
                        "endereco"            = $11,
                        "numero"              = $12,
                        "complemento"         = $13,
                        "bairro"              = $14,
                        "observacoes"         = $15
                  WHERE id = $16`,
                [
                    v.razaoSocial, v.nomeFantasiaApelido ?? null, v.cnpj, v.tipo,
                    v.cidadeId, v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.rgIe ?? null, v.cep ?? null, v.endereco ?? null,
                    v.numero ?? null, v.complemento ?? null, v.bairro ?? null,
                    v.observacoes ?? null, transportadoraId,
                ]
            )
        } else {
            const res = await client.query<{ id: number }>(
                `INSERT INTO tb_transportadoras (
                    "razaoSocial", "nomeFantasiaApelido", "cnpj", "tipo",
                    "cidadeId", "condicaoPagamentoId", "limiteCredito", "ativo",
                    "rgIe", "cep", "endereco", "numero", "complemento", "bairro", "observacoes"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING id`,
                [
                    v.razaoSocial, v.nomeFantasiaApelido ?? null, v.cnpj, v.tipo,
                    v.cidadeId, v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                    v.rgIe ?? null, v.cep ?? null, v.endereco ?? null,
                    v.numero ?? null, v.complemento ?? null, v.bairro ?? null,
                    v.observacoes ?? null,
                ]
            )
            transportadoraId = res.rows[0].id
        }

        await client.query(
            `DELETE FROM tb_transportadora_email WHERE "transportadoraId" = $1`,
            [transportadoraId]
        )
        for (const email of emails) {
            await client.query(
                `INSERT INTO tb_transportadora_email
                    ("transportadoraId", "email", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [transportadoraId, email.email.toLowerCase().trim(), email.tipo, email.principal, email.ativo]
            )
        }

        await client.query(
            `DELETE FROM tb_transportadora_telefone WHERE "transportadoraId" = $1`,
            [transportadoraId]
        )
        for (const tel of telefones) {
            await client.query(
                `INSERT INTO tb_transportadora_telefone
                    ("transportadoraId", "telefone", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [transportadoraId, tel.telefone, tel.tipo, tel.principal, tel.ativo]
            )
        }

        await client.query(
            `DELETE FROM tb_transportadora_veiculo WHERE "transportadoraId" = $1`,
            [transportadoraId]
        )
        for (const v of veiculos) {
            await client.query(
                `INSERT INTO tb_transportadora_veiculo ("transportadoraId", "veiculoId")
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [transportadoraId, v.veiculoId]
            )
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, TRANSPORTADORA_DB_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/transportadoras')
}

export async function salvarTransportadoraComRetorno(
    formData: FormData
): Promise<{ id: number; razaoSocial: string }> {
    const dados     = parseDadosTransportadora(formData)
    const validacao = transportadoraSchema.safeParse(dados)
    if (!validacao.success) throw new Error(validacao.error.issues[0].message)

    const v = validacao.data

    const emails    = parseJsonField(formData.get('emails'),    z.array(transportadoraEmailSchema))
    const telefones = parseJsonField(formData.get('telefones'), z.array(transportadoraTelefoneSchema))
    const veiculos  = parseJsonField(formData.get('veiculos'),  z.array(transportadoraVeiculoSchema))

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const res = await client.query<{ id: number; razaoSocial: string }>(
            `INSERT INTO tb_transportadoras (
                "razaoSocial", "nomeFantasiaApelido", "cnpj", "tipo",
                "cidadeId", "condicaoPagamentoId", "limiteCredito", "ativo",
                "rgIe", "cep", "endereco", "numero", "complemento", "bairro", "observacoes"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING id, "razaoSocial"`,
            [
                v.razaoSocial, v.nomeFantasiaApelido ?? null, v.cnpj, v.tipo,
                v.cidadeId, v.condicaoPagamentoId, v.limiteCredito, v.ativo,
                v.rgIe ?? null, v.cep ?? null, v.endereco ?? null,
                v.numero ?? null, v.complemento ?? null, v.bairro ?? null,
                v.observacoes ?? null,
            ]
        )
        const transportadoraId = res.rows[0].id

        for (const email of emails) {
            await client.query(
                `INSERT INTO tb_transportadora_email
                    ("transportadoraId", "email", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [transportadoraId, email.email.toLowerCase().trim(), email.tipo, email.principal, email.ativo]
            )
        }

        for (const tel of telefones) {
            await client.query(
                `INSERT INTO tb_transportadora_telefone
                    ("transportadoraId", "telefone", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [transportadoraId, tel.telefone, tel.tipo, tel.principal, tel.ativo]
            )
        }

        for (const v of veiculos) {
            await client.query(
                `INSERT INTO tb_transportadora_veiculo ("transportadoraId", "veiculoId")
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [transportadoraId, v.veiculoId]
            )
        }

        await client.query('COMMIT')
        revalidatePath('/transportadoras')
        return res.rows[0]
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, TRANSPORTADORA_DB_ERROR_LABELS)
        throw error // satisfaz o TypeScript (tratarErroDB já lança)
    } finally {
        client.release()
    }
}

export async function alternarStatusTransportadora(id: number, statusAtual: boolean) {
    try {
        await pool.query(
            `UPDATE tb_transportadoras SET "ativo" = $1 WHERE id = $2`,
            [!statusAtual, id]
        )
    } catch (error: any) {
        tratarErroDB(error)
    }

    revalidatePath('/transportadoras')
}

export async function excluirTransportadora(id: number) {
    try {
        await pool.query(`DELETE FROM tb_transportadoras WHERE id = $1`, [id])
    } catch (error: any) {
        tratarErroDB(error, TRANSPORTADORA_DB_ERROR_LABELS)
    }

    revalidatePath('/transportadoras')
}