import { Pool, QueryResultRow } from 'pg'

const globalForDb = globalThis as unknown as { _pgPool: Pool | undefined }

export const pool = globalForDb._pgPool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
})

if (process.env.NODE_ENV !== 'production') {
    globalForDb._pgPool = pool
}

/**
 * Executa uma query SQL com parâmetros posicionais.
 * Os parâmetros ($1, $2...) são escapados pelo driver pg,
 * protegendo contra SQL injection sem nenhum framework.
 */
export async function query<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await pool.query<T>(sql, params)
    return result.rows
}

/**
 * Executa uma query e retorna apenas a primeira linha.
 * Retorna null se não encontrar nada.
 */
export async function queryOne<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await pool.query<T>(sql, params)
    return result.rows[0] ?? null
}
