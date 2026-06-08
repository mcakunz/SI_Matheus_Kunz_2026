"use client"

import { useState } from "react"
import { alternarStatusFormaPagamento, excluirFormaPagamento } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { FormaPagamento } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'formaPagamento', headerName: 'Nome', flex: 1, minWidth: 180 },
    { field: 'descricao', headerName: 'Descrição', flex: 2, minWidth: 200 },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function FormaPagamentoClientTable({ formas }: { formas: FormaPagamento[] }) {
    const [selecionada, setSelecionada] = useState<FormaPagamento | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusFormaPagamento(selecionada.id, selecionada.ativo)
            toast.success(`Forma de pagamento ${selecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
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
            await excluirFormaPagamento(selecionada.id)
            toast.success("Forma de pagamento excluída com sucesso!")
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
                onAddHref="/formas-pagamento/novo"
                onEditHref={selecionada ? `/formas-pagamento/${selecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable 
                data={formas}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Forma de Pagamento"
                message={`Tem certeza que deseja excluir "${selecionada?.formaPagamento}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
