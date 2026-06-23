import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { FormaPagamento } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { FormaPagamentoForm } from "../components/FormaPagamentoForm"

interface FormaPagamentoPageProps {
    params: Promise<{ id: string }>
}

export default async function FormaPagamentoPage({ params }: FormaPagamentoPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

        try {
            let forma: FormaPagamento | null = null

            if (!isNovo) {
                const result = await pool.query<FormaPagamento>(
                    `SELECT * FROM tb_formas_pagamento WHERE id = $1`,
                    [Number(id)]
                )
                if (!result.rows[0]) return notFound()
                forma = result.rows[0]
            }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/formas-pagamento" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Formas de Pagamento
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Nova Forma" : "Editar Forma"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Nova Forma de Pagamento" : forma!.formaPagamento}
                        </h1>
                        {!isNovo && forma && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{forma.id}
                            </p>
                        )}
                    </div>

                    <FormaPagamentoForm forma={forma} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}
