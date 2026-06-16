import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { UnidadeMedida } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { UnidadeMedidaForm } from "../components/UnidadeMedidaForm"

interface UnidadeMedidaPageProps {
    params: Promise<{ id: string }>
}

export default async function UnidadeMedidaPage({ params }: UnidadeMedidaPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        let unidade: UnidadeMedida | null = null

        if (!isNovo) {
            const result = await pool.query<UnidadeMedida>(
                `SELECT * FROM tb_unidades_medida WHERE id = $1`,
                [Number(id)]
            )
            if (!result.rows[0]) return notFound()
            unidade = result.rows[0]
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/unidades-medida" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Unidades de Medida
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Unidade de Medida" : "Editar Unidade de Medida"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Unidade de Medida" : unidade!.unidadeMedida}
                        </h1>
                        {!isNovo && unidade && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{unidade.id}
                            </p>
                        )}
                    </div>

                    <UnidadeMedidaForm unidade={unidade} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}