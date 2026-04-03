"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

    const id = formData.get('id')

    const { error } = id
        ? await supabase.from('tb_paises').update(dados).eq('id', Number(id))
        : await supabase.from('tb_paises').insert([dados])

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