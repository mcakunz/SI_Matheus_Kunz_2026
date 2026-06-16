import { pool } from "@/lib/db"
import { ProdutoView } from "@/lib/types"
import { ErrorLoadingData } from "@/app/components/ui/ErrorLoadingData"
import ProdutoClientTable from "./components/ProdutosClientTable"

export default async function ProdutoPage() {
    try {
        const result = await pool.query<ProdutoView>(
            `SELECT
                p.id,
                p."produto",
                p."codigoBarras",
                p."referencia",
                p."marcaId",
                p."unidadeMedidaId",
                p."categoriaId",
                p."valorCompra",
                p."valorVenda",
                p."quantidade",
                p."quantidadeMinima",
                p."percentualLucro",
                p."descricao",
                p."observacoes",
                p."ativo",
                p."dataCadastro",
                p."dataAlteracao",
                m."marca",
                u."unidadeMedida",
                c."categoria"
            FROM tb_produtos p
            INNER JOIN tb_marcas          m ON m.id = p."marcaId"
            INNER JOIN tb_unidades_medida u ON u.id = p."unidadeMedidaId"
            INNER JOIN tb_categorias      c ON c.id = p."categoriaId"
            ORDER BY p."produto" ASC`
        )

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os produtos cadastrados no sistema.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <ProdutoClientTable produtos={result.rows} />
                </div>
            </div>
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}