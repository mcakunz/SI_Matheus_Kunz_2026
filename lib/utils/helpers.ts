
import z from "zod"

export function nullableString(value: FormDataEntryValue | null): string | null {
    if (!value || (value as string).trim() === '') return null
    return (value as string).trim()
}

export function parseJsonField<T>(value: FormDataEntryValue | null, schema: z.ZodType<T[]>): T[] {
    if (!value) return []
    try {
        const parsed = JSON.parse(value as string)
        const result = schema.safeParse(parsed)
        if (!result.success) throw new Error(result.error.issues[0].message)
        return result.data
    } catch {
        return []
    }
}

export const apenasNumeros = (valor: string | null | undefined) => {
    return valor ? valor.replace(/\D/g, '') : '';
};

export const toDateString = (value: string | Date | null | undefined): string => {
    if (!value) return ''
    const d = value instanceof Date ? value : new Date(value)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
}

// Detecta automaticamente se a placa digitada é Mercosul
export function isMercosul(placa: string): boolean {
    const limpo = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    return /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(limpo)
}