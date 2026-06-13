import { pool } from "@/lib/db"
import { ClienteView } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import ClientesClientTable from "./components/ClientesClientTable"

export default async function ClientesPage() {
    try {
        const result = await pool.query<ClienteView>(
            `SELECT
                c.*,
                ci.cidade,
                cp."condicaoPagamento",
                e.email    AS "emailPrincipal",
                t.telefone AS "telefonePrincipal"
            FROM tb_clientes c
            LEFT JOIN tb_cidades ci             ON ci.id = c."cidadeId"
            LEFT JOIN tb_condicoes_pagamento cp  ON cp.id = c."condicaoPagamentoId"
            LEFT JOIN tb_cliente_email e         ON e."clienteId" = c.id AND e.principal = true AND e.ativo = true
            LEFT JOIN tb_cliente_telefone t      ON t."clienteId" = c.id AND t.principal = true AND t.ativo = true
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
