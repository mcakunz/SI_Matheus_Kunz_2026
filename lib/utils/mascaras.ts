export function mascaraCPF(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function mascaraCNPJ(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 14)
    if (d.length <= 2) return d
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function mascaraTelefone(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d.length ? `(${d}` : ''
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Aplica máscara "AAA-0000" para placa padrão 
export function mascaraPlacaPadrao(val: string): string {
    const limpo = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7)
    if (limpo.length > 3) return `${limpo.slice(0, 3)}-${limpo.slice(3)}`
    return limpo
}

// Aplica máscara "AAA0A00" para placa Mercosul
export function mascaraPlacaMercosul(val: string): string {
    return val.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7)
}
