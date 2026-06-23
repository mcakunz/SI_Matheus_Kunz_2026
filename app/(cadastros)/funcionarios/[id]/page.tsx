import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import {
    FuncionarioView, CidadeSelect, PaisSelect, EstadoSelect,
    FuncaoFuncionarioSelect, FuncionarioEmail, FuncionarioTelefone,
} from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { FuncionarioForm } from "../components/FuncionarioForm"

interface FuncionarioPageProps {
    params: Promise<{ id: string }>
}

export default async function FuncionarioPage({ params }: FuncionarioPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const [cidadesResult, estadosResult, paisesResult, funcoesResult] = await Promise.all([
            pool.query<CidadeSelect>(
                `SELECT id, cidade, "estadoId" FROM tb_cidades WHERE ativo = true ORDER BY cidade ASC`),
            pool.query<EstadoSelect>(
                `SELECT id, estado, "paisId" FROM tb_estados WHERE ativo = true ORDER BY estado ASC`),
            pool.query<PaisSelect>(
                `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`),
            pool.query<FuncaoFuncionarioSelect>(
                `SELECT id, "funcaoFuncionario", "requerCnh" FROM tb_funcoes_funcionario WHERE ativo = true ORDER BY "funcaoFuncionario" ASC`),
        ])

        let funcionario: FuncionarioView | null = null
        let emails: FuncionarioEmail[] = []
        let telefones: FuncionarioTelefone[] = []

        if (!isNovo) {
            const [funcionarioResult, emailsResult, telefonesResult] = await Promise.all([
                pool.query<FuncionarioView>(
                    `SELECT
                        f.*,
                        ci.cidade,
                        ff."funcaoFuncionario",
                        ff."requerCnh"
                    FROM tb_funcionarios f
                    LEFT JOIN tb_cidades ci             ON ci.id = f."cidadeId"
                    LEFT JOIN tb_funcoes_funcionario ff ON ff.id = f."funcaoFuncionarioId"
                    WHERE f.id = $1`, [Number(id)]
                ),
                pool.query<FuncionarioEmail>(
                    `SELECT * FROM tb_funcionario_email WHERE "funcionarioId" = $1 ORDER BY id`, [Number(id)]
                ),
                pool.query<FuncionarioTelefone>(
                    `SELECT * FROM tb_funcionario_telefone WHERE "funcionarioId" = $1 ORDER BY id`, [Number(id)]
                ),
            ])

            if (!funcionarioResult.rows[0]) return notFound()
            funcionario = funcionarioResult.rows[0]
            emails      = emailsResult.rows
            telefones   = telefonesResult.rows
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/funcionarios" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Funcionários
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Novo Funcionário" : "Editar Funcionário"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Novo Funcionário" : funcionario!.funcionario}
                        </h1>
                        {!isNovo && funcionario && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{funcionario.id} · {funcionario.cpfCnpj}
                            </p>
                        )}
                    </div>

                    <FuncionarioForm
                        funcionario={funcionario}
                        emailsIniciais={emails}
                        telefonesIniciais={telefones}
                        listaCidades={cidadesResult.rows}
                        listaEstados={estadosResult.rows}
                        listaPaises={paisesResult.rows}
                        listaFuncoes={funcoesResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}