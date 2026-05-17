import { useEffect } from "react"

const CANAL = "pais-cadastrado"

export type PaisCadastradoEvent = {
    id: number
    pais: string
}

export function emitirPaisCadastrado(pais: PaisCadastradoEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(pais)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function usePaisCadastrado(callback: (pais: PaisCadastradoEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}
