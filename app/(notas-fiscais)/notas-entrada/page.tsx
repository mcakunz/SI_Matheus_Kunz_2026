import { listarNotasEntrada } from "./actions"
import { NotasEntradaClientTable } from "./components/NotasEntradaClientTable"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import { NotaEntradaView } from "@/lib/types"

export default async function NotasEntradaPage() {
    // Busca dentro do try, mas monta a tela fora dele (a regra react-hooks/error-boundaries do
    // lint não aceita JSX criado dentro de try/catch).
    let notas: NotaEntradaView[]
    try {
        notas = await listarNotasEntrada()
    } catch (error) {
        return <ErrorLoadingData message={error instanceof Error ? error.message : String(error)} />
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Notas de Entrada</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gerencie as compras, a entrada de produtos no estoque e as notas fiscais de fornecedores.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <NotasEntradaClientTable notas={notas} />
            </div>
        </div>
    )
}
