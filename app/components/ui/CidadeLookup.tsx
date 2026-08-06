"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { CidadeSelect } from "@/lib/types"

interface CidadeLookupProps {
    cidades: CidadeSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
    /** Chamado quando uma nova cidade é criada pelo modal de cadastro rápido. */
    onCriado?: (novo: CidadeSelect) => void
}

export function CidadeLookup({ cidades, value, onChange, required, error, onCriado }: CidadeLookupProps) {
    const items = cidades.map(c => ({ id: c.id, label: c.cidade }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar cidade..."
            pesquisaPlaceholder="Pesquisar cidade..."
            msgSemResultadoEncontrado="Nenhuma cidade encontrada."
            pathCadastro="/cidades"
            pathLabel="Cadastrar nova cidade"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="cidade"
            onCriado={onCriado}
        />
    )
}