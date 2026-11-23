"use client"

import { useMemo, useState } from "react"
import { GridColDef } from "@mui/x-data-grid"

import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { FormInput } from "@/components/ui/FormInput"
import { FormSelect } from "@/components/ui/FormSelect"
import { FormLabel } from "@/components/ui/FormLabel"
import { hojeISO } from "@/lib/utils/encargos"
import { r2 } from "@/lib/utils/arredondamento"
import type { ContaPagarLinha } from "../tipos"
import { descreverDocumento, estaEmAberto, estaVencida, fmtData, fmtMoeda } from "./formatos"
import { PagarContaModal } from "./PagarContaModal"
import { PagamentosContaModal } from "./PagamentosContaModal"
import { ContaAvulsaModal } from "./ContaAvulsaModal"
import { CancelarContaModal } from "./CancelarContaModal"

type FiltroSituacao = 'ABERTO' | 'VENCIDO' | 'PAGO' | 'CANCELADO' | 'TODOS'

const SITUACAO_ROTULO: Record<string, string> = {
    PENDENTE: 'Pendente',
    PARCIAL: 'Parcial',
    PAGO: 'Pago',
    CANCELADO: 'Cancelado',
}

// Mesmo visual do StatusBadge das outras listagens.
const SITUACAO_ESTILO: Record<string, string> = {
    PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    PARCIAL: 'bg-sky-50 text-sky-700 border-sky-200',
    PAGO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELADO: 'bg-slate-100 text-slate-500 border-slate-200',
}

const Selo = ({ texto, estilo }: { texto: string; estilo: string }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${estilo}`}>{texto}</span>
)

export function ContasPagarClientTable({ contas }: { contas: ContaPagarLinha[] }) {
    const [hoje] = useState(() => hojeISO())
    const [selecionada, setSelecionada] = useState<ContaPagarLinha | null>(null)
    const [modal, setModal] = useState<'pagar' | 'pagamentos' | 'avulsa' | 'cancelar' | null>(null)
    // Título que o modal aberto está mostrando (fica fixo mesmo se a seleção da tabela mudar).
    const [contaModal, setContaModal] = useState<ContaPagarLinha | null>(null)

    const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>('ABERTO')
    const [busca, setBusca] = useState('')
    const [vencDe, setVencDe] = useState('')
    const [vencAte, setVencAte] = useState('')

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLowerCase()
        return contas.filter(c => {
            if (filtroSituacao === 'ABERTO' && !estaEmAberto(c)) return false
            if (filtroSituacao === 'VENCIDO' && !estaVencida(c, hoje)) return false
            if (filtroSituacao === 'PAGO' && c.situacao !== 'PAGO') return false
            if (filtroSituacao === 'CANCELADO' && c.situacao !== 'CANCELADO') return false
            if (vencDe && c.dataVencimento < vencDe) return false
            if (vencAte && c.dataVencimento > vencAte) return false
            if (termo) {
                const texto = `${c.fornecedor} ${descreverDocumento(c)} ${c.id}`.toLowerCase()
                if (!texto.includes(termo)) return false
            }
            return true
        })
    }, [contas, filtroSituacao, busca, vencDe, vencAte, hoje])

    // Totais dos títulos em aberto que estão na tela (respeitam os filtros).
    const totais = useMemo(() => {
        const abertas = filtradas.filter(estaEmAberto)
        const vencidas = abertas.filter(c => estaVencida(c, hoje))
        return {
            qtdAberto: abertas.length,
            aberto: r2(abertas.reduce((s, c) => s + c.saldo, 0)),
            qtdVencido: vencidas.length,
            vencido: r2(vencidas.reduce((s, c) => s + c.saldo, 0)),
        }
    }, [filtradas, hoje])

    // Pagar fora de ordem é permitido, mas avisa quando há parcela ANTERIOR da mesma nota em aberto.
    const avisoOrdem = useMemo(() => {
        if (!selecionada || selecionada.origem !== 'NOTA') return null
        const anteriores = contas.filter(c =>
            c.origem === 'NOTA' && estaEmAberto(c) &&
            c.notaNumero === selecionada.notaNumero && c.notaModelo === selecionada.notaModelo &&
            c.notaSerie === selecionada.notaSerie && c.fornecedorId === selecionada.fornecedorId &&
            c.numeroParcela < selecionada.numeroParcela
        )
        if (anteriores.length === 0) return null
        return `Atenção: a(s) parcela(s) ${anteriores.map(c => c.numeroParcela).join(', ')} desta nota ainda estão em aberto.`
    }, [contas, selecionada])

    const columns: GridColDef<ContaPagarLinha>[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'documento', headerName: 'Documento', flex: 1, minWidth: 240,
            valueGetter: (_v, row) => descreverDocumento(row),
        },
        { field: 'fornecedor', headerName: 'Fornecedor', flex: 1, minWidth: 180 },
        { field: 'dataEmissao', headerName: 'Emissão', width: 105, renderCell: p => fmtData(p.row.dataEmissao) },
        {
            field: 'dataVencimento', headerName: 'Vencimento', width: 110,
            renderCell: p => (
                <span className={estaVencida(p.row, hoje) ? 'text-red-600 font-semibold' : undefined}>
                    {fmtData(p.row.dataVencimento)}
                </span>
            ),
        },
        { field: 'valorOriginal', headerName: 'Valor', width: 120, type: 'number', renderCell: p => fmtMoeda(p.row.valorOriginal) },
        { field: 'valorPrincipalPago', headerName: 'Abatido', width: 120, type: 'number', renderCell: p => fmtMoeda(p.row.valorPrincipalPago) },
        {
            field: 'saldo', headerName: 'Saldo', width: 120, type: 'number',
            renderCell: p => <span className="font-semibold">{fmtMoeda(p.row.situacao === 'CANCELADO' ? 0 : p.row.saldo)}</span>,
        },
        {
            field: 'situacao', headerName: 'Situação', width: 170,
            renderCell: p => (
                <span className="flex items-center gap-1.5 h-full">
                    <Selo texto={SITUACAO_ROTULO[p.row.situacao] ?? p.row.situacao} estilo={SITUACAO_ESTILO[p.row.situacao] ?? ''} />
                    {estaVencida(p.row, hoje) && <Selo texto="Vencido" estilo="bg-red-50 text-red-700 border-red-200" />}
                </span>
            ),
        },
    ], [hoje])

    const podePagar = !!selecionada && estaEmAberto(selecionada)
    const podeCancelar = !!selecionada && selecionada.origem === 'AVULSA' && selecionada.situacao === 'PENDENTE'

    const abrir = (m: 'pagar' | 'pagamentos' | 'cancelar') => { setContaModal(selecionada); setModal(m) }
    const fecharModal = () => { setModal(null); setContaModal(null) }
    // Depois de pagar/estornar/lançar/cancelar, a lista é recarregada pelo servidor (revalidatePath);
    // a seleção antiga ficaria com valores velhos, então é limpa.
    const aoAlterar = () => { setSelecionada(null); fecharModal() }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setModal('avulsa')}>Nova conta avulsa</Button>
                <Button disabled={!podePagar} onClick={() => abrir('pagar')}>Pagar</Button>
                <Button disabled={!selecionada} onClick={() => abrir('pagamentos')}>Pagamentos / Estornar</Button>
                <Button disabled={!podeCancelar} onClick={() => abrir('cancelar')}>Cancelar conta</Button>
                {selecionada?.origem === 'NOTA' && (
                    <span className="text-xs text-slate-400">Título de nota de entrada: é cancelado cancelando a nota.</span>
                )}
                {selecionada?.origem === 'AVULSA' && selecionada.situacao === 'PARCIAL' && (
                    <span className="text-xs text-slate-400">Para cancelar, estorne os pagamentos primeiro.</span>
                )}
            </div>

            {/* Filtros */}
            <div className="grid gap-3 items-end" style={{ gridTemplateColumns: 'minmax(0, 1fr) 190px 160px 160px' }}>
                <div>
                    <FormLabel>Buscar</FormLabel>
                    <FormInput value={busca} onChange={e => setBusca(e.target.value)} placeholder="Fornecedor, nº da nota, descrição ou ID..." />
                </div>
                <div>
                    <FormLabel>Situação</FormLabel>
                    <FormSelect value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value as FiltroSituacao)}>
                        <option value="ABERTO">Em aberto</option>
                        <option value="VENCIDO">Vencidos</option>
                        <option value="PAGO">Pagos</option>
                        <option value="CANCELADO">Cancelados</option>
                        <option value="TODOS">Todos</option>
                    </FormSelect>
                </div>
                <div>
                    <FormLabel>Vencimento de</FormLabel>
                    <FormInput type="date" value={vencDe} onChange={e => setVencDe(e.target.value)} />
                </div>
                <div>
                    <FormLabel>até</FormLabel>
                    <FormInput type="date" value={vencAte} onChange={e => setVencAte(e.target.value)} />
                </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <span>Em aberto: <strong className="text-slate-800">{fmtMoeda(totais.aberto)}</strong> ({totais.qtdAberto} título{totais.qtdAberto === 1 ? '' : 's'})</span>
                <span>Vencido: <strong className="text-red-600">{fmtMoeda(totais.vencido)}</strong> ({totais.qtdVencido} título{totais.qtdVencido === 1 ? '' : 's'})</span>
            </div>

            <DataTable
                data={filtradas}
                columns={columns}
                selectedRow={selecionada}
                onRowSelect={setSelecionada}
            />

            {contaModal && modal === 'pagar' && (
                <PagarContaModal conta={contaModal} avisoOrdem={avisoOrdem} onClose={fecharModal} onPago={aoAlterar} />
            )}
            {contaModal && modal === 'pagamentos' && (
                // Depois de um estorno o modal continua aberto (recarrega o histórico sozinho).
                <PagamentosContaModal conta={contaModal} onClose={fecharModal} onAlterado={() => setSelecionada(null)} />
            )}
            {contaModal && modal === 'cancelar' && (
                <CancelarContaModal conta={contaModal} onClose={fecharModal} onCancelado={aoAlterar} />
            )}
            {modal === 'avulsa' && (
                <ContaAvulsaModal onClose={fecharModal} onLancada={aoAlterar} />
            )}
        </div>
    )
}
