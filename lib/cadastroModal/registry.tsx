import dynamic from "next/dynamic"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CadastroModalConfig, TipoCadastroModal } from "./types"
import { carregarProdutoParaEdicao } from "@/app/(produtos)/produtos/actions"
import { carregarFornecedorParaEdicao } from "@/app/(cadastros)/fornecedores/actions"
import { carregarTransportadoraParaEdicao } from "@/app/(cadastros)/transportadoras/actions"
import { carregarCondicaoPagamentoParaEdicao } from "@/app/(financeiro)/condicoes-pagamento/actions"

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
 * Largura (opcional, campo `largura`): classe max-w-* do modal; formulários grandes usam max-w-6xl.
 *
 * Edição em modal (opcional, campo `edicao`): precisa de uma server action
 * "carregarXParaEdicao(id)" que devolve as props do Form (registro + listas), e
 * o Form, quando recebe o registro junto com onSuccess, deve ATUALIZAR em vez de
 * cadastrar (ver ProdutoForm/FornecedorForm/TransportadoraForm/CondicaoPagamentoForm).
 *
 * Import é feito via next/dynamic para não inflar o bundle inicial com
 * formulários grandes (ex: cliente) que só serão usados ocasionalmente
 * dentro de um modal.
 */
export const cadastroModalRegistry: Record<TipoCadastroModal, CadastroModalConfig> = {
    pais: {
        titulo: "Novo País",
        largura: "max-w-3xl",
        Componente: dynamic(
            () => import("@/app/(localidades)/paises/components/PaisForm").then(m => m.PaisForm),
            { loading }
        ),
    },
    estado: {
        titulo: "Novo Estado",
        largura: "max-w-3xl",
        Componente: dynamic(
            () => import("@/app/(localidades)/estados/components/EstadoForm").then(m => m.EstadoForm),
            { loading }
        ),
    },
    cidade: {
        titulo: "Nova Cidade",
        largura: "max-w-3xl",
        Componente: dynamic(
            () => import("@/app/(localidades)/cidades/components/CidadeForm").then(m => m.CidadeForm),
            { loading }
        ),
    },
    cliente: {
        titulo: "Novo Cliente",
        largura: "max-w-6xl",
        Componente: dynamic(
            () => import("@/app/(cadastros)/clientes/components/ClienteForm").then(m => m.ClienteForm),
            { loading }
        ),
    },
    condicaoPagamento: {
        titulo: "Nova Condição de Pagamento",
        largura: "max-w-5xl",
        Componente: dynamic(
            () => import("@/app/(financeiro)/condicoes-pagamento/components/CondicaoPagamentoForm").then(m => m.CondicaoPagamentoForm),
            { loading }
        ),
        edicao: { titulo: "Editar Condição de Pagamento", carregar: carregarCondicaoPagamentoParaEdicao },
    },
    formaPagamento: {
        titulo: "Nova Forma de Pagamento",
        largura: "max-w-2xl",
        Componente: dynamic(
            () => import("@/app/(financeiro)/formas-pagamento/components/FormaPagamentoForm").then(m => m.FormaPagamentoForm),
            { loading }
        ),
    },
    transportadora: {
        titulo: "Nova Transportadora",
        largura: "max-w-6xl",
        Componente: dynamic(() => import("@/app/(cadastros)/transportadoras/components/TransportadoraForm").then(m => m.TransportadoraForm), { loading }),
        edicao: { titulo: "Editar Transportadora", carregar: carregarTransportadoraParaEdicao },
    },
    fornecedor: {
        titulo: "Novo Fornecedor",
        largura: "max-w-6xl",
        Componente: dynamic(() => import("@/app/(cadastros)/fornecedores/components/FornecedorForm").then(m => m.FornecedorForm), { loading }),
        edicao: { titulo: "Editar Fornecedor", carregar: carregarFornecedorParaEdicao },
    },
    veiculo: {
        titulo: "Novo Veículo",
        largura: "max-w-4xl",
        Componente: dynamic(() => import("@/app/(cadastros)/veiculos/components/VeiculoForm").then(m => m.VeiculoForm), { loading }),
    },
    funcaoFuncionario: {
        titulo: "Nova Função de Funcionário",
        largura: "max-w-4xl",
        Componente: dynamic(() => import("@/app/(cadastros)/funcoes-funcionario/components/FuncaoFuncionarioForm").then(m => m.FuncaoFuncionarioForm), { loading }),
    },
    funcionario: {
        titulo: "Novo Funcionário",
        largura: "max-w-6xl",
        Componente: dynamic(() => import("@/app/(cadastros)/funcionarios/components/FuncionarioForm").then(m => m.FuncionarioForm), { loading }),
    },
    produto: {
        titulo: "Novo Produto",
        largura: "max-w-5xl",
        Componente: dynamic(() => import("@/app/(produtos)/produtos/components/ProdutoForm").then(m => m.ProdutoForm), { loading }),
        edicao: { titulo: "Editar Produto", carregar: carregarProdutoParaEdicao },
    },
    categoria: {
        titulo: "Nova Categoria",
        largura: "max-w-2xl",
        Componente: dynamic(() => import("@/app/(produtos)/categorias/components/CategoriaForm").then(m => m.CategoriaForm), { loading }),
    },
    marca: {
        titulo: "Nova Marca",
        largura: "max-w-2xl",
        Componente: dynamic(() => import("@/app/(produtos)/marcas/components/MarcaForm").then(m => m.MarcaForm), { loading }),
    },
    unidadeMedida: {
        titulo: "Nova Unidade de Medida",
        largura: "max-w-2xl",
        Componente: dynamic(() => import("@/app/(produtos)/unidades-medida/components/UnidadeMedidaForm").then(m => m.UnidadeMedidaForm), { loading }),
    },
}