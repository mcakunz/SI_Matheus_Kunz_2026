import { pool } from "@/lib/db"
import { FornecedorView } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import FornecedoresClientTable from "./components/FornecedoresClientTable"

export default async function FornecedoresPage() {
    try {
        const result = await pool.query<FornecedorView>(
            `SELECT
                f.*,
                ci.cidade,
                cp."condicaoPagamento",
                tr."razaoSocialNome"        AS transportadora,
                ep.email               AS "emailPrincipal",
                COUNT(fe.id)::int      AS "totalEmails",
                tp.telefone            AS "telefonePrincipal",
                COUNT(ft.id)::int      AS "totalTelefones"
             FROM tb_fornecedores f
             LEFT JOIN tb_cidades              ci ON ci.id = f."cidadeId"
             LEFT JOIN tb_condicoes_pagamento  cp ON cp.id = f."condicaoPagamentoId"
             LEFT JOIN tb_transportadoras      tr ON tr.id = f."transportadoraId"
             LEFT JOIN tb_fornecedor_email     ep ON ep."fornecedorId" = f.id AND ep.principal = true AND ep.ativo = true
             LEFT JOIN tb_fornecedor_email     fe ON fe."fornecedorId" = f.id AND fe.ativo = true
             LEFT JOIN tb_fornecedor_telefone  tp ON tp."fornecedorId" = f.id AND tp.principal = true AND tp.ativo = true
             LEFT JOIN tb_fornecedor_telefone  ft ON ft."fornecedorId" = f.id AND ft.ativo = true
             GROUP BY f.id, ci.cidade, cp."condicaoPagamento", tr."razaoSocialNome", ep.email, tp.telefone
             ORDER BY f.fornecedor ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os fornecedores cadastrados no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <FornecedoresClientTable fornecedores={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
