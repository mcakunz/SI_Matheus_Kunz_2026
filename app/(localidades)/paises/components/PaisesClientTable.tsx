"use client"

import { useState } from "react"
import { alternarStatusPais, excluirPais } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { PaisFormModal } from "./PaisFormModal"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'pais', headerName: 'País', flex: 1, minWidth: 200 },
    { field: 'codigo', headerName: 'Código', width: 120, renderCell: (params) => params.value || '-' },
    { field: 'sigla', headerName: 'Sigla', width: 120, renderCell: (params) => params.value || '-' },
    { field: 'nacionalidade', headerName: 'Nacionalidade', flex: 1, minWidth: 200, renderCell: (params) => params.value || '-' },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    }
]

export default function PaisesClientTable({ paises }: { paises: any[] }) {
    const [paisSelecionado, setPaisSelecionado] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!paisSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusPais(paisSelecionado.id, paisSelecionado.ativo)
            const novoStatus = paisSelecionado.ativo ? 'inativado' : 'ativado'
            toast.success(`País ${novoStatus} com sucesso!`)
            setPaisSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!paisSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirPais(paisSelecionado.id)
            toast.success(`País excluído com sucesso!`)
            setPaisSelecionado(null)
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
                selectedRow={paisSelecionado}
                loading={loadingStatus}
                onAdd={() => { setPaisSelecionado(null); setIsModalOpen(true) }}
                onEdit={() => setIsModalOpen(true)}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={paises}
                columns={columns}
                selectedRow={paisSelecionado}
                onRowSelect={setPaisSelecionado}
            />

            <PaisFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                paisSelecionado={paisSelecionado}
                onSuccess={() => setPaisSelecionado(null)}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir País"
                message={`Tem certeza que deseja excluir o país ${paisSelecionado?.pais}? Esta ação não poderá ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}