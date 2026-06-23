import Link             from "next/link"
import { notFound }     from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool }            from "@/lib/db"
import { Veiculo }         from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { VeiculoForm }     from "../components/VeiculoForm"

interface VeiculoPageProps {
    params: Promise<{ id: string }>
}

export default async function VeiculoPage({ params }: VeiculoPageProps) {
    const { id }  = await params
    const isNovo  = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        let veiculo: Veiculo | null = null

        if (!isNovo) {
            const result = await pool.query<Veiculo>(
                `SELECT * FROM tb_veiculos WHERE id = $1`,
                [Number(id)]
            )
            if (!result.rows[0]) return notFound()
            veiculo = result.rows[0]
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/veiculos" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Veículos
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Novo Veículo" : "Editar Veículo"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Novo Veículo" : `${veiculo!.marca} ${veiculo!.modelo}`}
                        </h1>
                        {!isNovo && veiculo && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{veiculo.id} · Placa {veiculo.placa}
                            </p>
                        )}
                    </div>

                    <VeiculoForm veiculo={veiculo} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}