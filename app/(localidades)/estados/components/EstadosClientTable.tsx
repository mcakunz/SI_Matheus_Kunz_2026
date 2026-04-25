"use client"

import { useState } from "react"
import { alternarStatusEstado, excluirEstado } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { EstadoFormModal } from "./EstadoFormModal"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { EstadoComPais, EstadoSelect, PaisSelect } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'estado', headerName: 'Estado', flex: 1, minWidth: 200 },
    { field: 'uf', headerName: 'UF', width: 100, renderCell: (params) => params.value || '-' },
    {
        field: 'pais',
        headerName: 'País',
        flex: 1,
        minWidth: 200,
        valueGetter: (value, row) => row.tb_paises?.pais || '-'
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    }
]

export default function EstadosClientTable({ estados, listaPaises }: { estados: EstadoSelect[], listaPaises: PaisSelect[] }) {
    const [estadoSelecionado, setEstadoSelecionado] = useState<EstadoComPais | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!estadoSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusEstado(estadoSelecionado.id, estadoSelecionado.ativo)
            const novoStatus = estadoSelecionado.ativo ? 'inativado' : 'ativado'
            toast.success(`Estado ${novoStatus} com sucesso!`)
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
            toast.success(`Estado excluído com sucesso!`)
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
                onAdd={() => { setEstadoSelecionado(null); setIsModalOpen(true) }}
                onEdit={() => setIsModalOpen(true)}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={estados}
                columns={columns}
                selectedRow={estadoSelecionado}
                onRowSelect={setEstadoSelecionado}
            />

            <EstadoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                estadoSelecionado={estadoSelecionado}
                onSuccess={() => setEstadoSelecionado(null)}
                listaPaises={listaPaises}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Estado"
                message={`Tem certeza que deseja excluir o estado ${estadoSelecionado?.estado}? Esta ação não poderá ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}