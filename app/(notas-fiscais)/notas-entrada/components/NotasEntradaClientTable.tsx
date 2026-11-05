"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { GridColDef } from "@mui/x-data-grid"

import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/Button"
import { NotaEntradaView } from "@/lib/types"
import { cancelarNotaEntrada } from "../actions"

// A nota tem chave composta (número + modelo + série + fornecedor), mas o DataGrid precisa de um
// "id" único por linha — então a chave vira uma string só para a tabela.
type LinhaNota = NotaEntradaView & { id: string }

const SITUACAO_LABELS: Record<string, string> = {
    LANCADA: "Lançada",
    CANCELADA: "Cancelada",
}

// Mesmo visual do StatusBadge das outras listagens.
const SITUACAO_ESTILOS: Record<string, string> = {
    LANCADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELADA: "bg-rose-50 text-rose-700 border-rose-200",
}

const formatarMoeda = (v: unknown) =>
    Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Datas "date" do Postgres chegam como Date (meia-noite local) ou string yyyy-mm-dd.
const paraData = (v: unknown): Date | null => {
    if (!v) return null
    const d = v instanceof Date ? v : new Date(String(v))
    return isNaN(d.getTime()) ? null : d
}
const formatarData = (v: unknown) => {
    const d = paraData(v)
    return d ? d.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"
}

const columns: GridColDef<LinhaNota>[] = [
    { field: "numero", headerName: "Nº NF", width: 110 },
    { field: "modelo", headerName: "Mod.", width: 70 },
    { field: "serie", headerName: "Série", width: 70 },
    { field: "fornecedor", headerName: "Fornecedor", flex: 1, minWidth: 220 },
    {
        field: "dataEmissao", headerName: "Emissão", width: 110, type: "date",
        valueGetter: (value) => paraData(value),
        renderCell: (params) => formatarData(params.row.dataEmissao),
    },
    {
        field: "dataChegada", headerName: "Entrada", width: 110, type: "date",
        valueGetter: (value) => paraData(value),
        renderCell: (params) => formatarData(params.row.dataChegada),
    },
    { field: "condicaoPagamento", headerName: "Condição Pgto.", width: 150 },
    {
        field: "valorProdutos", headerName: "Total Produtos", width: 140, type: "number",
        valueGetter: (value) => Number(value ?? 0),
        renderCell: (params) => formatarMoeda(params.value),
    },
    {
        field: "valorTotal", headerName: "Total da Nota", width: 140, type: "number",
        valueGetter: (value) => Number(value ?? 0),
        renderCell: (params) => (
            <span className="font-semibold text-emerald-700">{formatarMoeda(params.value)}</span>
        ),
    },
    {
        field: "situacao", headerName: "Situação", width: 120,
        renderCell: (params) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${SITUACAO_ESTILOS[params.value as string] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>
                {SITUACAO_LABELS[params.value as string] ?? params.value}
            </span>
        ),
    },
]

export function NotasEntradaClientTable({ notas }: { notas: NotaEntradaView[] }) {
    const [selecionada, setSelecionada] = useState<LinhaNota | null>(null)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const linhas = useMemo<LinhaNota[]>(
        () => notas.map(n => ({ ...n, id: `${n.numero}|${n.modelo}|${n.serie}|${n.fornecedorId}` })),
        [notas]
    )

    // Uma nota lançada nunca é editada nem excluída — só cancelada. Por isso a barra de ações tem
    // "Adicionar" e "Cancelar Nota" (este só fica habilitado para uma nota selecionada ainda LANCADA).
    const podeCancelar = selecionada?.situacao === "LANCADA"

    const handleCancelar = async () => {
        if (!selecionada) return
        setLoading(true)
        try {
            await cancelarNotaEntrada(selecionada.numero, selecionada.modelo, selecionada.serie, selecionada.fornecedorId)
            toast.success("Nota de entrada cancelada.")
            setSelecionada(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível cancelar a nota.")
        } finally {
            setLoading(false)
            setIsCancelModalOpen(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Link href="/notas-entrada/novo">
                    <Button>Adicionar</Button>
                </Link>
                <Button disabled={!podeCancelar || loading} onClick={() => setIsCancelModalOpen(true)}>
                    Cancelar Nota
                </Button>
                {selecionada && !podeCancelar && (
                    <span className="text-xs text-slate-400">Esta nota já está cancelada.</span>
                )}
            </div>

            <DataTable
                data={linhas}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelar}
                loading={loading}
                title="Cancelar Nota de Entrada"
                message={`Tem certeza que deseja cancelar a nota ${selecionada?.numero ?? ""} de "${selecionada?.fornecedor ?? ""}"? O estoque e o custo médio dos produtos serão estornados. Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Cancelar Nota"
            />
        </div>
    )
}
