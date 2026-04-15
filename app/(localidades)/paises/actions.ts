"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const paisSchema = z.object({
    pais: z.string().min(2, "O nome do país deve ter no mínimo 2 caracteres.").max(100, "O nome do país é muito longo."),
    codigo: z.string().min(1, "O código é obrigatório.").max(5, "O código não pode passar de 5 caracteres."),
    sigla: z.string().length(3, "A sigla deve ter exatamente 3 caracteres.").toUpperCase(),
    moeda: z.string().length(3, "A moeda deve ter 3 caracteres."),
    nacionalidade: z.string().min(2, "A nacionalidade é obrigatória.").max(100),
    ativo: z.boolean()
})

export async function salvarPais(formData: FormData) {
    const supabase = await createClient()

    const dados = {
        pais: formData.get('pais') as string,
        codigo: formData.get('codigo') as string,
        sigla: formData.get('sigla') as string,
        moeda: formData.get('moeda') as string, 
        nacionalidade: formData.get('nacionalidade') as string,
        ativo: formData.get('ativo') === 'true',
    }

    const validacao = paisSchema.safeParse(dados)

    if (!validacao.success){
        throw new Error(validacao.error.issues[0].message)
    }

    const id = formData.get('id')

    const { error } = id
        ? await supabase.from('tb_paises').update(validacao.data).eq('id', Number(id))
        : await supabase.from('tb_paises').insert([validacao.data])

    if (error) throw new Error(error.message)

    revalidatePath('/paises')
}

export async function alternarStatusPais(id: number, statusAtual: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tb_paises')
        .update({ ativo: !statusAtual })
        .eq('id', id)
    
    if (error) throw new Error(error.message)
    revalidatePath('/paises')
}

export async function excluirPais(id: number) {
    const supabase = await createClient()
    const { error } = await supabase.from('tb_paises').delete().eq('id', id)    

    if (error) {
        if (error.code === '23503') {
            throw new Error("Este país não pode ser excluído pois exitem estados vinculados a ele.")
        }
        // aqui
        throw new Error(error.message)
    }
    revalidatePath('/paises')
}