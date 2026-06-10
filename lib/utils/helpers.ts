
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