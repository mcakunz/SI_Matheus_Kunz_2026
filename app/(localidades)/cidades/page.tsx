import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput' 
import { PageTitle } from '@/app/components/ui/PageTitle' 
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner' 
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { createClient } from '@/lib/supabase/server'
import CidadesClientTable from './components/CidadesClientTable'



export const dynamic = 'force-dynamic'

const cidadesSearchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function CidadesTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()
    
    let query = supabase
        .from('tb_cidades')
        .select('*, tb_estados(estado)') 
        .order('id', { ascending: true })

    if (termoBusca) {
        query = query.or(`cidade.ilike.%${termoBusca}%`)
    }

    const { data: cidades, error: errorCidades } = await query

    if (errorCidades) return <ErrorLoadingData message={errorCidades.message} />

    const { data: estados, error: errorEstados } = await supabase
        .from('tb_estados')
        .select('id, estado')
        .eq('ativo', true)
        .order('estado', { ascending: true })

    if (errorEstados) return <ErrorLoadingData message={errorEstados.message} />

    return <CidadesClientTable cidades={cidades || []} listaEstados={estados || []} />
}

export default async function CidadesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await cidadesSearchParamsCache.parse(searchParams)

    return (
        <div className='p-6 mx-auto'>
            <PageTitle>Gerenciar Cidades</PageTitle>

            <SearchInput />

            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <CidadesTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}