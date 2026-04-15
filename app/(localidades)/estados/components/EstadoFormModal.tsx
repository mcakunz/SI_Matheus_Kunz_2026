"use client"

import { useState } from "react"
import { salvarEstado } from "../actions" 

import toast from "react-hot-toast"

import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { EstadoComPais, PaisSelect } from "@/lib/types"

interface EstadoFormModalProps {
    isOpen: boolean
    onClose: () => void
    estadoSelecionado: EstadoComPais | null
    listaPaises: PaisSelect[]
    onSuccess: () => void 
}

export function EstadoFormModal({ 
    isOpen, 
    onClose, 
    estadoSelecionado, 
    listaPaises, 
    onSuccess 
} : EstadoFormModalProps) {
    const [loading, setLoading] = useState(false)

    const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        
        try {
            await salvarEstado(formData)
            toast.success(estadoSelecionado ? "Estado atualizado com sucesso!" : "Estado cadastrado com sucesso!")
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
            title={estadoSelecionado ? "Editar Estado" : "Novo Estado"}
        >
            <form onSubmit={handleSalvar} className="flex flex-col gap-4 text-slate-900">
                <input type="hidden" name="id" value={estadoSelecionado?.id || ''} />

                <div>
                    <FormLabel required>Nome do Estado</FormLabel>
                    <FormInput 
                        name="estado" 
                        required 
                        defaultValue={estadoSelecionado?.estado || ""} 
                        placeholder="Digite o nome do estado"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormLabel required>UF</FormLabel>
                        <FormInput 
                            name="uf" 
                            required 
                            maxLength={2} 
                            defaultValue={estadoSelecionado?.uf || ""} 
                            className="uppercase" 
                            placeholder="Ex: PR"
                        />
                    </div>
                    <div>
                        <FormLabel required>País</FormLabel>
                        <FormSelect 
                            name="pais_id" 
                            required 
                            defaultValue={estadoSelecionado?.pais_id || ""}
                        >
                            <option value="" disabled>Selecione um país...</option>
                            {listaPaises.map((pais) => (
                                <option key={pais.id} value={pais.id}>
                                    {pais.pais}
                                </option>
                            ))}
                        </FormSelect>
                    </div>
                </div>

                <div>
                    <FormLabel>Status</FormLabel>
                    <FormSelect 
                        name="ativo" 
                        defaultValue={estadoSelecionado ? (estadoSelecionado.ativo ? 'true' : 'false') : 'true'}
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </FormSelect>
                </div>
                
                {estadoSelecionado && (
                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                        <span>Cadastrado em: {new Date(estadoSelecionado.data_cadastro).toLocaleDateString('pt-BR')}</span>
                        {estadoSelecionado.data_alteracao && (
                            <span>Última alteração: {new Date(estadoSelecionado.data_alteracao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                    </div>
                )}

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