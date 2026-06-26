"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { CategoriaSelect } from "@/lib/types"

interface CategoriaProps {
    categorias: CategoriaSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function CategoriaLookup({ categorias, value, onChange, required, error }: CategoriaProps) {
    const items = categorias.map(c => ({ id: c.id, label: c.categoria }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma categoria..."
            pesquisaPlaceholder="Pesquisar categoria..."
            msgSemResultadoEncontrado="Nenhuma categoria encontrada."
            pathCadastro="/categorias"
            pathLabel="Cadastrar nova categoria"
            editTitle={label => `Editar ${label}`}
        />
    )
}