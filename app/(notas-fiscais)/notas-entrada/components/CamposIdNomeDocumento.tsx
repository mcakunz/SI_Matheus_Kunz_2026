"use client"

import { useState } from "react"
import { FormInput } from "@/components/ui/FormInput"
import { FormLabel } from "@/components/ui/FormLabel"
import { mascaraCpfCnpj } from "@/lib/utils/mascaras"

export interface ItemIdNomeDocumento {
    id: number
    documento: string // CPF ou CNPJ, com ou sem máscara
}

export interface LookupRenderProps {
    value: string | undefined
    onChange: (id: string) => void
    error?: string
    disabled?: boolean
    onPesquisar: () => void
}

interface CamposIdNomeDocumentoProps<T extends ItemIdNomeDocumento> {
    itens: T[]
    value: string | undefined
    onChange: (id: string) => void
    error?: string
    disabled?: boolean
    onPesquisar: () => void
    /** Rótulo do campo do meio (ex.: "Fornecedor", "Transportadora"). */
    rotulo: string
    obrigatorio?: boolean
    /** Avisos quando o ID ou o documento digitado não existe (ex.: "Nenhum fornecedor com este ID."). */
    msgSemId: string
    msgSemDocumento: string
    /** Desenha o combobox do meio (FornecedorLookup, TransportadoraLookup...). */
    renderLookup: (props: LookupRenderProps) => React.ReactNode
}

const soDigitos = (v: string) => v.replace(/\D/g, '')

/**
 * Três campos que devolvem o mesmo registro: ID, Nome (combobox + lupa) e CPF/CNPJ.
 * Digitar o ID ou o documento já seleciona o registro correspondente e preenche os outros dois.
 * Usado por FornecedorCampos e TransportadoraCampos na Nota de Entrada.
 *
 * Devolve três células soltas (Fragment) para encaixar direto nas colunas do grid do pai.
 */
export function CamposIdNomeDocumento<T extends ItemIdNomeDocumento>({
    itens, value, onChange, error, disabled, onPesquisar,
    rotulo, obrigatorio = false, msgSemId, msgSemDocumento, renderLookup,
}: CamposIdNomeDocumentoProps<T>) {
    const [idTxt, setIdTxt] = useState('')
    const [docTxt, setDocTxt] = useState('')
    const [aviso, setAviso] = useState<string | null>(null)

    // Qualquer caminho que escolha o registro (combobox, lupa, cadastro novo, edição pelo lápis)
    // muda o `value` ou recarrega a lista; aí os campos de ID e documento acompanham.
    // (Ajuste de estado durante a renderização, padrão recomendado pelo React no lugar de um useEffect.)
    const atual = itens.find(x => String(x.id) === value)
    const [sincronizadoCom, setSincronizadoCom] = useState<T | undefined>(undefined)
    if (atual !== sincronizadoCom) {
        setSincronizadoCom(atual)
        if (atual) {
            setIdTxt(String(atual.id))
            setDocTxt(mascaraCpfCnpj(atual.documento))
            setAviso(null)
        }
    }

    const aoMudarCombo = (id: string) => {
        onChange(id)
        if (!id) { // o "X" do combobox limpa os três campos
            setIdTxt('')
            setDocTxt('')
            setAviso(null)
        }
    }

    const aoDigitarId = (bruto: string) => {
        const txt = soDigitos(bruto).slice(0, 9)
        setIdTxt(txt)

        if (!txt) {
            onChange('')
            setDocTxt('')
            setAviso(null)
            return
        }

        const item = itens.find(x => x.id === Number(txt))
        if (item) {
            onChange(String(item.id))
            setDocTxt(mascaraCpfCnpj(item.documento))
            setAviso(null)
        } else {
            // Digitou "12" (existe) e depois "123" (não existe): a seleção anterior não pode ficar valendo.
            onChange('')
            setDocTxt('')
            setAviso(msgSemId)
        }
    }

    const aoDigitarDoc = (bruto: string) => {
        const digitos = soDigitos(bruto).slice(0, 14)
        setDocTxt(mascaraCpfCnpj(digitos))

        if (digitos.length !== 11 && digitos.length !== 14) {
            // Mexeu no documento de um registro já escolhido: desfaz a seleção até completar de novo.
            if (value) {
                onChange('')
                setIdTxt('')
            }
            setAviso(null)
            return
        }

        const item = itens.find(x => soDigitos(x.documento) === digitos)
        if (item) {
            onChange(String(item.id))
            setIdTxt(String(item.id))
            setAviso(null)
        } else {
            if (value) onChange('')
            setIdTxt('')
            // Com 11 dígitos ainda pode ser um CNPJ sendo digitado, então só avisa com 14 (ou ao sair do campo).
            setAviso(digitos.length === 14 ? msgSemDocumento : null)
        }
    }

    const aoSairDoDoc = () => {
        if (!value && soDigitos(docTxt).length > 0) setAviso(msgSemDocumento)
    }

    return (
        <>
            <div>
                <FormLabel>ID</FormLabel>
                <FormInput
                    value={idTxt}
                    onChange={e => aoDigitarId(e.target.value)}
                    disabled={disabled}
                    inputMode="numeric"
                    placeholder="ID"
                    maxLength={9}
                    className="text-right"
                />
            </div>

            <div>
                <FormLabel required={obrigatorio}>{rotulo}</FormLabel>
                {renderLookup({ value, onChange: aoMudarCombo, error, disabled, onPesquisar })}
                {aviso && <p className="text-xs text-amber-600 mt-1">{aviso}</p>}
            </div>

            <div>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormInput
                    value={docTxt}
                    onChange={e => aoDigitarDoc(e.target.value)}
                    onBlur={aoSairDoDoc}
                    disabled={disabled}
                    inputMode="numeric"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                />
            </div>
        </>
    )
}
