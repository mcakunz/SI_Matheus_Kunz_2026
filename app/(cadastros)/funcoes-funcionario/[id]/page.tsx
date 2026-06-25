import Link       from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { FuncaoFuncionario } from "@/lib/types"
import { ErrorLoadingData }  from "@/components/ui/ErrorLoadingData"
import { FuncaoFuncionarioForm } from "../components/FuncaoFuncionarioForm"

interface FuncaoFuncionarioPageProps {
    params: Promise<{ id: string }>
}

export default async function FuncaoFuncionarioPage({ params }: FuncaoFuncionarioPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        let funcao: FuncaoFuncionario | null = null

        if (!isNovo) {
            const result = await pool.query<FuncaoFuncionario>(
                `SELECT * FROM tb_funcoes_funcionario WHERE id = $1`, [Number(id)]
            )
            if (!result.rows[0]) return notFound()
            funcao = result.rows[0]
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/funcoes-funcionario" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Funções de Funcionário
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Função" : "Editar Função"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Função" : funcao!.funcaoFuncionario}
                        </h1>
                        {!isNovo && funcao && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{funcao.id}
                            </p>
                        )}
                    </div>

                    <FuncaoFuncionarioForm funcao={funcao} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}