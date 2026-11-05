"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { FornecedorSelect } from "@/lib/types"
import { mascaraCpfCnpj } from "@/lib/utils/mascaras"

// "cpfCnpj" é opcional: quando a tela envia o documento (ex.: Nota de Entrada), o rótulo mostra
// ID + nome + CPF/CNPJ para diferenciar fornecedores com nomes parecidos. Sem ele (outras telas),
// o rótulo continua sendo só o nome.
type FornecedorLookupItem = FornecedorSelect & { cpfCnpj?: string }

interface FornecedorLookupProps {
    fornecedores: FornecedorLookupItem[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: FornecedorSelect) => void
    disabled?: boolean
    /** Mostra o botão de lupa ao lado do campo (e troca o "+" de cadastro direto por ele). */
    onPesquisar?: () => void
}

export function FornecedorLookup({ fornecedores, value, onChange, required, error, onCriado, disabled, onPesquisar }: FornecedorLookupProps) {
    const items = fornecedores.map(f => ({
        id: f.id,
        label: f.cpfCnpj
            ? `#${f.id} · ${f.fornecedor} · ${mascaraCpfCnpj(f.cpfCnpj)}`
            : f.fornecedor,
    }))

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
            onPesquisar={onPesquisar}
        />
    )
}