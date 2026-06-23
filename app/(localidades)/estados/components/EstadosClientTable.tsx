"use client"

import { useState } from "react"
import { alternarStatusEstado, excluirEstado } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { EstadoComPais, PaisSelect } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'estado', headerName: 'Estado', flex: 1, minWidth: 200 },
    { field: 'uf', headerName: 'UF', width: 100, renderCell: (params) => params.value || '-' },
    {
        field: 'pais',
        headerName: 'País',
        flex: 1,
        minWidth: 200,
        valueGetter: (_value: any, row: any) => row.pais || '-'
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    }
]

export default function EstadosClientTable({
    estados,
    listaPaises
}: {
    estados: EstadoComPais[]
    listaPaises?: PaisSelect[]
}) {
    const [estadoSelecionado, setEstadoSelecionado] = useState<EstadoComPais | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!estadoSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusEstado(estadoSelecionado.id, estadoSelecionado.ativo)
            toast.success(`Estado ${estadoSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setEstadoSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!estadoSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirEstado(estadoSelecionado.id)
            toast.success("Estado excluído com sucesso!")
            setEstadoSelecionado(null)
            setIsDeleteModalOpen(false)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <ActionToolbar
                selectedRow={estadoSelecionado}
                loading={loadingStatus}
                onAddHref="/estados/novo"
                onEditHref={estadoSelecionado ? `/estados/${estadoSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={estados}
                columns={columns}
                selectedRow={estadoSelecionado}
                onRowSelect={setEstadoSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Estado"
                message={`Tem certeza que deseja excluir "${estadoSelecionado?.estado}"? Esta ação não poderá ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
