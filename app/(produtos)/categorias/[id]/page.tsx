import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { Categoria } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { CategoriaForm } from "../components/CategoriaForm"

interface CategoriaPageProps {
    params: Promise<{ id: string }>
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

        try {
            let categoria: Categoria | null = null

            if (!isNovo) {
                const result = await pool.query<Categoria>(
                    `SELECT * FROM tb_categorias WHERE id = $1`,
                    [Number(id)]
                )
                if (!result.rows[0]) return notFound()
                categoria = result.rows[0]
            }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/categorias" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Categorias
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Categoria" : "Editar Categoria"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Categoria" : categoria!.categoria}
                        </h1>
                        {!isNovo && categoria && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{categoria.id}
                            </p>
                        )}
                    </div>

                    <CategoriaForm categoria={categoria} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
