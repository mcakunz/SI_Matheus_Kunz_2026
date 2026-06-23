import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/components/ui/PageTitle'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/components/ui/ErrorLoadingData'
import { pool } from '@/lib/db'
import { CidadeComEstado, EstadoSelect } from '@/lib/types'
import CidadesClientTable from './components/CidadesClientTable'

export const dynamic = 'force-dynamic'

const cidadesSearchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function CidadesTable({ termoBusca }: { termoBusca: string }) {
    try {
        const [cidadesResult, estadosResult] = await Promise.all([
            termoBusca
                ? pool.query<CidadeComEstado>(
                    `SELECT c.*, e.estado
                       FROM tb_cidades c
                       LEFT JOIN tb_estados e ON e.id = c."estadoId"
                      WHERE c.cidade ILIKE $1
                      ORDER BY c.cidade ASC`,
                    [`%${termoBusca}%`]
                )
                : pool.query<CidadeComEstado>(
                    `SELECT c.*, e.estado
                       FROM tb_cidades c
                       LEFT JOIN tb_estados e ON e.id = c."estadoId"
                      ORDER BY c.cidade ASC`
                ),

            pool.query<EstadoSelect>(
                `SELECT id, estado FROM tb_estados WHERE ativo = true ORDER BY estado ASC`
            )
        ])

        return (
            <CidadesClientTable
                cidades={cidadesResult.rows}
                listaEstados={estadosResult.rows}
            />
        )
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}

export default async function CidadesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await cidadesSearchParamsCache.parse(searchParams)

    return (
        <div className="p-6 mx-auto">
            <PageTitle>Gerenciar Cidades</PageTitle>
            <SearchInput />
            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <CidadesTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}
