import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/app/components/ui/PageTitle'
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { createClient } from '@/lib/supabase/server'
import EstadosClientTable from './components/EstadosClientTable'

export const dynamic = 'force-dynamic'

const searchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function EstadosTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()

    let query = supabase
        .from('tb_estados')
        .select('*, tb_paises(pais)')
        .order('estado', { ascending: true })

    if (termoBusca) {
        query = query.or(`estado.ilike.%${termoBusca}%,uf.ilike.%${termoBusca}%`)
    }

    const { data: estados, error } = await query
    if (error) return <ErrorLoadingData message={error.message} />

    return <EstadosClientTable estados={estados || []} />
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
