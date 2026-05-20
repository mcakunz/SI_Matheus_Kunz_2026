import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"
import { pool } from "@/lib/db"
import { CidadeComEstado, EstadoSelect } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { CidadeForm } from "../components/CidadeForm"

interface CidadePageProps {
    params: Promise<{ id: string }>
}

export default async function CidadePage({ params }: CidadePageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const estadosResult = await pool.query<EstadoSelect>(
            `SELECT id, estado FROM tb_estados WHERE ativo = true ORDER BY estado ASC`
        )

        let cidade: CidadeComEstado | null = null

        if (!isNovo) {
            const result = await pool.query<CidadeComEstado>(
                `SELECT c.*, e.estado
                   FROM tb_cidades c
                   LEFT JOIN tb_estados e ON e.id = c."estadoId"
                  WHERE c.id = $1`,
                [Number(id)]
            )

            if (!result.rows[0]) return notFound()
            cidade = result.rows[0]
        }

        const titulo = isNovo ? "Nova Cidade" : cidade!.cidade

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/cidades" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Cidades
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Cidade" : "Editar Cidade"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
                        {!isNovo && cidade && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{cidade.id} · IBGE: {cidade.codigoIbge} · {cidade.estado}
                            </p>
                        )}
                    </div>

                    <CidadeForm
                        cidade={cidade}
                        listaEstados={estadosResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
