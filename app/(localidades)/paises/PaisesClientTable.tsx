"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/Button"
import { alternarStatusPais, excluirPais } from "./actions"

import { GridColDef } from "@mui/x-data-grid"
import { DataTable } from "./components/DataTable"
import { PaisFormModal } from "./components/PaisFormModal"
import toast from "react-hot-toast"
import { set } from "zod"

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'pais', headerName: 'País', flex: 1, minWidth: 200 },
    { field: 'codigo', headerName: 'Código', width: 120, renderCell: (params) => params.value || '-' },
    { field: 'sigla', headerName: 'Sigla', width: 120, renderCell: (params) => params.value || '-' },
    { field: 'nacionalidade', headerName: 'Nacionalidade', flex: 1, minWidth: 200, renderCell: (params) => params.value  || '-' },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => {
            const ativo = params.value as boolean
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    ativo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                    {ativo ? 'Ativo' : 'Inativo'}
                </span>
            )
        }
    }
]

export default function PaisesClientTable({ paises }: { paises: any[] }) {
    const [paisSelecionado, setPaisSelecionado] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)

    const handleAlternarStatus = async () => {
        if (!paisSelecionado) return
        setLoadingStatus(true)
        try {
            await alternarStatusPais(paisSelecionado.id, paisSelecionado.ativo)
            const novoStatus = paisSelecionado.ativo ? 'inativado' : 'ativado'
            toast.success(`País ${novoStatus} com sucesso!`)
            setPaisSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleExcluir = async () => {
        if (!paisSelecionado) return

        const confirmar = window.confirm(`Tem certeza que deseja excluir o país: ${paisSelecionado.pais}?`)
        if (!confirmar) return

        setLoadingStatus(true)
        try {
            await excluirPais(paisSelecionado.id)
            toast.success(`País exlcuido com sucesso!`)
            setPaisSelecionado(null)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoadingStatus(false)
        }
    }

    return (
        <div className="flex flex-col gap-4"> 
            <div className="flex items-center gap-2">
                <Button onClick={() => { setPaisSelecionado(null); setIsModalOpen(true) }}>
                    Adicionar
                </Button>

                <Button disabled={!paisSelecionado} onClick={() => setIsModalOpen(true)}>
                    Editar
                </Button>

                <Button disabled={!paisSelecionado || loadingStatus} onClick={handleAlternarStatus}>
                    {paisSelecionado?.ativo ? 'Desativar' : 'Ativar'}
                </Button>

                <Button disabled={!paisSelecionado || loadingStatus} onClick={handleExcluir}>
                    Excluir
                </Button>
            </div>

            <DataTable
                data={paises}
                columns={columns}
                selectedRow={paisSelecionado}
                onRowSelect={setPaisSelecionado} 
            />
            
            <PaisFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                paisSelecionado={paisSelecionado}
                onSuccess={() => setPaisSelecionado(null)}
            />
        </div>
    )
}