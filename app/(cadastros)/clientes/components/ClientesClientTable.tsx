"use client"

import { useState } from "react"
import { alternarStatusCliente, excluirCliente } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { ClienteView } from "@/lib/types"
import { MaisBadge } from "@/components/ui/MaisBadge"
import { mascaraCNPJ, mascaraCPF, mascaraTelefone } from "@/lib/utils/mascaras"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'cliente', headerName: 'Nome / Razão Social', flex: 1, minWidth: 200 },
    { 
        field: 'cpfCnpj', headerName: 'CPF / CNPJ', width: 160,
        renderCell: (params) => {
            const row = params.row as ClienteView
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
        )
    },
    {
        field: 'emailPrincipal',
        headerName: 'E-mail',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
            const row = params.row as ClienteView
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
            const row = params.row as ClienteView
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
        valueGetter: (_value: any, row: any) => row.cidade || '-'
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />
    },
]

export default function ClientesClientTable({ clientes }: { clientes: ClienteView[] }) {
    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteView | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)
    

    const handleAlternarStatus = async () => {
        if (!clienteSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusCliente(clienteSelecionado.id, clienteSelecionado.ativo)
            toast.success(`Cliente ${clienteSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setClienteSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!clienteSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirCliente(clienteSelecionado.id)
            toast.success("Cliente excluído com sucesso!")
            setClienteSelecionado(null)
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
                selectedRow={clienteSelecionado}
                loading={loadingStatus}
                onAddHref="/clientes/novo"
                onEditHref={clienteSelecionado ? `/clientes/${clienteSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={clientes}
                columns={columns}
                selectedRow={clienteSelecionado}
                onRowSelect={setClienteSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Cliente"
                message={`Tem certeza que deseja excluir "${clienteSelecionado?.cliente}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}
