import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/app/components/ui/PageTitle'
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { pool } from '@/lib/db'
import { EstadoComPais, PaisSelect } from '@/lib/types'
import EstadosClientTable from './components/EstadosClientTable'

export const dynamic = 'force-dynamic'

const searchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function EstadosTable({ termoBusca }: { termoBusca: string }) {
    try {
        const [estadosResult, paisesResult] = await Promise.all([
            termoBusca
                ? pool.query<EstadoComPais>(
                    `SELECT e.*, p.pais
                       FROM tb_estados e
                       LEFT JOIN tb_paises p ON p.id = e."paisId"
                      WHERE e.estado ILIKE $1
                         OR e.uf     ILIKE $1
                      ORDER BY e.estado ASC`,
                    [`%${termoBusca}%`]
                )
                : pool.query<EstadoComPais>(
                    `SELECT e.*, p.pais
                       FROM tb_estados e
                       LEFT JOIN tb_paises p ON p.id = e."paisId"
                      ORDER BY e.estado ASC`
                ),

            pool.query<PaisSelect>(
                `SELECT id, pais FROM tb_paises WHERE ativo = true ORDER BY pais ASC`
            )
        ])

        return (
            <EstadosClientTable
                estados={estadosResult.rows}
                listaPaises={paisesResult.rows}
            />
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}

export default async function EstadosPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await searchParamsCache.parse(searchParams)

    return (
        <div className="p-6 mx-auto">
            <PageTitle>Gerenciar Estados</PageTitle>
            <SearchInput />
            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <EstadosTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}
