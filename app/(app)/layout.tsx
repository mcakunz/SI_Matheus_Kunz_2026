import { obterSessao } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/components/Sidebar'

// export default async function AppLayout({ children }: { children: React.ReactNode }) {
//     const sessao = await obterSessao()

//     if (!sessao) redirect('/login')




//     return <Sidebar sessao={SESSAO_DEV}>{children}</Sidebar>

// }

const SESSAO_DEV = {
    id: 1,
    usuario: 'dev',
    nome: 'Desenvolvedor',
    email: 'dev@local',
    perfilId: 1,
    perfil: 'SUPER_ADMIN',
    nivelPerfil: 99,
    fotoPerfil: null,
}
export default async function AppLayout({ children }: { children: React.ReactNode }) {
    return <Sidebar sessao={SESSAO_DEV}>{children}</Sidebar>
}