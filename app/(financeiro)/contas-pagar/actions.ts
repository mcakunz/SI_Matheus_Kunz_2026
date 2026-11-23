"use server"

import { revalidatePath } from "next/cache"
import type { PoolClient } from "pg"
import { pool } from "@/lib/db"
import { tratarErroDB } from "@/lib/utils/errors"
import { ErroNegocio } from "@/lib/utils/erroNegocio"
import {
    registrarPagamento as registrarPagamentoServico,
    estornarPagamento as estornarPagamentoServico,
    lancarContaAvulsa as lancarContaAvulsaServico,
    cancelarContaAvulsa as cancelarContaAvulsaServico,
} from "@/lib/contasPagar/servico"
import type { ContaPagarLinha, PagamentoLinha, DadosPagamentoForm, DadosContaAvulsaForm } from "./tipos"

// Regras de negócio em "@/lib/contasPagar/servico". Aqui só: abrir a transação, chamar o serviço,
// tratar o erro e revalidar as telas.

async function emTransacao<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const resultado = await fn(client)
        await client.query('COMMIT')
        return resultado
    } catch (error) {
        await client.query('ROLLBACK')
        if (error instanceof ErroNegocio) throw error
        tratarErroDB(error)
    } finally {
        client.release()
    }
}

function revalidar() {
    revalidatePath('/contas-pagar')
}

export async function listarContasPagar(): Promise<ContaPagarLinha[]> {
    const r = await pool.query<ContaPagarLinha>(`
        SELECT
            v.id::int                     AS id,
            v.origem,
            v."notaNumero", v."notaModelo", v."notaSerie",
            v."fornecedorId",
            f.fornecedor,
            v.descricao,
            v."formaPagamentoId",
            fp."formaPagamento",
            v."numeroParcela", v."totalParcelas",
            v."valorOriginal"::float8       AS "valorOriginal",
            v."percentualJuros"::float8     AS "percentualJuros",
            v."percentualMulta"::float8     AS "percentualMulta",
            v."percentualDesconto"::float8  AS "percentualDesconto",
            to_char(v."dataEmissao",    'YYYY-MM-DD') AS "dataEmissao",
            to_char(v."dataVencimento", 'YYYY-MM-DD') AS "dataVencimento",
            to_char(v."dataQuitacao",   'YYYY-MM-DD') AS "dataQuitacao",
            v.situacao,
            v."motivoCancelamento",
            v.observacoes,
            v."valorPrincipalPago"::float8  AS "valorPrincipalPago",
            v."valorTotalPago"::float8      AS "valorTotalPago",
            v.saldo::float8                 AS saldo,
            to_char(v."dataUltimoPagamento", 'YYYY-MM-DD') AS "dataUltimoPagamento"
        FROM vw_contas_pagar v
        JOIN tb_fornecedores     f  ON f.id  = v."fornecedorId"
        JOIN tb_formas_pagamento fp ON fp.id = v."formaPagamentoId"
        ORDER BY v."dataVencimento" ASC, v.id ASC
    `)
    return r.rows
}

export async function listarPagamentosDaConta(contaPagarId: number): Promise<PagamentoLinha[]> {
    const r = await pool.query<PagamentoLinha>(`
        SELECT
            p.id::int AS id,
            to_char(p."dataPagamento", 'YYYY-MM-DD') AS "dataPagamento",
            fp."formaPagamento",
            p."valorPrincipal"::float8 AS "valorPrincipal",
            p."valorJuros"::float8     AS "valorJuros",
            p."valorMulta"::float8     AS "valorMulta",
            p."valorDesconto"::float8  AS "valorDesconto",
            p."valorPago"::float8      AS "valorPago",
            p.situacao,
            to_char(p."dataEstorno", 'YYYY-MM-DD HH24:MI') AS "dataEstorno",
            p."motivoEstorno",
            p.observacoes
        FROM tb_pagamentos_contas_pagar p
        JOIN tb_formas_pagamento fp ON fp.id = p."formaPagamentoId"
        WHERE p."contaPagarId" = $1
        ORDER BY p."dataPagamento" ASC, p.id ASC
    `, [contaPagarId])
    return r.rows
}

export async function registrarPagamento(dados: DadosPagamentoForm) {
    await emTransacao(client => registrarPagamentoServico(client, {
        contaPagarId: Number(dados.contaPagarId),
        dataPagamento: String(dados.dataPagamento),
        formaPagamentoId: Number(dados.formaPagamentoId),
        valorPrincipal: Number(dados.valorPrincipal),
        valorJuros: Number(dados.valorJuros),
        valorMulta: Number(dados.valorMulta),
        valorDesconto: Number(dados.valorDesconto),
        observacoes: dados.observacoes,
    }))
    revalidar()
}

export async function estornarPagamento(pagamentoId: number, motivo: string) {
    await emTransacao(client => estornarPagamentoServico(client, Number(pagamentoId), String(motivo ?? '')))
    revalidar()
}

export async function lancarContaAvulsa(dados: DadosContaAvulsaForm) {
    await emTransacao(client => lancarContaAvulsaServico(client, {
        fornecedorId: Number(dados.fornecedorId),
        descricao: String(dados.descricao ?? ''),
        formaPagamentoId: Number(dados.formaPagamentoId),
        valorOriginal: Number(dados.valorOriginal),
        dataEmissao: String(dados.dataEmissao),
        dataVencimento: String(dados.dataVencimento),
        percentualJuros: Number(dados.percentualJuros),
        percentualMulta: Number(dados.percentualMulta),
        percentualDesconto: Number(dados.percentualDesconto),
        observacoes: dados.observacoes,
    }))
    revalidar()
}

export async function cancelarContaAvulsa(contaPagarId: number, motivo: string) {
    await emTransacao(client => cancelarContaAvulsaServico(client, Number(contaPagarId), String(motivo ?? '')))
    revalidar()
}
