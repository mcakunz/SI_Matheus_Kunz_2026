"use client"

import { useState } from "react"
import { alternarStatusProduto, excluirProduto } from "../actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "@/components/ui/DataTable"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import toast from "react-hot-toast"
import { ProdutoView } from "@/lib/types"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'produto', headerName: 'Produto', flex: 1, minWidth: 200 },
    { field: 'referencia', headerName: 'Referência', width: 130 },
    { field: 'codigoBarras', headerName: 'Cód. Barras', width: 150 },
    { field: 'categoria', headerName: 'Categoria', width: 150 },
    { field: 'marca', headerName: 'Marca', width: 130 },
    { field: 'unidadeMedida', headerName: 'UN', width: 70 },
    {
        field: 'valorVenda', headerName: 'Vl. Venda', width: 120,
        renderCell: (params) => (
            <span>
                {Number(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
        ),
    },
    {
        field: 'quantidade', headerName: 'Qtd.', width: 80,
        renderCell: (params) => {
            const qtd     = params.value as number
            const qtdMin  = params.row.quantidadeMinima as number
            const color   = qtd <= 0 ? 'text-red-600 font-semibold' : qtd <= qtdMin ? 'text-amber-600 font-semibold' : 'text-slate-700'
            return <span className={color}>{qtd}</span>
        },
    },
    {
        field: 'ativo', headerName: 'Status', width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function ProdutoClientTable({ produtos }: { produtos: ProdutoView[] }) {
    const [selecionado, setSelecionado] = useState<ProdutoView | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!selecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusProduto(selecionado.id, selecionado.ativo)
            toast.success(`Produto ${selecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!selecionado) return
        setLoadingStatus(true)
        try {
            await excluirProduto(selecionado.id)
            toast.success("Produto excluído com sucesso!")
            setSelecionado(null)
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
                selectedRow={selecionado}
                loading={loadingStatus}
                onAddHref="/produtos/novo"
                onEditHref={selecionado ? `/produtos/${selecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={produtos}
                columns={columns}
                selectedRow={selecionado}
                onRowSelect={setSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Produto"
                message={`Tem certeza que deseja excluir "${selecionado?.produto}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}