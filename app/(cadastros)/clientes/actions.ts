"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { number, z } from "zod"

const clienteSchema = z.object({
    // Obrigatorios
    cliente:                z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(150),
    cpf_cnpj:               z.string().min(11, "CPF/CNPJ inválido.").max(14, "CPF/CNPJ inválido."),
    tipo:                   z.enum(['F', 'J'], { message: "Tipo de pessoa inválido."}),
    cidade_id:              z.coerce.number().positive("Selecione uma cidade válida."),
    pais_id:                z.coerce.number().positive("Selecione um país válido."),
    //condicao_pagamento_id:  z.coerce.number().positive("Selecione uma condição de pagamento."),
    condicao_pagamento_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
),
    limite_credito:         z.coerce.number().min(0, "O limite de crédito não pode ser negativo."),
    ativo:                  z.boolean(),

    // Opcionais
    apelido:                z.string().max(60).nullable().optional(),
    rg_inscricao_estadual:  z.string().max(20).nullable().optional(),
    email:                  z.string().email("E-mail inválido.").nullable().optional().or(z.literal('')),
    telefone:               z.string().max(20).nullable().optional(),
    cep:                    z.string().max(9).nullable().optional(),
    endereco:               z.string().max(200).nullable().optional(),
    numero:                 z.string().max(10).nullable().optional(),
    complemento:            z.string().max(100).nullable().optional(),
    bairro:                 z.string().max(50).nullable().optional(),
    data_nascimento:        z.string().nullable().optional(),
    sexo:                   z.enum(['M', 'F', 'O']).nullable().optional(),
    observacao:             z.string().max(255).nullable().optional(),
})

function nullableString(value: FormDataEntryValue | null): string | null {
    if (!value || (value as string).trim() === '') return null
    return (value as string).trim()
}

export async function salvarCliente(formData: FormData) {
    const supabase = await createClient()

    const dados = {
        cliente:                (formData.get('cliente') as string)?.trim() ?? '',
        cpf_cnpj:               ((formData.get('cpf_cnpj') as string) ?? '').replace(/\D/g, ''),
        tipo:                   formData.get('tipo') as string,
        cidade_id:              formData.get('cidade_id'),
        pais_id:                formData.get('pais_id'),
        condicao_pagamento_id:  formData.get('condicao_pagamento_id'),
        limite_credito:         formData.get('limite_credito'),
        ativo:                  formData.get('ativo') === 'true',

        apelido:                nullableString(formData.get('apelido')),
        rg_inscricao_estadual:  nullableString(formData.get('rg_inscricao_estadual')),
        email:                  nullableString(formData.get('email')),
        telefone:               nullableString(formData.get('telefone')),
        cep:                    nullableString(formData.get('cep')),
        endereco:               nullableString(formData.get('endereco')),
        numero:                 nullableString(formData.get('numero')),
        complemento:            nullableString(formData.get('complemento')),
        bairro:                 nullableString(formData.get('bairro')),
        data_nascimento:        nullableString(formData.get('data_nascimento')),
        sexo:                   nullableString(formData.get('sexo')) as 'M' | 'F' | 'O' | null,
        observacao:             nullableString(formData.get('observacao')),
    }

    const validacao = clienteSchema.safeParse(dados)

    if (!validacao.success){
        throw new Error(validacao.error.issues[0].message)
    }

    const id = formData.get('id')

    const { error } = id
        ? await supabase.from('tb_clientes').update(validacao.data).eq('id', Number(id))
        : await supabase.from('tb_clientes').insert([validacao.data])
    
    if (error) {
        if (error.code === '23505') throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.")
            throw new Error(error.message)
    }

    revalidatePath('/clientes')
}

export async function alternarStatusCliente(id: number, statusAtual: boolean) {
    const supabase = await createClient()
 
    const { error } = await supabase
        .from('tb_clientes')
        .update({ ativo: !statusAtual })
        .eq('id', id)
 
    if (error) throw new Error(error.message)
 
    revalidatePath('/clientes')
}

export async function excluirCliente(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tb_clientes')
        .delete()
        .eq('id', id)
    
    if (error) {
        if (error.code === '23503') {
            throw new Error("Este cliente não pode ser excluído pois possui notas fiscais ou contas vinculadas.")
        }
        throw new Error(error.message)
    }

    revalidatePath('/clientes')
}
