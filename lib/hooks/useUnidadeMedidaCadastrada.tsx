import { useEffect } from "react"

const CANAL = "unidade-medida-cadastrada"

export type UnidadeMedidaCadastradaEvent = {
    id:            number
    unidadeMedida: string
}

export function emitirUnidadeMedidaCadastrada(unidade: UnidadeMedidaCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(unidade)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useUnidadeMedidaCadastrada(callback: (unidade: UnidadeMedidaCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}