"use client"

import { useState } from "react"
import { alternarStatusFuncionario, excluirFuncionario } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/app/components/ui/DataTable"
import { ConfirmModal } from "@/app/components/ui/ConfirmModal"
import { ActionToolbar } from "@/app/components/ui/ActionToolbar"
import { StatusBadge } from "@/app/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { FuncionarioView } from "@/lib/types"

const TIPO_LABELS: Record<FuncionarioView['tipo'], string> = {
    INTERNO:      'Interno',
    EXTERNO:      'Externo',
    TERCEIRIZADO: 'Terceirizado',
}

const TIPO_STYLES: Record<FuncionarioView['tipo'], string> = {
    INTERNO:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    EXTERNO:      'bg-amber-50 text-amber-700 border-amber-200',
    TERCEIRIZADO: 'bg-violet-50 text-violet-700 border-violet-200',
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'funcionario', headerName: 'Funcionário', flex: 1, minWidth: 200 },
    { field: 'cpfCnpj', headerName: 'CPF', width: 150 },
    {
        field: 'funcaoFuncionario',
        headerName: 'Função',
        width: 160,
        valueGetter: (_value: any, row: any) => row.funcaoFuncionario || '-'
    },
    {
        field: 'tipo', headerName: 'Tipo', width: 130,
        renderCell: (params) => {
            const tipo = params.value as FuncionarioView['tipo']
            return (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TIPO_STYLES[tipo]}`}>
                    {TIPO_LABELS[tipo]}
                </span>
            )
        }
    },
    {
        field: 'dataAdmissao',
        headerName: 'Admissão',
        width: 120,
        valueGetter: (_value: any, row: any) =>
            row.dataAdmissao ? new Date(row.dataAdmissao).toLocaleDateString('pt-BR') : '-'
    },
    {
        field: 'cidade',
        headerName: 'Cidade',
        width: 160,
        valueGetter: (_value: any, row: any) => row.cidade || '-'
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    },
]

export default function FuncionariosClientTable({ funcionarios }: { funcionarios: FuncionarioView[] }) {
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<FuncionarioView | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!funcionarioSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusFuncionario(funcionarioSelecionado.id, funcionarioSelecionado.ativo)
            toast.success(`Funcionário ${funcionarioSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setFuncionarioSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!funcionarioSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirFuncionario(funcionarioSelecionado.id)
            toast.success("Funcionário excluído com sucesso!")
            setFuncionarioSelecionado(null)
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
                selectedRow={funcionarioSelecionado}
                loading={loadingStatus}
                onAddHref="/funcionarios/novo"
                onEditHref={funcionarioSelecionado ? `/funcionarios/${funcionarioSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={funcionarios}
                columns={columns}
                selectedRow={funcionarioSelecionado}
                onRowSelect={setFuncionarioSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Funcionário"
                message={`Tem certeza que deseja excluir "${funcionarioSelecionado?.funcionario}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}