import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"
import { createClient } from "@/lib/supabase/server"
import { PaisForm } from "../components/PaisForm"

interface PaisPageProps {
    params: Promise<{ id: string }>
}

export default async function PaisPage({ params }: PaisPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    const supabase = await createClient()
    let pais = null

    if (!isNovo) {
        const { data, error } = await supabase
            .from('tb_paises')
            .select('*')
            .eq('id', Number(id))
            .single()

        if (error || !data) return notFound()
        pais = data
    }

    const titulo = isNovo ? "Novo País" : pais!.pais

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link href="/paises" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                    <HiChevronLeft size={16} />
                    Países
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    {isNovo ? "Novo País" : "Editar País"}
                </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
                    {!isNovo && pais && (
                        <p className="text-sm text-slate-400 mt-1">
                            ID #{pais.id} · {pais.sigla} · {pais.codigo}
                        </p>
                    )}
                </div>

                <PaisForm pais={pais} />
            </div>
        </div>
    )
}
