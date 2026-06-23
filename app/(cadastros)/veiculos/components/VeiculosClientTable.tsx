"use client"

import { useState } from "react"
import { alternarStatusVeiculo, excluirVeiculo } from "../actions"

import { GridColDef }    from "@mui/x-data-grid"
import { DataTable }     from "@/components/ui/DataTable"
import { ConfirmModal }  from "@/components/ui/ConfirmModal"
import { ActionToolbar } from "@/components/ui/ActionToolbar"
import { StatusBadge }   from "@/components/ui/StatusBadge"
import toast             from "react-hot-toast"
import { Veiculo }       from "@/lib/types"
import { isMercosul } from "@/lib/utils/helpers"

function formatarPlaca(placa: string): string {
    const limpo = placa.toUpperCase()
    if (isMercosul(limpo)) return limpo
    if (/^[A-Z]{3}[0-9]{4}$/.test(limpo)) return `${limpo.slice(0, 3)}-${limpo.slice(3)}`
    return limpo
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
        field: 'placa',
        headerName: 'Placa',
        width: 130,
        valueFormatter: (value: string) => formatarPlaca(value),
    },
    { field: 'marca',   headerName: 'Marca',  width: 150 },
    { field: 'modelo',  headerName: 'Modelo', flex: 1, minWidth: 150 },
    { field: 'ano',     headerName: 'Ano',    width: 90 },
    {
        field: 'capacidade',
        headerName: 'Cap. (kg)',
        width: 110,
        renderCell: (params) => {
            if (params.value == null) return <span className="text-slate-400">-</span>
            return (
                <span>
                    {Number(params.value).toLocaleString('pt-BR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    })}
                </span>
            )
        },
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 110,
        renderCell: (params) => <StatusBadge ativo={params.value as boolean} />,
    },
]

export default function VeiculosClientTable({ veiculos }: { veiculos: Veiculo[] }) {
    const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
    const [isDeleteModalOpen,  setIsDeleteModalOpen]  = useState(false)
    const [loadingStatus,      setLoadingStatus]      = useState(false)

    const handleAlternarStatus = async () => {
        if (!veiculoSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusVeiculo(veiculoSelecionado.id, veiculoSelecionado.ativo)
            toast.success(`Veículo ${veiculoSelecionado.ativo ? 'inativado' : 'ativado'} com sucesso!`)
            setVeiculoSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!veiculoSelecionado) return
        setLoadingStatus(true)
        try {
            await excluirVeiculo(veiculoSelecionado.id)
            toast.success("Veículo excluído com sucesso!")
            setVeiculoSelecionado(null)
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
                selectedRow={veiculoSelecionado}
                loading={loadingStatus}
                onAddHref="/veiculos/novo"
                onEditHref={veiculoSelecionado ? `/veiculos/${veiculoSelecionado.id}` : undefined}
                onToggleStatus={handleAlternarStatus}
                onDelete={() => setIsDeleteModalOpen(true)}
            />

            <DataTable
                data={veiculos}
                columns={columns}
                selectedRow={veiculoSelecionado}
                onRowSelect={setVeiculoSelecionado}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleExcluir}
                loading={loadingStatus}
                title="Excluir Veículo"
                message={`Tem certeza que deseja excluir o veículo "${veiculoSelecionado?.placa} – ${veiculoSelecionado?.modelo}"? Esta ação não pode ser desfeita.`}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}