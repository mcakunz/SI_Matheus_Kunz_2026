import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/components/ui/PageTitle'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/components/ui/ErrorLoadingData'
import { query } from '@/lib/db'
import { Pais } from '@/lib/types'
import PaisesClientTable from './components/PaisesClientTable'

export const dynamic = 'force-dynamic'

const searchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function PaisesTable({ termoBusca }: { termoBusca: string }) {
    try {
        const paises = termoBusca
            ? await query<Pais>(
                `SELECT * FROM tb_paises
                  WHERE pais          ILIKE $1
                     OR nacionalidade ILIKE $1
                     OR sigla         ILIKE $1
                  ORDER BY pais ASC`,
                [`%${termoBusca}%`]
            )
            : await query<Pais>(
                `SELECT * FROM tb_paises ORDER BY pais ASC`
            )

        return <PaisesClientTable paises={paises} />
    } catch (error: any) {
        return <ErrorLoadingData message={error.message} />
    }
}

export default async function PaisesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await searchParamsCache.parse(searchParams)

    return (
        <div className="p-6 mx-auto">
            <PageTitle>Países</PageTitle>
            <SearchInput />
            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <PaisesTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}
