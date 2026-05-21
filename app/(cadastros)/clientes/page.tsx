import { pool } from "@/lib/db"
import { ClienteCompleto } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import ClientesClientTable from "./components/ClientesClientTable"

export default async function ClientesPage() {
    try {
        const result = await pool.query<ClienteCompleto>(
            `SELECT
                c.*,
                ci.cidade,
                p.pais,
                cp."condicaoPagamento"
             FROM tb_clientes c
             LEFT JOIN tb_cidades ci           ON ci.id = c."cidadeId"
             LEFT JOIN tb_paises p             ON p.id  = c."paisId"
             LEFT JOIN tb_condicoes_pagamento cp ON cp.id = c."condicaoPagamentoId"
             ORDER BY c.cliente ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os clientes cadastrados no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <ClientesClientTable clientes={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
