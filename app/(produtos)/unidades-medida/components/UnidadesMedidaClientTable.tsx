"use client"

import { useState } from "react"
import { alternarStatusUnidadeMedida, excluirUnidadeMedida } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { UnidadeMedida } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'unidadeMedida', headerName: 'Unidade de Medida', flex: 1, minWidth: 180 },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function UnidadeMedidaClientTable({ unidades }: { unidades: UnidadeMedida[] }) {
    const [selecionada, setSelecionada] = useState<UnidadeMedida | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusUnidadeMedida(selecionada.id, selecionada.ativo)
            toast.success(`Unidade de medida ${selecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
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
            await excluirUnidadeMedida(selecionada.id)
            toast.success("Unidade de medida excluída com sucesso!")
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
                onAddHref="/unidades-medida/novo"
                onEditHref={selecionada ? `/unidades-medida/${selecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={unidades}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Unidade de Medida"
                message={`Tem certeza que deseja excluir "${selecionada?.unidadeMedida}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}