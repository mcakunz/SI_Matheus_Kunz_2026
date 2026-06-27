"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { MarcaSelect } from "@/lib/types"

interface MarcaProps {
    marcas: MarcaSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function MarcaLookup({ marcas, value, onChange, required, error }: MarcaProps) {
    const items = marcas.map(m => ({ id: m.id, label: m.marca }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma marca..."
            pesquisaPlaceholder="Pesquisar marca..."
            msgSemResultadoEncontrado="Nenhuma marca encontrada."
            pathCadastro="/marcas"
            pathLabel="Cadastrar nova marca"
            editTitle={label => `Editar ${label}`}
        />
    )
}