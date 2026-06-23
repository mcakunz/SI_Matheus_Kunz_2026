import { pool } from "@/lib/db"
import { FormaPagamento } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import FormaPagamentoClientTable from "./components/FormaPagamentoClientTable"

export default async function FormasPagamentoPage() {
    try {
        const result = await pool.query<FormaPagamento>(
            `SELECT
                id,
                "formaPagamento",
                "descricao",
                "ativo",
                "dataCadastro",
                "dataAlteracao"
            FROM tb_formas_pagamento
            ORDER BY "formaPagamento" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Formas de Pagamento</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as formas de pagamento cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <FormaPagamentoClientTable formas={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}