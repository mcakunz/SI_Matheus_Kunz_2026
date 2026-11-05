"use server"

import { pool } from "@/lib/db"
import type {
    FornecedorPesquisa,
    TransportadoraPesquisa,
    CondicaoPesquisa,
    ProdutoPesquisa,
} from "./pesquisaTipos"

// Listas "ricas" usadas só pelos modais de pesquisa da Nota de Entrada.
// As listarXAtivos() dos módulos continuam como estão (id + nome) — aqui entram os campos
// extras que a pesquisa precisa (CPF/CNPJ, referência, código de barras...) e a condição de
// pagamento padrão do fornecedor.

export async function listarFornecedoresParaNota(): Promise<FornecedorPesquisa[]> {
    const result = await pool.query<FornecedorPesquisa>(
        `SELECT id, "fornecedor", "apelido", "cpfCnpj", "tipo", "condicaoPagamentoId"
         FROM tb_fornecedores
         WHERE ativo = true
         ORDER BY "fornecedor" ASC`
    )
    return result.rows
}

export async function listarTransportadorasParaNota(): Promise<TransportadoraPesquisa[]> {
    const result = await pool.query<TransportadoraPesquisa>(
        `SELECT id, "razaoSocialNome", "nomeFantasiaApelido", "cnpj"
         FROM tb_transportadoras
         WHERE ativo = true
         ORDER BY "razaoSocialNome" ASC`
    )
    return result.rows
}

export async function listarCondicoesParaNota(): Promise<CondicaoPesquisa[]> {
    const result = await pool.query<CondicaoPesquisa>(
        `SELECT id, "condicaoPagamento", "numeroParcelas", "diasPrimeiraParcela"
         FROM tb_condicoes_pagamento
         WHERE ativo = true
         ORDER BY "condicaoPagamento" ASC`
    )
    return result.rows
}

export async function listarProdutosParaNota(): Promise<ProdutoPesquisa[]> {
    const result = await pool.query<{
        id: number; produto: string; codigoBarras: string | null; referencia: string | null
        valorCompra: string; quantidade: string; unidadeMedida: string
    }>(
        `SELECT p.id, p."produto", p."codigoBarras", p."referencia",
                p."valorCompra", p."quantidade", u."unidadeMedida"
         FROM tb_produtos p
         JOIN tb_unidades_medida u ON u.id = p."unidadeMedidaId"
         WHERE p.ativo = true
         ORDER BY p."produto" ASC`
    )
    // Colunas numeric voltam como string pelo driver — convertendo para number aqui.
    return result.rows.map(r => ({
        id: r.id,
        produto: r.produto,
        codigoBarras: r.codigoBarras,
        referencia: r.referencia,
        valorCompra: Number(r.valorCompra),
        quantidade: Number(r.quantidade),
        unidadeMedida: r.unidadeMedida,
    }))
}
