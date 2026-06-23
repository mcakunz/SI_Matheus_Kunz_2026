import { pool }             from "@/lib/db"
import { Veiculo }           from "@/lib/types"
import { ErrorLoadingData }  from "@/components/ui/ErrorLoadingData"
import VeiculosClientTable   from "./components/VeiculosClientTable"

export default async function VeiculosPage() {
    try {
        const result = await pool.query<Veiculo>(
            `SELECT * FROM tb_veiculos ORDER BY marca ASC, modelo ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Veículos</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os veículos cadastrados no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <VeiculosClientTable veiculos={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}