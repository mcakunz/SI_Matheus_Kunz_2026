import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput' 
import { PageTitle } from '@/app/components/ui/PageTitle' 
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner' 
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { createClient } from '@/lib/supabase/server'
import EstadosClientTable from './EstadosClientTable'



export const dynamic = 'force-dynamic'

const estadosSearchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function EstadosTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()
    
    let query = supabase
        .from('tb_estados')
        .select('*, tb_paises(pais)') 
        .order('id', { ascending: true })

    if (termoBusca) {
        query = query.or(`estado.ilike.%${termoBusca}%,uf.ilike.%${termoBusca}%`)
    }

    const { data: estados, error: errorEstados } = await query

    if (errorEstados) return <ErrorLoadingData message={errorEstados.message} />

    const { data: paises, error: errorPaises } = await supabase
        .from('tb_paises')
        .select('id, pais')
        .eq('ativo', true)
        .order('pais', { ascending: true })

    if (errorPaises) return <ErrorLoadingData message={errorPaises.message} />

    return <EstadosClientTable estados={estados || []} listaPaises={paises || []} />
}

export default async function EstadosPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await estadosSearchParamsCache.parse(searchParams)

    return (
        <div className='p-8 max-w-4xl mx-auto'>
            <PageTitle>Gerenciar Estados</PageTitle>

            <SearchInput />

            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <EstadosTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}