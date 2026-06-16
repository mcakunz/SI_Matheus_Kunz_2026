"use client"

import { useState } from "react"
import { alternarStatusCategoria, excluirCategoria } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { Categoria } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'categoria', headerName: 'Categoria', flex: 1, minWidth: 180 },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function CategoriaClientTable({ categorias }: { categorias: Categoria[] }) {
    const [selecionada, setSelecionada] = useState<Categoria | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusCategoria(selecionada.id, selecionada.ativo)
            toast.success(`Categoria ${selecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
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
            await excluirCategoria(selecionada.id)
            toast.success("Categoria com sucesso!")
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
                onAddHref="/categorias/novo"
                onEditHref={selecionada ? `/categorias/${selecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable 
                data={categorias}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Categoria"
                message={`Tem certeza que deseja excluir "${selecionada?.categoria}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
