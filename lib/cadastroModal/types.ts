import { ComponentType } from "react"

/**
 * Mapa central: cada chave é um "tipo" de cadastro rápido, e o valor é o
 * formato do registro devolvido pela respectiva action "ComRetorno".
 *
 * Para adicionar uma nova entidade ao sistema de modal (ex: cliente),
 * basta adicionar uma linha aqui com o shape retornado por
 * `salvarClienteComRetorno`.
 */
export interface TipoCadastroModalMap {
    pais:   { id: number; pais: string }
    estado: { id: number; estado: string; paisId: number }
    cidade: { id: number; cidade: string; estadoId: number }
    cliente: { id: number; cliente: string }
}

export type TipoCadastroModal = keyof TipoCadastroModalMap

/**
 * Todo Form que pode ser aberto tanto como página cheia quanto dentro do
 * modal de cadastro rápido deve aceitar estas duas props (opcionais).
 *
 * - Se `onSuccess` for informado, o Form entende que está em "modo modal":
 *   usa a action "ComRetorno" e repassa o registro criado, sem navegar.
 * - Se não for informado, o Form se comporta como página cheia (comportamento
 *   atual: salva e faz router.push).
 */
export interface QuickCreateFormProps<T = any> {
    onSuccess?: (novo: T) => void
    onCancel?: () => void
}

export interface CadastroModalConfig {
    titulo: string
    Componente: ComponentType<QuickCreateFormProps<any>>
}