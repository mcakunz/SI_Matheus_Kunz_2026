import { pool } from "@/lib/db"
import { FuncionarioView } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import FuncionariosClientTable from "./components/FuncionariosClientTable"

export default async function FuncionariosPage() {
    try {
        const result = await pool.query<FuncionarioView>(
            `SELECT
                f.*,
                ci.cidade,
                ff."funcaoFuncionario",
                ff."requerCnh"
            FROM tb_funcionarios f
            LEFT JOIN tb_cidades ci             ON ci.id = f."cidadeId"
            LEFT JOIN tb_funcoes_funcionario ff ON ff.id = f."funcaoFuncionarioId"
            ORDER BY f.funcionario ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Funcionários</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os funcionários cadastrados no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <FuncionariosClientTable funcionarios={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}