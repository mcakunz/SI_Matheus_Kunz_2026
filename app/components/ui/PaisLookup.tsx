"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { PaisSelect } from "@/lib/types"

interface PaisLookupProps {
    paises: PaisSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
    /** Chamado quando um novo país é criado pelo modal de cadastro rápido. */
    onCriado?: (novo: PaisSelect) => void
}

export function PaisLookup({ paises, value, onChange, required, error, onCriado }: PaisLookupProps) {
    const items = paises.map(p => ({ id: p.id, label: p.pais }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar país..."
            pesquisaPlaceholder="Pesquisar país..."
            msgSemResultadoEncontrado="Nenhum país encontrado."
            pathCadastro="/paises"
            pathLabel="Cadastrar novo país"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="pais"
            onCriado={onCriado}
        />
    )
}