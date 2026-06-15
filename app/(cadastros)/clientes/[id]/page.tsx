import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { ClienteView, CidadeSelect, PaisSelect, CondicaoPagamentoSelect, EstadoSelect, ClienteEmail, ClienteTelefone } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import { ClienteForm } from "../components/ClienteForm"

interface ClientePageProps {
    params: Promise<{ id: string }>
}

export default async function ClientePage({ params }: ClientePageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    let cliente: ClienteView | null = null
    let emails: ClienteEmail[] = []
    let telefones: ClienteTelefone[] = []

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const [cidadesResult, estadosResult, paisesResult, condicoesResult] = await Promise.all([
            pool.query<CidadeSelect>(
                `SELECT id, cidade, "estadoId" FROM tb_cidades WHERE ativo = true ORDER BY cidade ASC`),
            pool.query<EstadoSelect>(
                `SELECT id, estado, "paisId" FROM tb_estados WHERE ativo = true ORDER BY estado ASC`),
            pool.query<PaisSelect>(
                `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`),
            pool.query<CondicaoPagamentoSelect>(`SELECT id, "condicaoPagamento" FROM tb_condicoes_pagamento WHERE ativo = true ORDER BY "condicaoPagamento" ASC`),
        ])

        let cliente: ClienteView | null = null

        if (!isNovo) {
            const [clienteResult, emailsResult, telefonesResult] = await Promise.all([
                pool.query<ClienteView>(
                    `SELECT 
                        c.*, 
                        ci.cidade, 
                        cp."condicaoPagamento",
                        NULL::text         AS "emailPrincipal",
                        0                  AS "totalEmails",
                        NULL::text         AS "telefonePrincipal",
                        0                  AS "totalTelefones"
                    FROM tb_clientes c
                    LEFT JOIN tb_cidades ci ON ci.id = c."cidadeId"
                    LEFT JOIN tb_condicoes_pagamento cp ON cp.id = c."condicaoPagamentoId"
                    WHERE c.id = $1`, [Number(id)]
                ),
                pool.query(`SELECT * FROM tb_cliente_email WHERE "clienteId" = $1 ORDER BY id`, [Number(id)]),
                pool.query(`SELECT * FROM tb_cliente_telefone WHERE "clienteId" = $1 ORDER BY id`, [Number(id)]),
            ])

            if (!clienteResult.rows[0]) return notFound()
            cliente   = clienteResult.rows[0]
            emails    = emailsResult.rows
            telefones = telefonesResult.rows
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/clientes" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Clientes
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Novo Cliente" : "Editar Cliente"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Novo Cliente" : cliente!.cliente}
                        </h1>
                        {!isNovo && cliente && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{cliente.id} · {cliente.cpfCnpj}
                            </p>
                        )}
                    </div>

                    <ClienteForm
                        cliente={cliente}
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
