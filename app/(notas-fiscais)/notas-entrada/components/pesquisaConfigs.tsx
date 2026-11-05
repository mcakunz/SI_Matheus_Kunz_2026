import type { PesquisaColuna, PesquisaCampo } from "@/components/ui/PesquisaModal"
import { mascaraCpfCnpj } from "@/lib/utils/mascaras"
import type {
    FornecedorPesquisa,
    TransportadoraPesquisa,
    CondicaoPesquisa,
    ProdutoPesquisa,
} from "../pesquisaTipos"

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const vazio = <span className="text-slate-300">—</span>

// ---------- FORNECEDOR ----------
export const COLUNAS_FORNECEDOR: PesquisaColuna<FornecedorPesquisa>[] = [
    { titulo: 'ID', render: f => f.id, className: 'text-slate-500 w-16' },
    { titulo: 'Fornecedor', render: f => <span className="font-medium text-slate-800">{f.fornecedor}</span> },
    { titulo: 'Apelido', render: f => f.apelido || vazio },
    { titulo: 'CPF/CNPJ', render: f => mascaraCpfCnpj(f.cpfCnpj), className: 'whitespace-nowrap' },
]

export const CAMPOS_FORNECEDOR: PesquisaCampo<FornecedorPesquisa>[] = [
    { chave: 'nome',    rotulo: 'Nome',     valor: f => f.fornecedor },
    { chave: 'apelido', rotulo: 'Apelido',  valor: f => f.apelido },
    // Aceita o documento com ou sem pontuação.
    { chave: 'doc',     rotulo: 'CPF/CNPJ', valor: f => `${f.cpfCnpj} ${mascaraCpfCnpj(f.cpfCnpj)}` },
    { chave: 'id',      rotulo: 'ID',       valor: f => f.id, exato: true },
]

// ---------- TRANSPORTADORA ----------
export const COLUNAS_TRANSPORTADORA: PesquisaColuna<TransportadoraPesquisa>[] = [
    { titulo: 'ID', render: t => t.id, className: 'text-slate-500 w-16' },
    { titulo: 'Razão social', render: t => <span className="font-medium text-slate-800">{t.razaoSocialNome}</span> },
    { titulo: 'Nome fantasia', render: t => t.nomeFantasiaApelido || vazio },
    { titulo: 'CNPJ', render: t => mascaraCpfCnpj(t.cnpj), className: 'whitespace-nowrap' },
]

export const CAMPOS_TRANSPORTADORA: PesquisaCampo<TransportadoraPesquisa>[] = [
    { chave: 'razao',    rotulo: 'Razão social',  valor: t => t.razaoSocialNome },
    { chave: 'fantasia', rotulo: 'Nome fantasia', valor: t => t.nomeFantasiaApelido },
    { chave: 'cnpj',     rotulo: 'CNPJ',          valor: t => `${t.cnpj} ${mascaraCpfCnpj(t.cnpj)}` },
    { chave: 'id',       rotulo: 'ID',            valor: t => t.id, exato: true },
]

// ---------- CONDIÇÃO DE PAGAMENTO ----------
export const COLUNAS_CONDICAO: PesquisaColuna<CondicaoPesquisa>[] = [
    { titulo: 'ID', render: c => c.id, className: 'text-slate-500 w-16' },
    { titulo: 'Condição de pagamento', render: c => <span className="font-medium text-slate-800">{c.condicaoPagamento}</span> },
    { titulo: 'Parcelas', render: c => c.numeroParcelas, className: 'text-right' },
    { titulo: 'Dias 1ª parcela', render: c => c.diasPrimeiraParcela, className: 'text-right' },
]

export const CAMPOS_CONDICAO: PesquisaCampo<CondicaoPesquisa>[] = [
    { chave: 'nome', rotulo: 'Nome', valor: c => c.condicaoPagamento },
    { chave: 'id',   rotulo: 'ID',   valor: c => c.id, exato: true },
]

// ---------- PRODUTO ----------
export const COLUNAS_PRODUTO: PesquisaColuna<ProdutoPesquisa>[] = [
    { titulo: 'ID', render: p => p.id, className: 'text-slate-500 w-16' },
    { titulo: 'Produto', render: p => <span className="font-medium text-slate-800">{p.produto}</span> },
    { titulo: 'Referência', render: p => p.referencia || vazio },
    { titulo: 'Cód. barras', render: p => p.codigoBarras || vazio, className: 'whitespace-nowrap' },
    { titulo: 'Und.', render: p => p.unidadeMedida },
    { titulo: 'Custo', render: p => moeda(p.valorCompra), className: 'text-right whitespace-nowrap' },
    { titulo: 'Estoque', render: p => p.quantidade.toLocaleString('pt-BR'), className: 'text-right' },
]

export const CAMPOS_PRODUTO: PesquisaCampo<ProdutoPesquisa>[] = [
    { chave: 'nome',       rotulo: 'Nome',            valor: p => p.produto },
    { chave: 'referencia', rotulo: 'Referência',      valor: p => p.referencia },
    { chave: 'barras',     rotulo: 'Código de barras', valor: p => p.codigoBarras },
    { chave: 'id',         rotulo: 'ID',              valor: p => p.id, exato: true },
]