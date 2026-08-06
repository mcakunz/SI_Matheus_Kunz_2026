import dynamic from "next/dynamic"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CadastroModalConfig, TipoCadastroModal } from "./types"

const loading = () => (
    <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
    </div>
)

/**
 * Único lugar que precisa ser tocado para "plugar" uma entidade nova no
 * sistema de cadastro rápido em modal.
 *
 * Requisitos para o Form entrar aqui:
 *   1. Aceitar { onSuccess, onCancel } (ver QuickCreateFormProps em ./types)
 *   2. Ter uma action "salvarXComRetorno" (usada quando onSuccess existe)
 *   3. Se depender de listas (ex: Estado depende de País), a prop dessa
 *      lista deve ser opcional — o Form busca sozinho quando não recebida
 *      (ver padrão em EstadoForm/CidadeForm + listarXAtivos)
 *
 * Import é feito via next/dynamic para não inflar o bundle inicial com
 * formulários grandes (ex: cliente) que só serão usados ocasionalmente
 * dentro de um modal.
 */
export const cadastroModalRegistry: Record<TipoCadastroModal, CadastroModalConfig> = {
    pais: {
        titulo: "Novo País",
        Componente: dynamic(
            () => import("@/app/(localidades)/paises/components/PaisForm").then(m => m.PaisForm),
            { loading }
        ),
    },
    estado: {
        titulo: "Novo Estado",
        Componente: dynamic(
            () => import("@/app/(localidades)/estados/components/EstadoForm").then(m => m.EstadoForm),
            { loading }
        ),
    },
    cidade: {
        titulo: "Nova Cidade",
        Componente: dynamic(
            () => import("@/app/(localidades)/cidades/components/CidadeForm").then(m => m.CidadeForm),
            { loading }
        ),
    },

    cliente: {
        titulo: "Novo Cliente",
        Componente: dynamic(
            () => import("@/app/(cadastros)/clientes/components/ClienteForm").then(m => m.ClienteForm),
            { loading }
        ),
    },
}