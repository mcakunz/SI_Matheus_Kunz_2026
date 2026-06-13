"use server"

import { DBErrorLabels, tratarErroDB } from "@/components/errors"
import { pool } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { nullableString, parseJsonField } from "@/lib/utils/helpers"

const clienteEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'FISCAL', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const clienteTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'CELULAR', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const clienteSchema = z.object({
    cliente:             z.string().min(2).max(100),
    cpfCnpj:             z.string().min(11).max(14),
    tipo:                z.enum(['F', 'J']),
    cidadeId:            z.coerce.number().positive(),
    condicaoPagamentoId: z.coerce.number().int().positive().nullable().optional(),
    limiteCredito:       z.coerce.number().min(0),
    ativo:               z.boolean(),
    apelido:             z.string().max(50).nullable().optional(),
    rgInscricaoEstadual: z.string().max(20).nullable().optional(),
    cep:                 z.string().max(9).nullable().optional(),
    endereco:            z.string().max(100).nullable().optional(),
    numero:              z.string().max(10).nullable().optional(),
    complemento:         z.string().max(50).nullable().optional(),
    bairro:              z.string().max(50).nullable().optional(),
    dataNascimento:      z.string().nullable().optional(),
    sexo:                z.enum(['M', 'F', 'O']).nullable().optional(),
    observacao:          z.string().max(150).nullable().optional(),
})

const CLIENTE_DB_ERROR_LABELS: DBErrorLabels = {
    unique: { cpfCnpj: "este CPF/CNPJ" },
    foreignKey: "Este cliente não pode ser excluído pois possui notas fiscais ou contas vinculadas.",
}

export async function salvarCliente(formData: FormData) {
    const dados = {
        cliente:             (formData.get('cliente') as string).trim(),
        cpfCnpj:             (formData.get('cpfCnpj') as string).replace(/\D/g, ''),
        tipo:                formData.get('tipo') as string,
        cidadeId:            formData.get('cidadeId'),
        condicaoPagamentoId: formData.get('condicaoPagamentoId') || null,
        limiteCredito:       formData.get('limiteCredito'),
        ativo:               formData.get('ativo') === 'true',
        apelido:             nullableString(formData.get('apelido')),
        rgInscricaoEstadual: nullableString(formData.get('rgInscricaoEstadual')),
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

    const emails    = parseJsonField(formData.get('emails'),    z.array(clienteEmailSchema))
    const telefones = parseJsonField(formData.get('telefones'), z.array(clienteTelefoneSchema))

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        let clienteId: number

        if (id) {
            clienteId = Number(id)
            await client.query(
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
                        "cep"                 = $10,
                        "endereco"            = $11,
                        "numero"              = $12,
                        "complemento"         = $13,
                        "bairro"              = $14,
                        "dataNascimento"      = $15,
                        "sexo"                = $16,
                        "observacao"          = $17
                  WHERE id = $18`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId,
                    v.condicaoPagamentoId ?? null, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.cep, v.endereco,
                    v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao, clienteId
                ]
            )
        } else {
            const res = await client.query<{ id: number }>(
                `INSERT INTO tb_clientes (
                    "cliente", "cpfCnpj", "tipo", "cidadeId",
                    "condicaoPagamentoId", "limiteCredito", "ativo",
                    "apelido", "rgInscricaoEstadual", "cep", "endereco",
                    "numero", "complemento", "bairro",
                    "dataNascimento", "sexo", "observacao"
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                RETURNING id`,
                [
                    v.cliente, v.cpfCnpj, v.tipo, v.cidadeId,
                    v.condicaoPagamentoId ?? null, v.limiteCredito, v.ativo,
                    v.apelido, v.rgInscricaoEstadual, v.cep, v.endereco,
                    v.numero, v.complemento, v.bairro,
                    v.dataNascimento, v.sexo, v.observacao
                ]
            )
            clienteId = res.rows[0].id
        }

        await client.query(
            `DELETE FROM tb_cliente_email WHERE "clienteId" = $1`, [clienteId]
        )
        for (const email of emails) {
            await client.query(
                `INSERT INTO tb_cliente_email ("clienteId", "email", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [clienteId, email.email.toLowerCase().trim(), email.tipo, email.principal, email.ativo]
            )
        }

        await client.query(
            `DELETE FROM tb_cliente_telefone WHERE "clienteId" = $1`, [clienteId]
        )
        for (const tel of telefones) {
            await client.query(
                `INSERT INTO tb_cliente_telefone ("clienteId", "telefone", "tipo", "principal", "ativo")
                 VALUES ($1, $2, $3, $4, $5)`,
                [clienteId, tel.telefone, tel.tipo, tel.principal, tel.ativo]
            )
        }

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        tratarErroDB(error, CLIENTE_DB_ERROR_LABELS)
    } finally {
        client.release()
    }

    revalidatePath('/clientes')
}

export async function alternarStatusCliente(id: number, statusAtual: boolean) {
    try {
        await pool.query(`UPDATE tb_clientes SET "ativo" = $1 WHERE id = $2`, [!statusAtual, id])
    } catch (error: any) { tratarErroDB(error) }
    revalidatePath('/clientes')
}

export async function excluirCliente(id: number) {
    try {
        await pool.query(`DELETE FROM tb_clientes WHERE id = $1`, [id])
    } catch (error: any) { tratarErroDB(error, CLIENTE_DB_ERROR_LABELS) }
    revalidatePath('/clientes')
}