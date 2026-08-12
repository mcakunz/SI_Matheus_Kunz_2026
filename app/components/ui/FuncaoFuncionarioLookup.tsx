"use client"

import { BaseLookup } from "@/components/ui/BaseLookup"
import { FuncaoFuncionarioSelect } from "@/lib/types"

interface FuncaoFuncionarioProps {
    funcoes: FuncaoFuncionarioSelect[]
    value: string | undefined
    onChange: (id: string) => void
    required?: boolean
    error?: string
    onCriado?: (novo: FuncaoFuncionarioSelect) => void 
}

export function FuncaoFuncionarioLookup({ funcoes, value, onChange, required, error, onCriado }: FuncaoFuncionarioProps) {
    const items = funcoes.map(f => ({ id: f.id, label: f.funcaoFuncionario }))

    return (
        <BaseLookup 
            items={items}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder="Selecionar uma função..."
            pesquisaPlaceholder="Pesquisar função..."
            msgSemResultadoEncontrado="Nenhuma função encontrada."
            pathCadastro="/funcoes-funcionario"
            pathLabel="Cadastrar nova função"
            editTitle={label => `Editar ${label}`}
            tipoCadastro="funcaoFuncionario" 
            onCriado={onCriado}              
        />
    )
}