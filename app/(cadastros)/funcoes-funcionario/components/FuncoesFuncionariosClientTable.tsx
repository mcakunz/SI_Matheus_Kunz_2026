"use client"

import { useState } from "react"
import { alternarStatusFuncaoFuncionario, excluirFuncaoFuncionario } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable }    from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge }  from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { FuncaoFuncionario } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'funcaoFuncionario', headerName: 'Função', flex: 1, minWidth: 200 },
    { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 200,
        valueGetter: (_value: any, row: any) => row.descricao || '-'
    },
    {
        field: 'salarioBase', headerName: 'Salário Base', width: 140,
        valueFormatter: (value: number) =>
            value != null
                ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '-',
    },
    {
        field: 'cargaHoraria', headerName: 'C. Horária', width: 120,
        valueFormatter: (value: number) => value != null ? `${value}h/mês` : '-',
    },
    {
        field: 'requerCnh', headerName: 'Requer CNH', width: 120,
        renderCell: (params) => (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                params.value
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
                {params.value ? 'Sim' : 'Não'}
            </span>
        ),
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function FuncoesFuncionariosClientTable({ funcoes }: { funcoes: FuncaoFuncionario[] }) {
    const [funcaoSelecionada, setFuncaoSelecionada] = useState<FuncaoFuncionario | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus]         = useState(false)

    const handleAlternarStatus = async () => {
        if (!funcaoSelecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusFuncaoFuncionario(funcaoSelecionada.id, funcaoSelecionada.ativo)
            toast.success(`Função ${funcaoSelecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
            setFuncaoSelecionada(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!funcaoSelecionada) return
        setLoadingStatus(true)
        try {
            await excluirFuncaoFuncionario(funcaoSelecionada.id)
            toast.success("Função excluída com sucesso!")
            setFuncaoSelecionada(null)
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
                selectedRow={funcaoSelecionada}
                loading={loadingStatus}
                onAddHref="/funcoes-funcionario/novo"
                onEditHref={funcaoSelecionada ? `/funcoes-funcionario/${funcaoSelecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={funcoes}
                columns={columns}
                selectedRow={funcaoSelecionada}
                onRowSelect={setFuncaoSelecionada}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Função"
                message={`Tem certeza que deseja excluir "${funcaoSelecionada?.funcaoFuncionario}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}