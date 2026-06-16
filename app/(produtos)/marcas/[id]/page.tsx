import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { Marca } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { MarcaForm } from "../components/MarcaForm"

interface MarcaPageProps {
    params: Promise<{ id: string }>
}

export default async function MarcaPage({ params }: MarcaPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        let marca: Marca | null = null

        if (!isNovo) {
            const result = await pool.query<Marca>(
                `SELECT * FROM tb_marcas WHERE id = $1`,
                [Number(id)]
            )
            if (!result.rows[0]) return notFound()
            marca = result.rows[0]
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/marcas" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Marcas
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Marca" : "Editar Marca"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Marca" : marca!.marca}
                        </h1>
                        {!isNovo && marca && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{marca.id}
                            </p>
                        )}
                    </div>

                    <MarcaForm marca={marca} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}