import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput'
import { PageTitle } from '@/app/components/ui/PageTitle'
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner'
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { createClient } from '@/lib/supabase/server'
import ClientesClientTable from './components/ClientesClientTable'

export const dynamic = 'force-dynamic'

const searchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function ClientesTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()

    let query = supabase
        .from('tb_clientes')
        .select('*, tb_cidades(cidade), tb_paises(pais), tb_condicoes_pagamento(condicao_pagamento)')
        .order('cliente', { ascending: true })

    if (termoBusca) {
        query = query.or(
            `cliente.ilike.%${termoBusca}%,cpf_cnpj.ilike.%${termoBusca}%,email.ilike.%${termoBusca}%`
        )
    }

    const { data: clientes, error } = await query
    if (error) return <ErrorLoadingData message={error.message} />

    return <ClientesClientTable clientes={clientes || []} />
}

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await searchParamsCache.parse(searchParams)

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <PageTitle>Gerenciar Clientes</PageTitle>
            <SearchInput />
            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <ClientesTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}
