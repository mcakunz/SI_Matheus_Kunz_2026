import { pool } from "@/lib/db"
import { FuncaoFuncionario } from "@/lib/types"
import { ErrorLoadingData }  from "@/components/ui/ErrorLoadingData"
import FuncoesFuncionariosClientTable    from "./components/FuncoesFuncionariosClientTable"

export default async function FuncoesFuncionariosPage() {
    try {
        const result = await pool.query<FuncaoFuncionario>(
            `SELECT * FROM tb_funcoes_funcionario ORDER BY "funcaoFuncionario" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Funções de Funcionário</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as funções e cargos disponíveis para os funcionários.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <FuncoesFuncionariosClientTable funcoes={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}