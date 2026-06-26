import { useEffect } from "react";

const CANAL = "categoria-cadastrada"

export type CategoriaCadastradaEvent = {
    id: number 
    categoria: string
}

export function emitirCategoriaCadastrada(categoria: CategoriaCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(categoria)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useCategoriaCadastrada(callback: (categoria: CategoriaCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}