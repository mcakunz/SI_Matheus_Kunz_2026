"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { FormaPagamentoSelect } from "@/lib/types"

interface FormaPagamentoLookupProps {
    formas: FormaPagamentoSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
}

export function FormaPagamentoLookup({ formas, value, onChange, required, error }: FormaPagamentoLookupProps) {
    const items = formas.map(f => ({ id: f.id, label: f.formaPagamento }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma forma de pagamento..."
            pesquisaPlaceholder="Pesquisar forma de pagamento..."
            msgSemResultadoEncontrado="Nenhuma forma de pagamento encontrada."
            pathCadastro="/formas-pagamento"
            pathLabel="Cadastrar nova forma de pagamento"
            editTitle={label => `Editar ${label}`}
        />
    )
}