import { useEffect } from "react";

const CANAL = "forma-pagamento-cadastrada"

export type FormaPagamentoCadastradaEvent = {
    id: number
    formaPagamento: string
}

export function emitirFormaPagamentoCadastrada(forma: FormaPagamentoCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(forma)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useFormaPagamentoCadastrada(callback: (forma: FormaPagamentoCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}