"use client"

import { useState } from "react"
import { alternarStatusFornecedor, excluirFornecedor } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { FornecedorView } from "@/lib/types"
import { MaisBadge } from "@/components/ui/MaisBadge"
import { mascaraCNPJ, mascaraCPF, mascaraTelefone } from "@/lib/utils/mascaras"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fornecedor', headerName: 'Nome / Razão Social', flex: 1, minWidth: 200 },
    { 
        field: 'cpfCnpj', headerName: 'CPF / CNPJ', width: 160,
        renderCell: (params) => {
            const row = params.row as FornecedorView
            return row.tipo === 'J'
                ? mascaraCNPJ(params.value)
                : mascaraCPF(params.value)
        } 
    },
    {
        field: 'tipo', headerName: 'Tipo', width: 90,
        renderCell: (params) => (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                params.value === 'J'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
                {params.value === 'J' ? 'Jurídica' : 'Física'}
            </span>
        ),
    },
    {
        field: 'emailPrincipal',
        headerName: 'E-mail',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
            const row = params.row as FornecedorView
            const extras = (row.totalEmails ?? 0) - 1
            if (!row.emailPrincipal) return <span className="text-slate-400">-</span>
            return (
                <span className="flex items-center">
                    <span className="truncate">{row.emailPrincipal}</span>
                    <MaisBadge count={extras} />
                </span>
            )
        },
    },
    {
        field: 'telefonePrincipal',
        headerName: 'Telefone',
        width: 160,
        renderCell: (params) => {
            const row = params.row as FornecedorView
            const extras = (row.totalTelefones ?? 0) - 1
            if (!row.telefonePrincipal) return <span className="text-slate-400">-</span>
            return (
                <span className="flex items-center">
                    <span>{mascaraTelefone(row.telefonePrincipal)}</span>
                    <MaisBadge count={extras} />
                </span>
            )
        },
    },
    {
        field: 'cidade',
        headerName: 'Cidade',
        width: 160,
        valueGetter: (_value: any, row: any) => row.cidade || '-',
    },
    {
        field: 'condicaoPagamento',
        headerName: 'Cond. Pagamento',
        width: 160,
        valueGetter: (_value: any, row: any) => row.condicaoPagamento || '-',
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function FornecedoresClientTable({ fornecedores }: { fornecedores: FornecedorView[] }) {
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<FornecedorView | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!fornecedorSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusFornecedor(fornecedorSelecionado.id, fornecedorSelecionado.ativo)
            toast.success(`Fornecedor ${fornecedorSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setFornecedorSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!fornecedorSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirFornecedor(fornecedorSelecionado.id)
            toast.success("Fornecedor excluído com sucesso!")
            setFornecedorSelecionado(null)
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
                selectedRow={fornecedorSelecionado}
                loading={loadingStatus}
                onAddHref="/fornecedores/novo"
                onEditHref={fornecedorSelecionado ? `/fornecedores/${fornecedorSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={fornecedores}
                columns={columns}
                selectedRow={fornecedorSelecionado}
                onRowSelect={setFornecedorSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Fornecedor"
                message={`Tem certeza que deseja excluir "${fornecedorSelecionado?.fornecedor}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
