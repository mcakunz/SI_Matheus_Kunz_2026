"use client"

import { useState } from "react"
import { alternarStatusCidade, excluirCidade } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { CidadeFormModal } from "./CidadeFormModal" 
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { CidadeComEstado, EstadoSelect } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'cidade', headerName: 'Cidade', flex: 1, minWidth: 200 },
    { 
        field: 'codigo_ibge', 
        headerName: 'Cód. IBGE', 
        width: 120, 
        renderCell: (params) => params.value || '-' 
    },
    {
        field: 'estado',
        headerName: 'Estado',
        flex: 1,
        minWidth: 200,
        valueGetter: (value, row) => row.tb_estados?.estado || '-'
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    }
]

export default function CidadesClientTable({ 
    cidades, 
    listaEstados 
}: { 
    cidades: CidadeComEstado[], 
    listaEstados: EstadoSelect[] 
}) {
    const [cidadeSelecionada, setCidadeSelecionada] = useState<CidadeComEstado | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!cidadeSelecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusCidade(cidadeSelecionada.id, cidadeSelecionada.ativo)
            const novoStatus = cidadeSelecionada.ativo ? 'inativada' : 'ativada'
            toast.success(`Cidade ${novoStatus} com sucesso!`)
            setCidadeSelecionada(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!cidadeSelecionada) return
        setLoadingStatus(true)
        try {
            await excluirCidade(cidadeSelecionada.id)
            toast.success(`Cidade excluída com sucesso!`)
            setCidadeSelecionada(null)
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
                selectedRow={cidadeSelecionada}
                loading={loadingStatus}
                onAdd={() => { setCidadeSelecionada(null); setIsModalOpen(true) }}
                onEdit={() => setIsModalOpen(true)}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={cidades}
                columns={columns}
                selectedRow={cidadeSelecionada}
                onRowSelect={setCidadeSelecionada}
            />

            <CidadeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cidadeSelecionada={cidadeSelecionada}
                onSuccess={() => setCidadeSelecionada(null)}
                listaEstados={listaEstados} 
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Cidade"
                message={`Tem certeza que deseja excluir a cidade ${cidadeSelecionada?.cidade}? Esta ação não poderá ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}