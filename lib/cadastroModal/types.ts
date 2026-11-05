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
    condicaoPagamento: { id: number; condicaoPagamento: string }
    formaPagamento: { id: number; formaPagamento: string }
    transportadora: { id: number; razaoSocialNome: string }
    fornecedor: { id: number; fornecedor: string }
    veiculo: { id: number; placa: string; modelo: string; marca: string }
    funcaoFuncionario: { id: number; funcaoFuncionario: string; requerCnh: boolean }
    funcionario: { id: number; funcionario: string }
    produto: { id: number; produto: string }
    categoria: { id: number; categoria: string }
    marca: { id: number; marca: string }
    unidadeMedida: { id: number; unidadeMedida: string }
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
    /**
     * Largura máxima do modal (classe Tailwind, ex.: "max-w-6xl"). Formulários grandes (endereço,
     * contatos...) precisam de mais espaço horizontal; sem isso o modal usa o padrão "max-w-2xl".
     */
    largura?: string
    /**
     * Edição em modal (opcional). Quando existe, `abrirEdicao(tipo, id, ...)` abre o mesmo Form já
     * preenchido. O Form entende que é edição porque recebe o registro (ex.: `produto`) junto com
     * `onSuccess`: aí ele atualiza o registro e devolve `{ id, nome }` em vez de cadastrar um novo.
     */
    edicao?: {
        titulo: string
        /** Server action: busca o registro e tudo que o Form precisa, já no formato das props do Form. */
        carregar: (id: number) => Promise<Record<string, unknown> | null>
    }
}