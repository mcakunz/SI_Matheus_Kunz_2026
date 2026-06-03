"use client"

import { useState } from "react"
import { alternarStatusCondicaoPagamento, excluirCondicaoPagamento } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { CondicaoPagamentoCompleto } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'condicaoPagamento', headerName: 'Descrição', flex: 1, minWidth: 200 },
    {
        field: 'numeroParcelas',
        headerName: 'Parcelas',
        width: 100,
        renderCell: (params) => (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                {params.value}x
            </span>
        ),
    },
    { field: 'diasPrimeiraParcela', headerName: '1ª Parcela (dias)', width: 150, renderCell: (params) => `${params.value} dias` },
    { field: 'diasEntreParcelas',   headerName: 'Entre Parcelas (dias)', width: 180, renderCell: (params) => `${params.value} dias` },
    {
        field: 'percentualJuros',
        headerName: 'Juros',
        width: 100,
        renderCell: (params) => Number(params.value) > 0
            ? <span className="text-amber-700">{Number(params.value).toFixed(2)}%</span>
            : <span className="text-slate-400">—</span>,
    },
    {
        field: 'percentualDesconto',
        headerName: 'Desconto',
        width: 110,
        renderCell: (params) => Number(params.value) > 0
            ? <span className="text-emerald-700">{Number(params.value).toFixed(2)}%</span>
            : <span className="text-slate-400">—</span>,
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function CondicoesPagamentoClientTable({ condicoes }: { condicoes: CondicaoPagamentoCompleto[] }) {
    const [selecionada, setSelecionada] = useState<CondicaoPagamentoCompleto | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusCondicaoPagamento(selecionada.id, selecionada.ativo)
            toast.success(`Condição ${selecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
            setSelecionada(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await excluirCondicaoPagamento(selecionada.id)
            toast.success("Condição de pagamento excluída com sucesso!")
            setSelecionada(null)
            setIsDeleteModalOpen(false)
        } catch (err: any) {
            toast.error(err.message)
            setIsDeleteModalOpen(false)
        } finally {
            setLoadingStatus(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <ActionToolbar 
                selectedRow={selecionada}
                loading={loadingStatus}
                onAddHref="/condicoes-pagamento/novo"
                onEditHref={selecionada ? `/condicoes-pagamento/${selecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={condicoes}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Condição de Pagamento"
                message={`Tem certeza que deseja excluir "${selecionada?.condicaoPagamento}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
