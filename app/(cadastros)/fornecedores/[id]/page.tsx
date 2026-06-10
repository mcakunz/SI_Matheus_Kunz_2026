import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import {
    FornecedorView,
    FornecedorEmail,
    FornecedorTelefone,
    CidadeSelect,
    PaisSelect,
    EstadoSelect,
    CondicaoPagamentoSelect,
    TransportadoraSelect,
} from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { FornecedorForm } from "../components/FornecedorForm"

interface FornecedorPageProps {
    params: Promise<{ id: string }>
}

export default async function FornecedorPage({ params }: FornecedorPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const [cidadesResult, estadosResult, paisesResult, condicoesResult, transportadorasResult] = await Promise.all([
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
            pool.query<TransportadoraSelect>(
                `SELECT id, "razaoSocial" FROM tb_transportadoras WHERE ativo = true ORDER BY "razaoSocial" ASC` 
            ),
        ])

        let fornecedor: FornecedorView | null = null
        let emails:     FornecedorEmail[]     = []
        let telefones:  FornecedorTelefone[]  = []

        if (!isNovo) {
            const [fornecedorResult, emailsResult, telefonesResult] = await Promise.all([
                pool.query<FornecedorView>(
                    `SELECT
                        f.*,
                        ci.cidade,
                        cp."condicaoPagamento",
                        tr."razaoSocial"   AS transportadora,
                        NULL::text         AS "emailPrincipal",
                        0                  AS "totalEmails",
                        NULL::text         AS "telefonePrincipal",
                        0                  AS "totalTelefones"
                     FROM tb_fornecedores f
                     LEFT JOIN tb_cidades             ci ON ci.id = f."cidadeId"
                     LEFT JOIN tb_condicoes_pagamento cp ON cp.id = f."condicaoPagamentoId"
                     LEFT JOIN tb_transportadoras     tr ON tr.id = f."transportadoraId"
                     WHERE f.id = $1`,
                    [Number(id)]
                ),
                pool.query<FornecedorEmail>(
                    `SELECT * FROM tb_fornecedor_email
                     WHERE "fornecedorId" = $1
                     ORDER BY principal DESC, id ASC`,
                    [Number(id)]
                ),
                pool.query<FornecedorTelefone>(
                    `SELECT * FROM tb_fornecedor_telefone
                     WHERE "fornecedorId" = $1
                     ORDER BY principal DESC, id ASC`,
                    [Number(id)]
                ),
            ])

            if (!fornecedorResult.rows[0]) return notFound()

            fornecedor = fornecedorResult.rows[0]
            emails     = emailsResult.rows
            telefones  = telefonesResult.rows
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/fornecedores" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Fornecedores
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Novo Fornecedor" : "Editar Fornecedor"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Novo Fornecedor" : fornecedor!.fornecedor}
                        </h1>
                        {!isNovo && fornecedor && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{fornecedor.id} · {fornecedor.cpfCnpj}
                            </p>
                        )}
                    </div>

                    <FornecedorForm
                        fornecedor={fornecedor}
                        emailsIniciais={emails}
                        telefonesIniciais={telefones}
                        listaCidades={cidadesResult.rows}
                        listaEstados={estadosResult.rows}
                        listaPaises={paisesResult.rows}
                        listaCondicoes={condicoesResult.rows}
                        listaTransportadoras={transportadorasResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
