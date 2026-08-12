import { BaseLookup } from "@/components/ui/BaseLookup"
import { CondicaoPagamentoSelect } from "@/lib/types"

interface CondicaoPagamentoLookupProps {
    condicoes: CondicaoPagamentoSelect[]
    value: string
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: CondicaoPagamentoSelect) => void
}

export function CondicaoPagamentoLookup({ condicoes, value, onChange, required, error, onCriado }: CondicaoPagamentoLookupProps) {
    const items = condicoes.map(c => ({ id: c.id, label: c.condicaoPagamento }))

    return (
        <BaseLookup
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            pathCadastro="/condicoes-pagamento"
            pathLabel="Cadastrar nova condição de pagamento"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="condicaoPagamento"
            onCriado={onCriado}
        />
    )
}