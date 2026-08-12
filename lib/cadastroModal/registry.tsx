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
    condicaoPagamento: {
        titulo: "Nova Condição de Pagamento",
        Componente: dynamic(
            () => import("@/app/(financeiro)/condicoes-pagamento/components/CondicaoPagamentoForm").then(m => m.CondicaoPagamentoForm),
            { loading }
        ),
    },
    formaPagamento: {
        titulo: "Nova Forma de Pagamento",
        Componente: dynamic(
            () => import("@/app/(financeiro)/formas-pagamento/components/FormaPagamentoForm").then(m => m.FormaPagamentoForm),
            { loading }
        ),
    },
    transportadora: {
        titulo: "Nova Transportadora",
        Componente: dynamic(() => import("@/app/(cadastros)/transportadoras/components/TransportadoraForm").then(m => m.TransportadoraForm), { loading }),
    },
    fornecedor: {
        titulo: "Novo Fornecedor",
        Componente: dynamic(() => import("@/app/(cadastros)/fornecedores/components/FornecedorForm").then(m => m.FornecedorForm), { loading }),
    },
    veiculo: {
        titulo: "Novo Veículo",
        Componente: dynamic(() => import("@/app/(cadastros)/veiculos/components/VeiculoForm").then(m => m.VeiculoForm), { loading }),
    },
    funcaoFuncionario: {
        titulo: "Nova Função de Funcionário",
        Componente: dynamic(() => import("@/app/(cadastros)/funcoes-funcionario/components/FuncaoFuncionarioForm").then(m => m.FuncaoFuncionarioForm), { loading }),
    },
    funcionario: {
        titulo: "Novo Funcionário",
        Componente: dynamic(() => import("@/app/(cadastros)/funcionarios/components/FuncionarioForm").then(m => m.FuncionarioForm), { loading }),
    },
    produto: {
        titulo: "Novo Produto",
        Componente: dynamic(() => import("@/app/(produtos)/produtos/components/ProdutoForm").then(m => m.ProdutoForm), { loading }),
    },
    categoria: {
        titulo: "Nova Categoria",
        Componente: dynamic(() => import("@/app/(produtos)/categorias/components/CategoriaForm").then(m => m.CategoriaForm), { loading }),
    },
    marca: {
        titulo: "Nova Marca",
        Componente: dynamic(() => import("@/app/(produtos)/marcas/components/MarcaForm").then(m => m.MarcaForm), { loading }),
    },
    unidadeMedida: {
        titulo: "Nova Unidade de Medida",
        Componente: dynamic(() => import("@/app/(produtos)/unidades-medida/components/UnidadeMedidaForm").then(m => m.UnidadeMedidaForm), { loading }),
    },
}