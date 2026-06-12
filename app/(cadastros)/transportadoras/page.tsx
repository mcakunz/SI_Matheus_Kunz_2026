import { pool } from "@/lib/db"
import { TransportadoraView } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import TransportadorasClientTable from "./components/TransportadorasClientTable"

export default async function TransportadorasPage() {
    try {
        const result = await pool.query<TransportadoraView>(
            `SELECT
                t.*,
                ci.cidade,
                cp."condicaoPagamento",
                ep.email               AS "emailPrincipal",
                COUNT(te.id)::int      AS "totalEmails",
                tp.telefone            AS "telefonePrincipal",
                COUNT(tt.id)::int      AS "totalTelefones"
             FROM tb_transportadoras t
             LEFT JOIN tb_cidades             ci ON ci.id = t."cidadeId"
             LEFT JOIN tb_condicoes_pagamento  cp ON cp.id = t."condicaoPagamentoId"
             -- email principal
             LEFT JOIN tb_transportadora_email ep ON ep."transportadoraId" = t.id AND ep.principal = true AND ep.ativo = true
             -- total de emails ativos
             LEFT JOIN tb_transportadora_email te ON te."transportadoraId" = t.id AND te.ativo = true
             -- telefone principal
             LEFT JOIN tb_transportadora_telefone tp ON tp."transportadoraId" = t.id AND tp.principal = true AND tp.ativo = true
             -- total de telefones ativos
             LEFT JOIN tb_transportadora_telefone tt ON tt."transportadoraId" = t.id AND tt.ativo = true
             GROUP BY t.id, ci.cidade, cp."condicaoPagamento", ep.email, tp.telefone
             ORDER BY t."razaoSocial" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Transportadoras</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie as transportadoras cadastradas no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <TransportadorasClientTable transportadoras={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}