import { NotaEntradaForm } from "../components/NotaEntradaForm"

export default function NovaNotaEntradaPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Lançar Nota de Entrada</h1>
                <p className="text-sm text-slate-500">
                    Registre uma nova compra e os produtos atrelados a ela.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <NotaEntradaForm />
            </div>
        </div>
    )
}