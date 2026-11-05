"use client"

import { useMemo } from "react"
import { TransportadoraLookup } from "@/app/components/ui/TransportadoraLookup"
import { CamposIdNomeDocumento } from "./CamposIdNomeDocumento"
import type { TransportadoraPesquisa } from "../pesquisaTipos"

interface TransportadoraCamposProps {
    transportadoras: TransportadoraPesquisa[]
    value: string | undefined
    onChange: (id: string) => void
    error?: string
    disabled?: boolean
    onPesquisar: () => void
}

/** ID, Transportadora (combobox + lupa) e CPF/CNPJ — ver CamposIdNomeDocumento. Não é obrigatória. */
export function TransportadoraCampos({ transportadoras, value, onChange, error, disabled, onPesquisar }: TransportadoraCamposProps) {
    const itens = useMemo(
        () => transportadoras.map(t => ({ id: t.id, razaoSocialNome: t.razaoSocialNome, documento: t.cnpj })),
        [transportadoras]
    )

    return (
        <CamposIdNomeDocumento
            itens={itens}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            onPesquisar={onPesquisar}
            rotulo="Transportadora"
            msgSemId="Nenhuma transportadora com este ID."
            msgSemDocumento="Nenhuma transportadora com este CPF/CNPJ."
            renderLookup={p => (
                // O combobox mostra só o nome: ID e CPF/CNPJ têm campo próprio ao lado.
                <TransportadoraLookup transportadoras={itens} {...p} />
            )}
        />
    )
}
