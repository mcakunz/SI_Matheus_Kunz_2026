import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"
import { pool } from "@/lib/db"
import { EstadoComPais, PaisSelect } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { EstadoForm } from "../components/EstadoForm"

interface EstadoPageProps {
    params: Promise<{ id: string }>
}

export default async function EstadoPage({ params }: EstadoPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const paisesResult = await pool.query<PaisSelect>(
            `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`
        )

        let estado: EstadoComPais | null = null

        if (!isNovo) {
            const result = await pool.query<EstadoComPais>(
                `SELECT e.*, p.pais
                   FROM tb_estados e
                   LEFT JOIN tb_paises p ON p.id = e."paisId"
                  WHERE e.id = $1`,
                [Number(id)]
            )

            if (!result.rows[0]) return notFound()
            estado = result.rows[0]
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
                                ID #{estado.id} · {estado.uf} · {estado.pais}
                            </p>
                        )}
                    </div>

                    <EstadoForm
                        estado={estado}
                        listaPaises={paisesResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
