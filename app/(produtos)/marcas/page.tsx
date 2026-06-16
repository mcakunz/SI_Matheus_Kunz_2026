import { pool } from "@/lib/db"
import { Marca } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import MarcaClientTable from "./components/MarcasClientTable"

export default async function MarcaPage() {
    try {
        const result = await pool.query<Marca>(
            `SELECT
                id,
                "marca",
                "ativo",
                "dataCadastro",
                "dataAlteracao"
            FROM tb_marcas
            ORDER BY "marca" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Marcas</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as marcas cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <MarcaClientTable marcas={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}