"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { VeiculoSelect } from "@/lib/types"

interface VeiculoSelectProps {
    veiculos: VeiculoSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function VeiculoLookup({ veiculos, value, onChange, required, error }: VeiculoSelectProps) {
    const items = veiculos.map(v => ({ id: v.id, label: v.modelo }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar um veiculo..."
            pesquisaPlaceholder="Pesquisar veiculo..."
            msgSemResultadoEncontrado="Nenhum veiculo encontrado."
            pathCadastro="/veiculos"
            pathLabel="Cadastrar novo veiculo."
            editTitle={label => `Editar ${label}`}
        />
    )
}