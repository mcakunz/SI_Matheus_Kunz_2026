import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { CondicaoPagamentoCompleto, ParcelaCondicao, FormaPagamentoSelect } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { CondicaoPagamentoForm } from "../components/CondicaoPagamentoForm"

interface CondicaoPagamentoPageProps {
    params: Promise<{ id: string }>
}

export default async function CondicaoPagamentoPage({ params }: CondicaoPagamentoPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const formasPagamentoResult = await pool.query<FormaPagamentoSelect>(
            `SELECT id, "formaPagamento" FROM tb_formas_pagamento WHERE ativo = true ORDER BY "formaPagamento" ASC`
        )

        let condicao: CondicaoPagamentoCompleto | null = null
        let parcelas: ParcelaCondicao[] = []

        if (!isNovo) {
            const condicaoResult = await pool.query<CondicaoPagamentoCompleto>(
                `SELECT * FROM tb_condicoes_pagamento WHERE id = $1`,
                [Number(id)]
            )
            if (!condicaoResult.rows[0]) return notFound()
            condicao = condicaoResult.rows[0]

            const parcelasResult = await pool.query<ParcelaCondicao>(
                `SELECT
                    p.*,
                    fp."formaPagamento"
                 FROM tb_parcelas_condicao_pagamento p
                 JOIN tb_formas_pagamento fp ON fp.id = p."formaPagamentoId"
                 WHERE p."condicaoPagamentoId" = $1
                 ORDER BY p.numero ASC`,
                [Number(id)]
            )
            parcelas = parcelasResult.rows
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="condicoes-pagamento" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Condições de Pagamento
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Condição" : "Editar Condição"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Condição de Pagamento" : condicao!.condicaoPagamento}
                        </h1>
                        {!isNovo && condicao && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{condicao.id} · {condicao.numeroParcelas}x parcela(s)
                            </p>
                        )}
                    </div>

                    <CondicaoPagamentoForm
                        condicao={condicao}
                        parcelas={parcelas}
                        listaFormasPagamento={formasPagamentoResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
