"use client"

import { BaseLookup } from "../../../components/ui/BaseLookup"
import { TransportadoraSelect } from "@/lib/types"
import { mascaraCpfCnpj } from "@/lib/utils/mascaras"

// "cnpj" é opcional: quando a tela envia o documento, o rótulo mostra ID + razão social + CNPJ.
type TransportadoraLookupItem = TransportadoraSelect & { cnpj?: string }

interface TransportadoraProps {
    transportadoras: TransportadoraLookupItem[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: TransportadoraSelect) => void 
    disabled?: boolean
    /** Mostra o botão de lupa ao lado do campo (e troca o "+" de cadastro direto por ele). */
    onPesquisar?: () => void
}

export function TransportadoraLookup({ transportadoras, value, onChange, required, error, onCriado, disabled, onPesquisar }: TransportadoraProps) {
    const items = transportadoras.map(t => ({
        id: t.id,
        label: t.cnpj
            ? `#${t.id} · ${t.razaoSocialNome} · ${mascaraCpfCnpj(t.cnpj)}`
            : t.razaoSocialNome,
    }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma transportadora..."
            pesquisaPlaceholder="Pesquisar transportadora..."
            msgSemResultadoEncontrado="Nenhuma transportadora encontrada."
            pathCadastro="/transportadoras"
            pathLabel="Cadastrar nova transportadora"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="transportadora" 
            onCriado={onCriado}           
            disabled={disabled}
            onPesquisar={onPesquisar}
        />
    )
}