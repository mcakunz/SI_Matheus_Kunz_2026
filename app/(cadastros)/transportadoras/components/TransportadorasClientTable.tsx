"use client"

import { useState } from "react"
import { alternarStatusTransportadora, excluirTransportadora } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { TransportadoraView } from "@/lib/types"
import { mascaraCNPJ, mascaraCPF, mascaraTelefone } from "@/lib/utils/mascaras"
import { MaisBadge } from "@/components/ui/MaisBadge"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'razaoSocial', headerName: 'Razão Social', flex: 1, minWidth: 200 },
    { 
        field: 'cnpj', headerName: 'CPF / CNPJ', width: 160,
        renderCell: (params) => {
            const row = params.row as TransportadoraView
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
            const row = params.row as TransportadoraView
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
            const row = params.row as TransportadoraView
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

export default function TransportadorasClientTable({ transportadoras }: { transportadoras: TransportadoraView[] }) {
    const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<TransportadoraView | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!transportadoraSelecionada) return
        setLoadingStatus(true)
        try {
            await alternarStatusTransportadora(transportadoraSelecionada.id, transportadoraSelecionada.ativo)
            toast.success(`Transportadora ${transportadoraSelecionada.ativo ? 'inativada' : 'ativada'} com sucesso!`)
            setTransportadoraSelecionada(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!transportadoraSelecionada) return
        setLoadingStatus(true)
        try {
            await excluirTransportadora(transportadoraSelecionada.id)
            toast.success("Transportadora excluída com sucesso!")
            setTransportadoraSelecionada(null)
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
                selectedRow={transportadoraSelecionada}
                loading={loadingStatus}
                onAddHref="/transportadoras/novo"
                onEditHref={transportadoraSelecionada ? `/transportadoras/${transportadoraSelecionada.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={transportadoras}
                columns={columns}
                selectedRow={transportadoraSelecionada}
                onRowSelect={setTransportadoraSelecionada}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Transportadora"
                message={`Tem certeza que deseja excluir "${transportadoraSelecionada?.razaoSocial}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}