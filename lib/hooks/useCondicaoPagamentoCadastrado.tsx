import { useEffect } from "react";

const CANAL = "condicao-pagamento-cadastrada"

export type CondicaoPagamentoCadastradaEvent = {
    id: number
    condicaoPagamento: string
}

export function emitirCondicaoPagamentoCadastrada(condicao: CondicaoPagamentoCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(condicao)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useCondicaoPagamentoCadastrada(callback: (condicao: CondicaoPagamentoCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}