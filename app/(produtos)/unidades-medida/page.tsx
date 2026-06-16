import { pool } from "@/lib/db"
import { UnidadeMedida } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import UnidadeMedidaClientTable from "./components/UnidadesMedidaClientTable"

export default async function UnidadeMedidaPage() {
    try {
        const result = await pool.query<UnidadeMedida>(
            `SELECT
                id,
                "unidadeMedida",
                "ativo",
                "dataCadastro",
                "dataAlteracao"
            FROM tb_unidades_medida
            ORDER BY "unidadeMedida" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Unidades de Medida</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as unidades de medida cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <UnidadeMedidaClientTable unidades={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}