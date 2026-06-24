import { useEffect } from "react";

const CANAL = "veiculo-cadastrado"

export type VeiculoCadastradoEvent = {
    id: number
    placa: string
    modelo: string
    marca: string
}

export function emitirVeiculoCadastrado(veiculo: VeiculoCadastradoEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(veiculo)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useVeiculoCadastrado(callback: (veiculo: VeiculoCadastradoEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}