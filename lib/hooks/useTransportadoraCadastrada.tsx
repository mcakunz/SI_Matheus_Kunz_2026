import { useEffect } from "react";

const CANAL = "tranportadora-cadastrada"

export type TranportadoraCadastradaEvent = {
    id: number 
    razaoSocialNome: string
}

export function emitirTransportadoraCadastrada(transportadora: TranportadoraCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(transportadora)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useTranportadoraCadastrada(callback: (transportadora: TranportadoraCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}