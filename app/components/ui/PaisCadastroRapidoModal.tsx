"use client"

import { useState } from "react"
import { salvarPaisComRetorno } from "@/app/(localidades)/paises/actions"
import toast from "react-hot-toast"

import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"

interface PaisCadastroRapidoModalProps {
    isOpen: boolean
    onClose: () => void
    onSucesso: (novoPais: { id: number; pais: string }) => void
}

export function PaisCadastroRapidoModal({
    isOpen,
    onClose,
    onSucesso,
}: PaisCadastroRapidoModalProps) {
    const [loading, setLoading] = useState(false)

    const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set('ativo', 'true')

        try {
            const novoPais = await salvarPaisComRetorno(formData)
            toast.success("País cadastrado com sucesso!")
            onSucesso(novoPais)
            onClose()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar País" size="md">
            <form onSubmit={handleSalvar} className="flex flex-col gap-4 text-slate-900">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormLabel required>País</FormLabel>
                        <FormInput name="pais" required placeholder="Ex: Brasil" />
                    </div>
                    <div>
                        <FormLabel required>Nacionalidade</FormLabel>
                        <FormInput name="nacionalidade" required placeholder="Ex: Brasileira" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <FormLabel required>Código</FormLabel>
                        <FormInput name="codigo" required maxLength={5} placeholder="Ex: 055" />
                    </div>
                    <div>
                        <FormLabel required>Sigla</FormLabel>
                        <FormInput name="sigla" required maxLength={3} placeholder="Ex: BRA" />
                    </div>
                    <div>
                        <FormLabel required>Moeda</FormLabel>
                        <FormInput name="moeda" required maxLength={3} placeholder="Ex: BRL" />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="mt-2 w-full h-10">
                    {loading ? "Salvando..." : "Salvar País"}
                </Button>
            </form>
        </Modal>
    )
}
