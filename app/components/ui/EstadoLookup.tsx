"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { EstadoSelect } from "@/lib/types"

interface EstadoLookupProps {
    estados: EstadoSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function EstadoLookup({ estados, value, onChange, required, error }: EstadoLookupProps) {
    const items = estados.map(e => ({ id: e.id, label: e.estado }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar estado..."
            pesquisaPlaceholder="Pesquisar estado..."
            msgSemResultadoEncontrado="Nenhum estado encontrado."
            pathCadastro="/estados"
            pathLabel="Cadastrar novo estado"
            editTitle={label => `Editar ${label}`}
        />
    )
}