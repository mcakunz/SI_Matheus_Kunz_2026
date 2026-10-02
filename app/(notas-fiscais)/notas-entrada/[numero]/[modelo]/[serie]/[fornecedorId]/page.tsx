import { notFound } from "next/navigation"
import { buscarNotaEntradaPorChaveComposta } from "../../../../actions"
import { NotaEntradaForm } from "../../../../components/NotaEntradaForm"

interface NotaEntradaPageProps {
    params: {
        numero: string
        modelo: string
        serie: string
        fornecedorId: string
    }
}

export default async function NotaEntradaPage({ params }: NotaEntradaPageProps) {
    const { numero, modelo, serie } = params
    const fornecedorId = Number(params.fornecedorId)

    if (isNaN(fornecedorId)) return notFound()

    const dados = await buscarNotaEntradaPorChaveComposta(numero, modelo, serie, fornecedorId)
    if (!dados) return notFound()

    const { nota, itens } = dados

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Editar Nota de Entrada</h1>
                <p className="text-sm text-slate-500">
                    NF: {nota.numero} - {nota.fornecedor}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <NotaEntradaForm nota={nota} itensIniciais={itens} />
            </div>
        </div>
    )
}