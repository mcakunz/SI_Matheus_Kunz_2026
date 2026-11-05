"use client"

import { useMemo } from "react"
import { FornecedorLookup } from "@/app/components/ui/FornecedorLookup"
import { CamposIdNomeDocumento } from "./CamposIdNomeDocumento"
import type { FornecedorPesquisa } from "../pesquisaTipos"

interface FornecedorCamposProps {
    fornecedores: FornecedorPesquisa[]
    value: string | undefined
    onChange: (id: string) => void
    error?: string
    disabled?: boolean
    onPesquisar: () => void
}

/** ID, Fornecedor (combobox + lupa) e CPF/CNPJ — ver CamposIdNomeDocumento. */
export function FornecedorCampos({ fornecedores, value, onChange, error, disabled, onPesquisar }: FornecedorCamposProps) {
    const itens = useMemo(
        () => fornecedores.map(f => ({ id: f.id, fornecedor: f.fornecedor, documento: f.cpfCnpj })),
        [fornecedores]
    )

    return (
        <CamposIdNomeDocumento
            itens={itens}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            onPesquisar={onPesquisar}
            rotulo="Fornecedor"
            obrigatorio
            msgSemId="Nenhum fornecedor com este ID."
            msgSemDocumento="Nenhum fornecedor com este CPF/CNPJ."
            renderLookup={p => (
                // O combobox mostra só o nome: ID e CPF/CNPJ têm campo próprio ao lado.
                <FornecedorLookup fornecedores={itens} {...p} />
            )}
        />
    )
}
