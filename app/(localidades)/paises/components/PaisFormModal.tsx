"use client"

import { useState } from "react"
import { salvarPais } from "../actions"

import toast from "react-hot-toast"

import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { Pais } from "@/lib/types"

interface PaisFormModalProps {
    isOpen: boolean
    onClose: () => void
    paisSelecionado: Pais | null
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
                        <FormLabel required>Nome do País</FormLabel>
                        <FormInput 
                            name="pais" 
                            required 
                            defaultValue={paisSelecionado?.pais || ""} 
                            placeholder="Digite o nome do país"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FormLabel required>Código BACEN</FormLabel>
                            <FormInput 
                                name="codigo" 
                                required 
                                maxLength={5} 
                                defaultValue={paisSelecionado?.codigo || ""} 
                                placeholder="Ex: 1058"
                            />
                        </div>
                        <div>
                            <FormLabel required>Sigla</FormLabel>
                            <FormInput 
                                name="sigla" 
                                required 
                                maxLength={3} 
                                defaultValue={paisSelecionado?.sigla || ""} 
                                className="uppercase" 
                                placeholder="Ex: BRA"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FormLabel required>Nacionalidade</FormLabel>
                            <FormInput 
                                name="nacionalidade" 
                                required 
                                defaultValue={paisSelecionado?.nacionalidade || ""} 
                                placeholder="Ex: Brasileira"
                            />
                        </div>
                        <div>
                            <FormLabel required>Moeda</FormLabel>
                            <FormInput 
                                name="moeda" 
                                required 
                                maxLength={3} 
                                placeholder="Ex: BRL" 
                                defaultValue={paisSelecionado?.moeda || ""} 
                                className="uppercase"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel>Status</FormLabel>
                        <FormSelect 
                            name="ativo" 
                            defaultValue={paisSelecionado ? (paisSelecionado.ativo ? 'true' : 'false') : 'true'}
                        >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </FormSelect>
                    </div>
                    
                    {paisSelecionado && (
                        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                            <span>Cadastrado em: {new Date(paisSelecionado.data_cadastro).toLocaleDateString('pt-BR')}</span>
                            {paisSelecionado.data_alteracao && (
                                <span>Última alteração: {new Date(paisSelecionado.data_alteracao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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