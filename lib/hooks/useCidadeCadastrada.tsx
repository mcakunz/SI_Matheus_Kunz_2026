import { useEffect } from "react"

const CANAL = "cidade-cadastrada"

export type CidadeCadastradaEvent = {
    id: number
    cidade: string
    estadoId: number
}

export function emitirCidadeCadastrada(cidade: CidadeCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(cidade)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useCidadeCadastrada(callback: (cidade: CidadeCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}