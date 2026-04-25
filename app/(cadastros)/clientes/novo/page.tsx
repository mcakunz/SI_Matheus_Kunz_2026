import Link from "next/link"
import { HiChevronLeft } from "react-icons/hi"
import { createClient } from "@/lib/supabase/server"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { ClienteForm } from "../components/ClienteForm"

export default async function NovoClientePage() {
    const supabase = await createClient()

    const [
        { data: cidades,   error: errCidades },
        { data: paises,    error: errPaises },
        { data: condicoes, error: errCondicoes },
    ] = await Promise.all([
        supabase.from('tb_cidades').select('id, cidade').eq('ativo', true).order('cidade'),
        supabase.from('tb_paises').select('id, pais').eq('ativo', true).order('pais'),
        supabase.from('tb_condicoes_pagamento').select('id, condicao_pagamento').eq('ativo', true).order('condicao_pagamento'),
    ])

    if (errCidades)   return <ErrorLoadingData message={errCidades.message} />
    if (errPaises)    return <ErrorLoadingData message={errPaises.message} />
    if (errCondicoes) return <ErrorLoadingData message={errCondicoes.message} />

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link href="/clientes" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                    <HiChevronLeft size={16} />
                    Clientes
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">Novo Cliente</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-8">Novo Cliente</h1>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <ClienteForm
                    listaCidades={cidades || []}
                    listaPaises={paises || []}
                    listaCondicoes={condicoes || []}
                />
            </div>
        </div>
    )
}
