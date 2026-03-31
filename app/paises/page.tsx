import { SearchInput } from '../components/SearchInput'
import { createSearchParamsCache, parseAsString, type SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import PaisesTable from './PaisesTable'

export const dynamic = 'force-dynamic'

const paisesSearchParamsCache = createSearchParamsCache({
    q: parseAsString.withDefault(''),
})

export default async function PaisesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const { q: termoBusca } = await paisesSearchParamsCache.parse(searchParams)

    return (
        <div className='p-8 max-w-4xl mx-auto'>
            <div className='text-2xl font-bold mb-6'>Gerenciar Países</div>

            <SearchInput />
            <div className='bg-white rounded-lg shadow overflow-hidden text-black mt-4 min-h-50'>
                <Suspense 
                    key={termoBusca} 
                    fallback={
                        <div className="flex justify-center items-center p-12 h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                        </div>
                    }
                >
                    <PaisesTable termoBusca={termoBusca} />
                </Suspense>
            </div>
        </div>
    )
}