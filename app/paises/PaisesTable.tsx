import { createClient } from '@/lib/supabase/server'

export default async function PaisesTable({ termoBusca }: { termoBusca: string }) {
    const supabase = await createClient()
    
    let query = supabase.from('paises').select('*').order('codPais', { ascending: true })

    if (termoBusca) {
        query = query.ilike('pais', `%${termoBusca}%`)
    }

    const { data: paises, error } = await query

    if (error) {
        return (
            <div className='bg-red-100 text-red-700 p-4'>
                Erro ao carregar os dados: {error.message}
            </div>
        )
    }

    return (
        <table className='w-full text-left border-collapse'>
            <thead>
                <tr className='bg-gray-100 border-b'>
                    <th className="p-3">Código</th>
                    <th className="p-3">País</th>
                    <th className="p-3">Sigla</th>
                    <th className="p-3">DDI</th>
                    <th className="p-3">Moeda</th>
                </tr>
            </thead>
            <tbody>
                {paises?.length === 0 ? (
                    <tr>
                        <td colSpan={5} className='p-4 text-center text-gray-500'>
                            Nenhum país encontrado.
                        </td>
                    </tr>
                ) : (
                    paises?.map((pais) => (
                        <tr key={pais.codPais} className='border-b hover:bg-gray-50'>
                            <td className="p-3">{pais.codPais}</td>
                            <td className="p-3">{pais.pais}</td>
                            <td className="p-3">{pais.sigla}</td>
                            <td className="p-3">{pais.ddi}</td>
                            <td className="p-3">{pais.moeda}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}