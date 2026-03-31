import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { SearchInput } from '@/app/components/SearchInput' 
import { PageTitle } from '@/app/components/ui/PageTitle' 
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner' 
import { ErrorLoadingData } from '@/app/components/ui/ErrorLoadingData'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty } from '@/app/components/ui/Table'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const paisesSearchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

async function PaisesTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()
    let query = supabase.from('paises').select('*').order('codPais', { ascending: true })

    if (termoBusca) {
        query = query.ilike('pais', `%${termoBusca}%`)
    }

    const { data: paises, error } = await query

    if (error) return <ErrorLoadingData message={error.message} />

    return (
        <Table>
            <TableHeader>
                <TableHead>Código</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead>DDI</TableHead>
                <TableHead>Moeda</TableHead>
            </TableHeader>
            <TableBody>
                {paises?.length === 0 ? (
                    <TableEmpty colSpan={5}>Nenhum país encontrado.</TableEmpty>
                ) : (
                    paises?.map((pais) => (
                        <TableRow key={pais.codPais}>
                            <TableCell>{pais.codPais}</TableCell>
                            <TableCell>{pais.pais}</TableCell>
                            <TableCell>{pais.sigla}</TableCell>
                            <TableCell>{pais.ddi}</TableCell>
                            <TableCell>{pais.moeda}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}

export default async function PaisesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await paisesSearchParamsCache.parse(searchParams)

    return (
        <div className='p-8 max-w-4xl mx-auto'>
            <PageTitle>Gerenciar Países</PageTitle>

            <SearchInput />

            <Suspense key={termoBusca} fallback={<LoadingSpinner />}>
                <PaisesTable termoBusca={termoBusca} />
            </Suspense>
        </div>
    )
}