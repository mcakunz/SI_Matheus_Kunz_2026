import { pool } from "@/lib/db"
import { CondicaoPagamentoCompleto } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import CondicoesPagamentoClientTable from "./components/CondicaoPagamentoClientTable"

export default async function CondicoesPagamentoPage() {
    try {
        const result = await pool.query<CondicaoPagamentoCompleto>(
            `SELECT
                id,
                "condicaoPagamento",
                "numeroParcelas",
                "diasPrimeiraParcela",
                "diasEntreParcelas",
                "percentualJuros",
                "percentualMulta",
                "percentualDesconto",
                "ativo",
                "dataCadastro",
                "dataAlteracao"
            FROM tb_condicoes_pagamento
            ORDER BY "condicaoPagamento" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Condições de Pagamento</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as condições de pagamento cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <CondicoesPagamentoClientTable condicoes={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}