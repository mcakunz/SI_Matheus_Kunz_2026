import Link from "next/link"
import { notFound } from "next/navigation"
import { HiChevronLeft } from "react-icons/hi"

import { pool } from "@/lib/db"
import { Produto, MarcaSelect, UnidadeMedidaSelect, CategoriaSelect } from "@/lib/types"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { ProdutoForm } from "../components/ProdutoForm"

interface ProdutoPageProps {
    params: Promise<{ id: string }>
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
    const { id } = await params
    const isNovo = id === 'novo'

    if (!isNovo && isNaN(Number(id))) return notFound()

    try {
        const [marcasResult, unidadesResult, categoriasResult] = await Promise.all([
            pool.query<MarcaSelect>(
                `SELECT id, "marca" FROM tb_marcas WHERE "ativo" = true ORDER BY "marca" ASC`
            ),
            pool.query<UnidadeMedidaSelect>(
                `SELECT id, "unidadeMedida" FROM tb_unidades_medida WHERE "ativo" = true ORDER BY "unidadeMedida" ASC`
            ),
            pool.query<CategoriaSelect>(
                `SELECT id, "categoria" FROM tb_categorias WHERE "ativo" = true ORDER BY "categoria" ASC`
            ),
        ])

        let produto: Produto | null = null

        if (!isNovo) {
            const result = await pool.query<Produto>(
                `SELECT * FROM tb_produtos WHERE id = $1`,
                [Number(id)]
            )
            if (!result.rows[0]) return notFound()
            produto = result.rows[0]
        }

        return (
            <div className="p-6 mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/produtos" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                        <HiChevronLeft size={16} />
                        Produtos
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">
                        {isNovo ? "Novo Produto" : "Editar Produto"}
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isNovo ? "Novo Produto" : produto!.produto}
                        </h1>
                        {!isNovo && produto && (
                            <p className="text-sm text-slate-400 mt-1">
                                ID #{produto.id}
                            </p>
                        )}
                    </div>

                    <ProdutoForm
                        produto={produto}
                        listaMarcas={marcasResult.rows}
                        listaUnidades={unidadesResult.rows}
                        listaCategorias={categoriasResult.rows}
                    />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}