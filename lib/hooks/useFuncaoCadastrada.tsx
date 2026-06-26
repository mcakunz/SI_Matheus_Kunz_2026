import { useEffect } from "react";

const CANAL = "funcao-cadastrada"

export type FuncaoCadastradaEvent = {
    id: number 
    funcaoFuncionario: string
    requerCnh: boolean
}

export function emitirFuncaoCadastrada(funcao: FuncaoCadastradaEvent) {
    const canal = new BroadcastChannel(CANAL)
    canal.postMessage(funcao)
    canal.close()
    setTimeout(() => window.close(), 50)
}

export function useFuncaoCadastrada(callback: (funcao: FuncaoCadastradaEvent) => void) {
    useEffect(() => {
        const canal = new BroadcastChannel(CANAL)
        canal.onmessage = (e) => callback(e.data)
        return () => canal.close()
    }, [callback])
}