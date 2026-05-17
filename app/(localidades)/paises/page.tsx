import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/app/components/ui/PageTitle'
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { createClient } from '@/lib/supabase/server'
import PaisesClientTable from './components/PaisesClientTable'

export const dynamic = 'force-dynamic'

const searchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function PaisesTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()

    let query = supabase
        .from('tb_paises')
        .select('*')
        .order('pais', { ascending: true })

    if (termoBusca) {
        query = query.or(
            `pais.ilike.%${termoBusca}%,nacionalidade.ilike.%${termoBusca}%,sigla.ilike.%${termoBusca}%`
        )
    }

    const { data: paises, error } = await query
    if (error) return <ErrorLoadingData message={error.message} />

    return <PaisesClientTable paises={paises || []} />
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
