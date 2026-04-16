"use client"

import { useState } from "react"
import { salvarCidade } from "../actions" 

import toast from "react-hot-toast"

import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { CidadeComEstado, EstadoSelect } from "@/lib/types"

interface CidadeFormModalProps {
    isOpen: boolean
    onClose: () => void
    cidadeSelecionada: CidadeComEstado | null
    listaEstados: EstadoSelect[]
    onSuccess: () => void 
}

export function CidadeFormModal({ 
    isOpen, 
    onClose, 
    cidadeSelecionada, 
    listaEstados, 
    onSuccess 
} : CidadeFormModalProps) {
    const [loading, setLoading] = useState(false)

    const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        
        try {
            await salvarCidade(formData)
            toast.success(cidadeSelecionada ? "Cidade atualizada com sucesso!" : "Cidade cadastrada com sucesso!")
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
            title={cidadeSelecionada ? "Editar Cidade" : "Nova Cidade"}
        >
            <form onSubmit={handleSalvar} className="flex flex-col gap-4 text-slate-900">
                <input type="hidden" name="id" value={cidadeSelecionada?.id || ''} />

                <div>
                    <FormLabel required>Nome da Cidade</FormLabel>
                    <FormInput 
                        name="cidade" 
                        required 
                        defaultValue={cidadeSelecionada?.cidade || ""} 
                        placeholder="Digite o nome da cidade"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormLabel required>Código IBGE</FormLabel>
                        <FormInput 
                            name="codigo_ibge" 
                            required 
                            maxLength={7} 
                            defaultValue={cidadeSelecionada?.codigo_ibge || ""} 
                            placeholder="Ex: 4127700" 
                        />
                    </div>
                    <div>
                        <FormLabel required>Estado</FormLabel>
                        <FormSelect 
                            name="estado_id" 
                            required 
                            defaultValue={cidadeSelecionada?.estado_id || ""}
                        >
                            <option value="" disabled>Selecione um estado...</option>
                            {listaEstados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.estado}
                                </option>
                            ))}
                        </FormSelect>
                    </div>
                </div>

                <div>
                    <FormLabel>Status</FormLabel>
                    <FormSelect 
                        name="ativo" 
                        defaultValue={cidadeSelecionada ? (cidadeSelecionada.ativo ? 'true' : 'false') : 'true'}
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </FormSelect>
                </div>
                
                {cidadeSelecionada && (
                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                        <span>Cadastrado em: {new Date(cidadeSelecionada.data_cadastro).toLocaleDateString('pt-BR')}</span>
                        {cidadeSelecionada.data_alteracao && (
                            <span>Última alteração: {new Date(cidadeSelecionada.data_alteracao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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