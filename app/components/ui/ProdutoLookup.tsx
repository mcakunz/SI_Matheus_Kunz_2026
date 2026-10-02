"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { ProdutoSelect } from "@/lib/types"

interface ProdutoLookupProps {
    produtos: ProdutoSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: ProdutoSelect) => void
}

export function ProdutoLookup({ produtos, value, onChange, required, error, onCriado }: ProdutoLookupProps) {
    const items = produtos.map(p => ({ id: p.id, label: p.produto }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar produto..."
            pesquisaPlaceholder="Pesquisar produto..."
            msgSemResultadoEncontrado="Nenhum produto encontrado."
            pathCadastro="/produtos"
            pathLabel="Cadastrar novo produto"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="produto"
            onCriado={onCriado}
        />
    )
}