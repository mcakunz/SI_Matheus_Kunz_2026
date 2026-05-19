import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"
import { createClient } from "@/lib/supabase/server"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { EstadoForm } from "../components/EstadoForm"

interface EstadoPageProps {
    params: Promise<{ id: string }>
}

export default async function EstadoPage({ params }: EstadoPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    const supabase = await createClient()
    let estado = null

    const { data: paises, error: errPaises } = await supabase
        .from('tb_paises')
        .select('id, pais')
        .eq('ativo', true)
        .order('pais', { ascending: true })

    if (errPaises) return <ErrorLoadingData message={errPaises.message} />

    if (!isNovo) {
        const { data, error } = await supabase
            .from('tb_estados')
            .select('*, tb_paises(pais)')
            .eq('id', Number(id))
            .single()

        if (error || !data) return notFound()
        estado = data
    }

    const titulo = isNovo ? "Novo Estado" : estado!.estado

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link href="/estados" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                    <HiChevronLeft size={16} />
                    Estados
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                    {isNovo ? "Novo Estado" : "Editar Estado"}
                </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
                    {!isNovo && estado && (
                        <p className="text-sm text-slate-400 mt-1">
                            ID #{estado.id} · {estado.uf} · {estado.tb_paises?.pais}
                        </p>
                    )}
                </div>

                <EstadoForm 
                    estado={estado} 
                    listaPaises={paises || []} 
                />
            </div>
        </div>
    )
}