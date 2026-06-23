"use client"

import { useState } from "react"
import { alternarStatusPais, excluirPais } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { Pais } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'pais', headerName: 'País', flex: 1, minWidth: 200 },
    { field: 'codigo', headerName: 'Código', width: 100, renderCell: (params) => params.value || '-' },
    { field: 'sigla', headerName: 'Sigla', width: 90, renderCell: (params) => params.value || '-' },
    { field: 'moeda', headerName: 'Moeda', width: 90, renderCell: (params) => params.value || '-' },
    { field: 'nacionalidade', headerName: 'Nacionalidade', flex: 1, minWidth: 160, renderCell: (params) => params.value || '-' },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    },
]

export default function PaisesClientTable({ paises }: { paises: Pais[] }) {
    const [paisSelecionado, setPaisSelecionado] = useState<Pais | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!paisSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusPais(paisSelecionado.id, paisSelecionado.ativo)
            toast.success(`País ${paisSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
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
            toast.success("País excluído com sucesso!")
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
                onAddHref="/paises/novo"
                onEditHref={paisSelecionado ? `/paises/${paisSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={paises}
                columns={columns}
                selectedRow={paisSelecionado}
                onRowSelect={setPaisSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir País"
                message={`Tem certeza que deseja excluir "${paisSelecionado?.pais}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
