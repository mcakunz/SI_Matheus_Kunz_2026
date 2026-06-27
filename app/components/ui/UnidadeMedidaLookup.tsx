"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { UnidadeMedidaSelect } from "@/lib/types"

interface UnidadeMedidaProps {
    unidades:  UnidadeMedidaSelect[]
    value:     string | undefined
    onChange:  (id: string) => void
    required?: boolean
    error?:    string
}

export function UnidadeMedidaLookup({ unidades, value, onChange, required, error }: UnidadeMedidaProps) {
    const items = unidades.map(u => ({ id: u.id, label: u.unidadeMedida }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma unidade..."
            pesquisaPlaceholder="Pesquisar unidade..."
            msgSemResultadoEncontrado="Nenhuma unidade encontrada."
            pathCadastro="/unidades-medida"
            pathLabel="Cadastrar nova unidade"
            editTitle={label => `Editar ${label}`}
        />
    )
}