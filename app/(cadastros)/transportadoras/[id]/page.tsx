import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import {
    TransportadoraView,
    TransportadoraEmail,
    TransportadoraTelefone,
    CidadeSelect,
    PaisSelect,
    EstadoSelect,
    CondicaoPagamentoSelect,
} from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { TransportadoraForm
    
 } from "../components/TransportadoraForm"
interface TransportadoraPageProps {
    params: Promise<{ id: string }>
}

export default async function TransportadoraPage({ params }: TransportadoraPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const [cidadesResult, estadosResult, paisesResult, condicoesResult] = await Promise.all([
            pool.query<CidadeSelect>(
                `SELECT id, cidade, "estadoId" FROM tb_cidades WHERE ativo = true ORDER BY cidade ASC`
            ),
            pool.query<EstadoSelect>(
                `SELECT id, estado, "paisId" FROM tb_estados WHERE ativo = true ORDER BY estado ASC`
            ),
            pool.query<PaisSelect>(
                `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`
            ),
            pool.query<CondicaoPagamentoSelect>(
                `SELECT id, "condicaoPagamento" FROM tb_condicoes_pagamento WHERE ativo = true ORDER BY "condicaoPagamento" ASC`
            ),
        ])

        let transportadora: TransportadoraView | null = null
        let emails:         TransportadoraEmail[]     = []
        let telefones:      TransportadoraTelefone[]  = []

        if (!isNovo) {
            const [transportadoraResult, emailsResult, telefonesResult] = await Promise.all([
                pool.query<TransportadoraView>(
                    `SELECT
                        t.*,
                        ci.cidade,
                        cp."condicaoPagamento",
                        NULL::text AS "emailPrincipal",
                        0          AS "totalEmails",
                        NULL::text AS "telefonePrincipal",
                        0          AS "totalTelefones"
                     FROM tb_transportadoras t
                     LEFT JOIN tb_cidades             ci ON ci.id = t."cidadeId"
                     LEFT JOIN tb_condicoes_pagamento cp ON cp.id = t."condicaoPagamentoId"
                     WHERE t.id = $1`,
                    [Number(id)]
                ),
                pool.query<TransportadoraEmail>(
                    `SELECT * FROM tb_transportadora_email
                     WHERE "transportadoraId" = $1
                     ORDER BY principal DESC, id ASC`,
                    [Number(id)]
                ),
                pool.query<TransportadoraTelefone>(
                    `SELECT * FROM tb_transportadora_telefone
                     WHERE "transportadoraId" = $1
                     ORDER BY principal DESC, id ASC`,
                    [Number(id)]
                ),
            ])

            if (!transportadoraResult.rows[0]) return notFound()

            transportadora = transportadoraResult.rows[0]
            emails         = emailsResult.rows
            telefones      = telefonesResult.rows
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/transportadoras" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Transportadoras
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Transportadora" : "Editar Transportadora"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Transportadora" : transportadora!.razaoSocial}
                        </h1>
                        {!isNovo && transportadora && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{transportadora.id} · {transportadora.cnpj}
                            </p>
                        )}
                    </div>

                    <TransportadoraForm
                        transportadora={transportadora}
                        emailsIniciais={emails}
                        telefonesIniciais={telefones}
                        listaCidades={cidadesResult.rows}
                        listaEstados={estadosResult.rows}
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