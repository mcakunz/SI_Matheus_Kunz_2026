import Link from "next/link"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { CidadeSelect, PaisSelect, CondicaoPagamentoSelect } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { ClienteForm } from "./components/ClienteForm"
export default async function NovoClientePage() {
    try {
        const [cidadesResult, paisesResult, condicoesResult] = await Promise.all([
            pool.query<CidadeSelect>(
                `SELECT id, cidade FROM tb_cidades WHERE ativo = true ORDER BY cidade ASC`
            ),
            pool.query<PaisSelect>(
                `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`
            ),
            pool.query<CondicaoPagamentoSelect>(
                `SELECT id, "condicaoPagamento" FROM tb_condicoes_pagamento WHERE ativo = true ORDER BY "condicaoPagamento" ASC`
            ),
        ])

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/clientes" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Clientes
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">Novo Cliente</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-8">Novo Cliente</h1>
                    <ClienteForm
                        listaCidades={cidadesResult.rows}
                        listaPaises={paisesResult.rows}
                        listaCondicoes={condicoesResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
