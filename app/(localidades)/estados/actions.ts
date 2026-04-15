"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const estadoSchema = z.object({
    ativo: z.boolean(),
    estado: z.string().min(2, "O nome do estado deve ter no mínimo 2 caracteres.").max(100, "O nome do estado é muito longo."),
    uf: z.string().length(2, "A UF deve ter exatamente 2 caracteres.").toUpperCase(),
    pais_id: z.coerce.number().positive("Selecione um país válido.")    
})

export async function salvarEstado(formData: FormData) {
    const supabase = await createClient()

    const dados = {
        ativo: formData.get('ativo') === 'true',
        estado: formData.get('estado') as string,
        uf: formData.get('uf') as string,
        pais_id: formData.get('pais_id') 
    }

    const validacao = estadoSchema.safeParse(dados)

    if(!validacao.success) {
        throw new Error(validacao.error.issues[0].message)
    }

    const id = formData.get('id')

    const { error } = id
        ? await supabase.from('tb_estados').update(validacao.data).eq('id', Number(id))
        : await supabase.from('tb_estados').insert([validacao.data])
    
    if (error) throw new Error(error.message)

    revalidatePath('/estados')

}

export async function alternarStatusEstado(id: number, statusAtual: boolean) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('tb_estados')
        .update({ ativo: !statusAtual })
        .eq('id', id)

    if (error) throw new Error(error.message)
    
    revalidatePath('/estados')
}

export async function excluirEstado(id: number) {
    const supabase = await createClient()
    const { error } = await supabase.from('tb_estados').delete().eq('id', id)

    if (error) {
        if (error.code === '23503') {
            throw new Error("Este estado não pode ser excluido pois existem cidades vinculados a ele")
        }
        throw new Error(error.message)
    }
    

    revalidatePath('/estados')
}

