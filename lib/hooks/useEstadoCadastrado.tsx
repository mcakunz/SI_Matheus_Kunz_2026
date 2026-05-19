import { useEffect } from "react";

const CANAL = "estado-cadastrado"

export type EstadoCadastradoEvent = {
    id: number
    estado: string
}

export function emitirEstadoCadastrado(estado: EstadoCadastradoEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(estado)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useEstadoCadastrado(callback: (estado: EstadoCadastradoEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}