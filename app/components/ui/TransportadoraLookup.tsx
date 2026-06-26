"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { TransportadoraSelect } from "@/lib/types"

interface TransportadoraProps {
    transportadoras: TransportadoraSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function TransportadoraLookup({ transportadoras, value, onChange, required, error }: TransportadoraProps) {
    const items = transportadoras.map(t => ({ id: t.id, label: t.razaoSocialNome }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma transportadora..."
            pesquisaPlaceholder="Pesquisar transportadora..."
            msgSemResultadoEncontrado="Nenhuma transportadora encontrada."
            pathCadastro="/transportadoras"
            pathLabel="Cadastrar nova transportadora"
            editTitle={label => `Editar ${label}`}
        />
    )
}