import { listarNotasEntrada } from "./actions"
import { NotasEntradaClientTable } from "./components/NotasEntradaClientTable"

export default async function NotasEntradaPage() {
    const notas = await listarNotasEntrada()

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Notas de Entrada</h1>
                <p className="text-sm text-slate-500">
                    Gerenciamento de compras, entrada de produtos no estoque e notas fiscais de fornecedores.
                </p>
            </div>

            <NotasEntradaClientTable notas={notas} />
        </div>
    )
}