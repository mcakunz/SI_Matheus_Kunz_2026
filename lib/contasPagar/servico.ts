import type { PoolClient } from "pg"
import { ErroNegocio } from "@/lib/utils/erroNegocio"
import { r2 } from "@/lib/utils/arredondamento"
import { ratearParcelas } from "@/lib/utils/parcelas"
import { hojeISO, somarDias } from "@/lib/utils/encargos"

export interface ChaveNota {
    numero: string
    modelo: string
    serie: string
    fornecedorId: number
}

export interface ParcelaDaNota {
    numeroParcela: number
    totalParcelas: number
    valor: number
    dataVencimento: string // YYYY-MM-DD
    formaPagamentoId: number
}

export interface ParcelasDaNota {
    parcelas: ParcelaDaNota[]
    percentualJuros: number
    percentualMulta: number
    percentualDesconto: number
}

/**
 * Parcelas da nota a partir da condição de pagamento gravada no banco: mesmos valores que a tela
 * mostra (ratearParcelas) e vencimento = emissão + dias de cada parcela (não cumulativo).
 */
export async function calcularParcelasDaNota(
    client: PoolClient,
    condicaoPagamentoId: number,
    dataEmissao: string,
    valorTotal: number,
): Promise<ParcelasDaNota> {
    const condicao = await client.query<{ percentualJuros: string; percentualMulta: string; percentualDesconto: string }>(
        `SELECT "percentualJuros", "percentualMulta", "percentualDesconto"
         FROM tb_condicoes_pagamento WHERE id = $1`,
        [condicaoPagamentoId]
    )
    if (condicao.rowCount === 0) throw new ErroNegocio("Condição de pagamento não encontrada.")

    const parcelasCondicao = await client.query<{ numero: number; dias: number; percentual: string; formaPagamentoId: number }>(
        `SELECT numero, dias, percentual, "formaPagamentoId"
         FROM tb_parcelas_condicao_pagamento
         WHERE "condicaoPagamentoId" = $1
         ORDER BY numero ASC`,
        [condicaoPagamentoId]
    )
    if (parcelasCondicao.rowCount === 0) throw new ErroNegocio("A condição de pagamento escolhida não tem parcelas configuradas.")
    if (!(valorTotal > 0)) throw new ErroNegocio("O total da nota precisa ser maior que zero para gerar as parcelas.")

    const valores = ratearParcelas(valorTotal, parcelasCondicao.rows.map(p => Number(p.percentual)))
    if (valores.some(v => v <= 0)) {
        throw new ErroNegocio(`O total da nota é pequeno demais para ser dividido em ${valores.length} parcelas.`)
    }

    const total = parcelasCondicao.rows.length
    const c = condicao.rows[0]
    return {
        percentualJuros: Number(c.percentualJuros),
        percentualMulta: Number(c.percentualMulta),
        percentualDesconto: Number(c.percentualDesconto),
        parcelas: parcelasCondicao.rows.map((p, i) => ({
            numeroParcela: p.numero,
            totalParcelas: total,
            valor: valores[i],
            dataVencimento: somarDias(dataEmissao, Number(p.dias)),
            formaPagamentoId: p.formaPagamentoId,
        })),
    }
}

/** Grava um título (origem NOTA) por parcela. */
export async function inserirTitulosDaNota(client: PoolClient, chave: ChaveNota, dataEmissao: string, calc: ParcelasDaNota) {
    for (const p of calc.parcelas) {
        await client.query(
            `INSERT INTO tb_contas_pagar (
                origem, "notaNumero", "notaModelo", "notaSerie", "fornecedorId",
                "formaPagamentoId", "numeroParcela", "totalParcelas", "valorOriginal",
                "percentualJuros", "percentualMulta", "percentualDesconto",
                "dataEmissao", "dataVencimento"
            ) VALUES ('NOTA', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                chave.numero, chave.modelo, chave.serie, chave.fornecedorId,
                p.formaPagamentoId, p.numeroParcela, p.totalParcelas, p.valor,
                calc.percentualJuros, calc.percentualMulta, calc.percentualDesconto,
                dataEmissao, p.dataVencimento,
            ]
        )
    }
}

/**
 * Cancela os títulos de uma nota (chamado pelo cancelamento da nota). Recusa se alguma parcela
 * tiver pagamento ativo: é preciso estornar os pagamentos antes.
 */
export async function cancelarTitulosDaNota(client: PoolClient, chave: ChaveNota) {
    const params = [chave.numero, chave.modelo, chave.serie, chave.fornecedorId]
    const filtroNota = `"notaNumero" = $1 AND "notaModelo" = $2 AND "notaSerie" = $3 AND "fornecedorId" = $4`

    // Trava os títulos da nota antes de olhar os pagamentos (um pagamento simultâneo espera).
    await client.query(`SELECT id FROM tb_contas_pagar WHERE ${filtroNota} ORDER BY id FOR UPDATE`, params)

    const pagos = await client.query<{ parcelas: string }>(
        `SELECT string_agg(DISTINCT cp."numeroParcela"::text, ', ') AS parcelas
         FROM tb_pagamentos_contas_pagar pg
         JOIN tb_contas_pagar cp ON cp.id = pg."contaPagarId"
         WHERE pg.situacao = 'ATIVO'
           AND cp."notaNumero" = $1 AND cp."notaModelo" = $2 AND cp."notaSerie" = $3 AND cp."fornecedorId" = $4`,
        params
    )
    if (pagos.rows[0]?.parcelas) {
        throw new ErroNegocio(
            `Não é possível cancelar a nota: a(s) parcela(s) ${pagos.rows[0].parcelas} já têm pagamento. ` +
            `Estorne os pagamentos em Contas a Pagar antes de cancelar a nota.`
        )
    }

    await client.query(
        `UPDATE tb_contas_pagar
            SET situacao = 'CANCELADO', "dataCancelamento" = CURRENT_TIMESTAMP,
                "motivoCancelamento" = 'Nota de entrada cancelada', "dataQuitacao" = NULL
          WHERE ${filtroNota} AND situacao <> 'CANCELADO'`,
        params
    )
}

// ---------------------------------------------------------------------------
// PAGAMENTO / ESTORNO / AVULSA
// ---------------------------------------------------------------------------

interface ContaTravada {
    id: number
    origem: 'NOTA' | 'AVULSA'
    situacao: string
    valorOriginal: number
    dataEmissao: string
    saldo: number
    temPagamentoAtivo: boolean
}

/** Trava o título até o fim da transação e devolve os dados + saldo atual. */
async function travarConta(client: PoolClient, contaId: number): Promise<ContaTravada> {
    const r = await client.query<{ id: string; origem: 'NOTA' | 'AVULSA'; situacao: string; valorOriginal: string; dataEmissao: string }>(
        `SELECT id, origem, situacao, "valorOriginal", to_char("dataEmissao", 'YYYY-MM-DD') AS "dataEmissao"
         FROM tb_contas_pagar WHERE id = $1 FOR UPDATE`,
        [contaId]
    )
    if (r.rowCount === 0) throw new ErroNegocio("Título não encontrado.")

    const pg = await client.query<{ pago: string; qtd: string }>(
        `SELECT COALESCE(SUM("valorPrincipal"), 0) AS pago, COUNT(*) AS qtd
         FROM tb_pagamentos_contas_pagar WHERE "contaPagarId" = $1 AND situacao = 'ATIVO'`,
        [contaId]
    )
    const c = r.rows[0]
    const valorOriginal = Number(c.valorOriginal)
    return {
        id: Number(c.id),
        origem: c.origem,
        situacao: c.situacao,
        valorOriginal,
        dataEmissao: c.dataEmissao,
        saldo: r2(valorOriginal - Number(pg.rows[0].pago)),
        temPagamentoAtivo: Number(pg.rows[0].qtd) > 0,
    }
}

/** PENDENTE / PARCIAL / PAGO a partir dos pagamentos ativos (não mexe em título CANCELADO). */
async function atualizarSituacao(client: PoolClient, contaId: number) {
    await client.query(
        `UPDATE tb_contas_pagar cp
            SET situacao = CASE
                    WHEN pg.pago >= cp."valorOriginal" THEN 'PAGO'
                    WHEN pg.pago > 0                   THEN 'PARCIAL'
                    ELSE 'PENDENTE'
                END,
                "dataQuitacao" = CASE WHEN pg.pago >= cp."valorOriginal" THEN pg."ultimaData" ELSE NULL END
           FROM (
                SELECT COALESCE(SUM("valorPrincipal"), 0) AS pago, MAX("dataPagamento") AS "ultimaData"
                FROM tb_pagamentos_contas_pagar
                WHERE "contaPagarId" = $1 AND situacao = 'ATIVO'
           ) pg
          WHERE cp.id = $1 AND cp.situacao <> 'CANCELADO'`,
        [contaId]
    )
}

export interface DadosPagamento {
    contaPagarId: number
    dataPagamento: string // YYYY-MM-DD
    formaPagamentoId: number
    valorPrincipal: number
    valorJuros: number
    valorMulta: number
    valorDesconto: number
    observacoes?: string | null
}

/** Registra um pagamento (total ou parcial). Os encargos vêm da tela (sugeridos e editáveis). */
export async function registrarPagamento(client: PoolClient, d: DadosPagamento, hoje: string = hojeISO()): Promise<number> {
    const conta = await travarConta(client, d.contaPagarId)
    if (conta.situacao === 'CANCELADO') throw new ErroNegocio("Título cancelado não pode receber pagamento.")
    if (conta.saldo <= 0) throw new ErroNegocio("Este título já está quitado.")

    const principal = r2(Number(d.valorPrincipal) || 0)
    const juros = r2(Number(d.valorJuros) || 0)
    const multa = r2(Number(d.valorMulta) || 0)
    const desconto = r2(Number(d.valorDesconto) || 0)

    if (principal <= 0) throw new ErroNegocio("Informe o valor a abater do título.")
    if (principal > conta.saldo) {
        throw new ErroNegocio(`O valor a abater (R$ ${principal.toFixed(2)}) é maior que o saldo do título (R$ ${conta.saldo.toFixed(2)}).`)
    }
    if (juros < 0 || multa < 0 || desconto < 0) throw new ErroNegocio("Juros, multa e desconto não podem ser negativos.")
    if (desconto > principal) throw new ErroNegocio("O desconto não pode ser maior que o valor abatido.")
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dataPagamento)) throw new ErroNegocio("Data de pagamento inválida.")
    if (d.dataPagamento < conta.dataEmissao) throw new ErroNegocio("A data de pagamento não pode ser anterior à emissão do título.")
    if (d.dataPagamento > hoje) throw new ErroNegocio("A data de pagamento não pode ser futura.")

    const valorPago = r2(principal + juros + multa - desconto)
    if (valorPago <= 0) throw new ErroNegocio("O valor pago precisa ser maior que zero.")

    const r = await client.query<{ id: string }>(
        `INSERT INTO tb_pagamentos_contas_pagar (
            "contaPagarId", "formaPagamentoId", "dataPagamento",
            "valorPrincipal", "valorJuros", "valorMulta", "valorDesconto", "valorPago", observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [conta.id, d.formaPagamentoId, d.dataPagamento, principal, juros, multa, desconto, valorPago, d.observacoes?.trim() || null]
    )
    await atualizarSituacao(client, conta.id)
    return Number(r.rows[0].id)
}

/** Estorna um pagamento ativo (fica registrado como ESTORNADO, com motivo). */
export async function estornarPagamento(client: PoolClient, pagamentoId: number, motivo: string) {
    const motivoLimpo = (motivo ?? '').trim()
    if (motivoLimpo.length < 3) throw new ErroNegocio("Informe o motivo do estorno.")
    if (motivoLimpo.length > 150) throw new ErroNegocio("O motivo do estorno pode ter no máximo 150 caracteres.")

    const ref = await client.query<{ contaPagarId: string }>(
        `SELECT "contaPagarId" FROM tb_pagamentos_contas_pagar WHERE id = $1`, [pagamentoId]
    )
    if (ref.rowCount === 0) throw new ErroNegocio("Pagamento não encontrado.")
    const contaId = Number(ref.rows[0].contaPagarId)

    // Mesma ordem de travas do pagamento (título primeiro): evita deadlock entre as duas operações.
    await travarConta(client, contaId)
    const pg = await client.query<{ situacao: string }>(
        `SELECT situacao FROM tb_pagamentos_contas_pagar WHERE id = $1 FOR UPDATE`, [pagamentoId]
    )
    if (pg.rows[0].situacao !== 'ATIVO') throw new ErroNegocio("Este pagamento já foi estornado.")

    await client.query(
        `UPDATE tb_pagamentos_contas_pagar
            SET situacao = 'ESTORNADO', "dataEstorno" = CURRENT_TIMESTAMP, "motivoEstorno" = $2
          WHERE id = $1`,
        [pagamentoId, motivoLimpo]
    )
    await atualizarSituacao(client, contaId)
}

export interface DadosContaAvulsa {
    fornecedorId: number
    descricao: string
    formaPagamentoId: number
    valorOriginal: number
    dataEmissao: string
    dataVencimento: string
    percentualJuros: number
    percentualMulta: number
    percentualDesconto: number
    observacoes?: string | null
}

/** Lança um título avulso (sem nota). */
export async function lancarContaAvulsa(client: PoolClient, d: DadosContaAvulsa): Promise<number> {
    const descricao = (d.descricao ?? '').trim()
    const valor = r2(Number(d.valorOriginal) || 0)
    if (!descricao) throw new ErroNegocio("Informe a descrição da conta.")
    if (descricao.length > 150) throw new ErroNegocio("A descrição pode ter no máximo 150 caracteres.")
    if (valor <= 0) throw new ErroNegocio("O valor da conta precisa ser maior que zero.")
    if (!d.dataEmissao || !d.dataVencimento) throw new ErroNegocio("Informe a emissão e o vencimento.")
    if (d.dataVencimento < d.dataEmissao) throw new ErroNegocio("O vencimento não pode ser anterior à emissão.")
    for (const [nome, p] of [['juros', d.percentualJuros], ['multa', d.percentualMulta], ['desconto', d.percentualDesconto]] as const) {
        if (!(Number(p) >= 0 && Number(p) <= 100)) throw new ErroNegocio(`Percentual de ${nome} inválido (0 a 100).`)
    }

    const r = await client.query<{ id: string }>(
        `INSERT INTO tb_contas_pagar (
            origem, "fornecedorId", descricao, "formaPagamentoId", "numeroParcela", "totalParcelas",
            "valorOriginal", "percentualJuros", "percentualMulta", "percentualDesconto",
            "dataEmissao", "dataVencimento", observacoes
        ) VALUES ('AVULSA', $1, $2, $3, 1, 1, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
            d.fornecedorId, descricao, d.formaPagamentoId, valor,
            r2(Number(d.percentualJuros)), r2(Number(d.percentualMulta)), r2(Number(d.percentualDesconto)),
            d.dataEmissao, d.dataVencimento, d.observacoes?.trim() || null,
        ]
    )
    return Number(r.rows[0].id)
}

/** Cancela um título avulso sem pagamentos ativos. Título de nota só é cancelado pela nota. */
export async function cancelarContaAvulsa(client: PoolClient, contaId: number, motivo: string) {
    const motivoLimpo = (motivo ?? '').trim()
    if (motivoLimpo.length < 3) throw new ErroNegocio("Informe o motivo do cancelamento.")
    if (motivoLimpo.length > 150) throw new ErroNegocio("O motivo pode ter no máximo 150 caracteres.")

    const conta = await travarConta(client, contaId)
    if (conta.origem !== 'AVULSA') {
        throw new ErroNegocio("Títulos de nota de entrada são cancelados cancelando a própria nota.")
    }
    if (conta.situacao === 'CANCELADO') throw new ErroNegocio("Este título já está cancelado.")
    if (conta.temPagamentoAtivo) throw new ErroNegocio("Este título tem pagamento. Estorne os pagamentos antes de cancelar.")

    await client.query(
        `UPDATE tb_contas_pagar
            SET situacao = 'CANCELADO', "dataCancelamento" = CURRENT_TIMESTAMP,
                "motivoCancelamento" = $2, "dataQuitacao" = NULL
          WHERE id = $1`,
        [contaId, motivoLimpo]
    )
}
