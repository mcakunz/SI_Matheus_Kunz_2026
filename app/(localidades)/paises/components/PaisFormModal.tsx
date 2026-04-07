"use client"

import { useState } from "react"
import { salvarPais } from "../actions"

import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { RequiredSymbol } from "@/app/components/ui/RequiredSymbol"
import toast from "react-hot-toast"

interface PaisFormModalProps {
    isOpen: boolean
    onClose: () => void
    paisSelecionado: any | null
    onSuccess: () => void 
}

export function PaisFormModal({ 
    isOpen, 
    onClose, 
    paisSelecionado, 
    onSuccess } : PaisFormModalProps) {
    const [loading, setLoading] = useState(false)

    const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        
        try {
            await salvarPais(formData)
            toast.success(paisSelecionado ? "País atualizado com sucesso!" : "País cadastrado com sucesso!")
            onSuccess() 
            onClose()   
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={paisSelecionado ? "Editar País" : "Novo País"}
            >
                <form onSubmit={handleSalvar} className="flex flex-col gap-4 text-slate-900">
                    <input type="hidden" name="id" value={paisSelecionado?.id || ''} />

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do País <RequiredSymbol/></label>
                        <input name="pais" required defaultValue={paisSelecionado?.pais || ""} className="w-full p-2 border rounded outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Código BACEN<RequiredSymbol/></label>
                            <input name="codigo" required maxLength={5} defaultValue={paisSelecionado?.codigo || ""} className="w-full p-2 border rounded outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sigla <RequiredSymbol/></label>
                            <input name="sigla" required maxLength={3} defaultValue={paisSelecionado?.sigla || ""} className="w-full p-2 border rounded uppercase outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nacionalidade <RequiredSymbol/></label>
                            <input name="nacionalidade" required defaultValue={paisSelecionado?.nacionalidade || ""} className="w-full p-2 border rounded outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Moeda <RequiredSymbol/></label>
                            <input name="moeda" required maxLength={3} placeholder="Ex: BRL" defaultValue={paisSelecionado?.moeda || ""} className="w-full p-2 border rounded outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="ativo" defaultValue={paisSelecionado ? (paisSelecionado.ativo ? 'true' : 'false') : 'true'} className="w-full p-2 border rounded bg-white">
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="mt-4 w-full h-10"
                    >
                        {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </form>
            </Modal>
    )
}