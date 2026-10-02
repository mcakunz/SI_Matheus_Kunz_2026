"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { FornecedorSelect } from "@/lib/types"

interface FornecedorLookupProps {
    fornecedores: FornecedorSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: FornecedorSelect) => void
    disabled?: boolean
}

export function FornecedorLookup({ fornecedores, value, onChange, required, error, onCriado, disabled }: FornecedorLookupProps) {
    const items = fornecedores.map(f => ({ id: f.id, label: f.fornecedor }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar fornecedor..."
            pesquisaPlaceholder="Pesquisar fornecedor..."
            msgSemResultadoEncontrado="Nenhum fornecedor encontrado."
            pathCadastro="/fornecedores"
            pathLabel="Cadastrar novo fornecedor"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="fornecedor"
            onCriado={onCriado}
            disabled={disabled}
        />
    )
}