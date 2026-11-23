import { listarContasPagar } from "./actions"
import { ContasPagarClientTable } from "./components/ContasPagarClientTable"
import { ErrorLoadingData } from "@/components/ui/ErrorLoadingData"
import type { ContaPagarLinha } from "./tipos"

export default async function ContasPagarPage() {
    let contas: ContaPagarLinha[]
    try {
        contas = await listarContasPagar()
    } catch (error) {
        return <ErrorLoadingData message={error instanceof Error ? error.message : String(error)} />
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Títulos gerados pelas notas de entrada e contas avulsas: pagamentos, estornos e vencimentos.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <ContasPagarClientTable contas={contas} />
            </div>
        </div>
    )
}
