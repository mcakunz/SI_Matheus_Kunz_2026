import { pool } from "@/lib/db"
import { Categoria } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import CategoriaClientTable from "./components/CategoriasClientTable"

export default async function CategoriaPage() {
    try {
        const result = await pool.query<Categoria>(
            `SELECT
                id,
                "categoria",
                "ativo",
                "dataCadastro",
                "dataAlteracao"
            FROM tb_categorias
            ORDER BY "categoria" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as categorias cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <CategoriaClientTable categorias={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}