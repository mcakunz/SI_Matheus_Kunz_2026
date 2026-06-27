import { useEffect } from "react"

const CANAL = "marca-cadastrada"

export type MarcaCadastradaEvent = {
    id: number
    marca: string
}

export function emitirMarcaCadastrada(marca: MarcaCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(marca)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useMarcaCadastrada(callback: (marca: MarcaCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}