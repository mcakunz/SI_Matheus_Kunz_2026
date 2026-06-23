"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { CondicaoPagamentoSelect } from "@/lib/types"

interface CondicaoPagamentoProps {
    condicoes: CondicaoPagamentoSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function CondicaoPagamentoLookup({ condicoes, value, onChange, required, error }: CondicaoPagamentoProps) {
    const items = condicoes.map(c => ({ id: c.id, label: c.condicaoPagamento }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma condição de pagamento..."
            pesquisaPlaceholder="Pesquisar condição de pagamento..."
            msgSemResultadoEncontrado="Nenhuma condição de pagamento encontrada."
            pathCadastro="/condicoes-pagamento"
            pathLabel="Cadastrar nova condição de pagamento"
            editTitle={label => `Editar ${label}`}
        />
    )
}