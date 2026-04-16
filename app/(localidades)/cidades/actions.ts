"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const cidadeSchema = z.object({
    ativo: z.boolean(),
    cidade: z.string().min(2, "O nome da cidade deve ter no mínimo 2 caracteres.").max(100, "O nome da cidade é muito longo."),
    codigo_ibge: z.string().length(7, "O código IBGE deve ter exatos 7 dígitos."),
    estado_id: z.coerce.number().positive("Selecione um estado válido.")    
})

export async function salvarCidade(formData: FormData) {
    const supabase = await createClient()

    const dados = {
        ativo: formData.get('ativo') === 'true',
        cidade: formData.get('cidade') as string,
        codigo_ibge: formData.get('codigo_ibge') as string, 
        estado_id: formData.get('estado_id') 
    }

    const validacao = cidadeSchema.safeParse(dados)

    if(!validacao.success) {
        throw new Error(validacao.error.issues[0].message)
    }

    const id = formData.get('id')

    const { error } = id
        ? await supabase.from('tb_cidades').update(validacao.data).eq('id', Number(id))
        : await supabase.from('tb_cidades').insert([validacao.data])
    
    if (error) throw new Error(error.message)

    revalidatePath('/cidades') 
}

export async function alternarStatusCidade(id: number, statusAtual: boolean) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('tb_cidades') 
        .update({ ativo: !statusAtual })
        .eq('id', id)

    if (error) throw new Error(error.message)
    
    revalidatePath('/cidades') 
}

export async function excluirCidade(id: number) {
    const supabase = await createClient()
    const { error } = await supabase.from('tb_cidades').delete().eq('id', id) 

    if (error) {
        if (error.code === '23503') {
            throw new Error("Esta cidade não pode ser excluída pois existem clientes, endereços ou registros vinculados a ela.")
        }
        throw new Error(error.message)
    }
    
    revalidatePath('/cidades') 
}