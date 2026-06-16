"use client"

import { useState } from "react"
import { alternarStatusMarca, excluirMarca } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { Marca } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'marca', headerName: 'Marca', flex: 1, minWidth: 180 },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function MarcaClientTable({ marcas }: { marcas: Marca[] }) {
    const [selecionada, setSelecionada] = useState<Marca | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusMarca(selecionada.id, selecionada.ativo)
            toast.success(`Marca ${selecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
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
            await excluirMarca(selecionada.id)
            toast.success("Marca excluída com sucesso!")
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
                onAddHref="/marcas/novo"
                onEditHref={selecionada ? `/marcas/${selecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={marcas}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Marca"
                message={`Tem certeza que deseja excluir "${selecionada?.marca}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}