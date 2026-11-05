"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { FormInput } from "@/components/ui/FormInput"

interface CampoNumericoProps {
    value: number | undefined
    onChange: (valor: number) => void
    onBlur?: () => void
    /** Máximo de casas decimais aceitas ao digitar (ex.: 2 para reais, 6 para unitário e percentual). */
    casas?: number
    /** Casas decimais mostradas no mínimo quando o campo não está em edição (ex.: 2 → "10,00"). */
    casasMinimas?: number
    /** Máximo de dígitos antes da vírgula. */
    maxInteiros?: number
    disabled?: boolean
    placeholder?: string
    className?: string
    ariaLabel?: string
}

const soSignificativos = (t: string) => t.replace(/[^\d,]/g, '')

/** Texto "1.234,56" -> 1234.56 */
function lerTexto(texto: string): number {
    const n = parseFloat(texto.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
}

/** Número -> texto pt-BR com milhar. Mostra sempre as casas existentes (até `casas`) e no mínimo `casasMinimas`. */
function formatarNumero(n: number | undefined, casas: number, casasMinimas: number): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0
    return v.toLocaleString('pt-BR', {
        minimumFractionDigits: Math.min(casasMinimas, casas),
        maximumFractionDigits: casas,
    })
}

/** Limpa o que foi digitado e devolve o texto já com a máscara aplicada. */
function aplicarMascara(bruto: string, casas: number, maxInteiros: number): string {
    let s = bruto.replace(/[^\d.,]/g, '')

    // O formatador nunca deixa um ponto no fim, então um ponto no fim foi digitado agora
    // (teclado numérico): vale como vírgula decimal.
    if (casas > 0 && !s.includes(',') && s.endsWith('.')) s = s.slice(0, -1) + ','

    const posVirgula = casas > 0 ? s.indexOf(',') : -1
    let inteiro = (posVirgula === -1 ? s : s.slice(0, posVirgula)).replace(/\D/g, '')
    let decimal = posVirgula === -1 ? '' : s.slice(posVirgula + 1).replace(/\D/g, '')

    inteiro = inteiro.replace(/^0+(?=\d)/, '').slice(0, maxInteiros)
    decimal = decimal.slice(0, casas)

    const inteiroFmt = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    if (posVirgula === -1) return inteiroFmt
    return `${inteiroFmt || '0'},${decimal}`
}

/** Posição do cursor logo depois do n-ésimo caractere significativo (dígito ou vírgula). */
function posicaoApos(texto: string, n: number): number {
    if (n <= 0) return 0
    let contados = 0
    for (let i = 0; i < texto.length; i++) {
        if (/[\d,]/.test(texto[i])) contados++
        if (contados === n) return i + 1
    }
    return texto.length
}

/**
 * Campo numérico alinhado à direita com máscara pt-BR: milhar com ponto e decimal com vírgula,
 * aplicada enquanto digita. Fora de edição mostra as casas mínimas (10 → "10,00"); em edição
 * o texto fica como foi digitado. Devolve sempre um number (vazio = 0) e nunca aceita negativo.
 */
export function CampoNumerico({
    value,
    onChange,
    onBlur,
    casas = 2,
    casasMinimas = 2,
    maxInteiros = 9,
    disabled,
    placeholder,
    className = "",
    ariaLabel,
}: CampoNumericoProps) {
    const [texto, setTexto] = useState(() => formatarNumero(value, casas, casasMinimas))
    const inputRef = useRef<HTMLInputElement>(null)
    const caretRef = useRef<number | null>(null)
    const acabouDeFocar = useRef(false)

    // Mudança vinda de fora (ex.: o percentual recalculado quando o usuário edita o valor em R$).
    // Quando o valor bate com o que está digitado, o texto é preservado (ex.: "1," continua "1,").
    useEffect(() => {
        const v = Number.isFinite(value as number) ? (value as number) : 0
        if (Math.abs(lerTexto(texto) - v) > 1e-9) {
            setTexto(formatarNumero(v, casas, casasMinimas))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    // Reaplica a posição do cursor depois que o texto formatado entra no input.
    useLayoutEffect(() => {
        const el = inputRef.current
        if (caretRef.current !== null && el && document.activeElement === el) {
            el.setSelectionRange(caretRef.current, caretRef.current)
        }
        caretRef.current = null
    }, [texto])

    const aoDigitar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const bruto = e.target.value
        const cursor = e.target.selectionStart ?? bruto.length

        let significativosAntes = soSignificativos(bruto.slice(0, cursor)).length
        if (casas > 0 && !bruto.includes(',') && bruto.endsWith('.')) significativosAntes += 1

        const novo = aplicarMascara(bruto, casas, maxInteiros)
        caretRef.current = posicaoApos(novo, significativosAntes)
        setTexto(novo)
        onChange(lerTexto(novo))
    }

    const aoSair = () => {
        setTexto(formatarNumero(lerTexto(texto), casas, casasMinimas))
        onBlur?.()
    }

    return (
        <FormInput
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={ariaLabel}
            value={texto}
            onChange={aoDigitar}
            onFocus={e => {
                // Seleciona tudo ao entrar: digitar já substitui o valor. O mouseup logo depois
                // desfaria a seleção, então é ignorado uma única vez.
                acabouDeFocar.current = true
                e.currentTarget.select()
            }}
            onMouseUp={e => {
                if (acabouDeFocar.current) {
                    e.preventDefault()
                    acabouDeFocar.current = false
                }
            }}
            onBlur={aoSair}
            disabled={disabled}
            placeholder={placeholder}
            className={`text-right ${className}`}
        />
    )
}