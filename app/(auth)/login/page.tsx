import { obterSessao } from '@/lib/auth/session'
import { LoginForm } from './components/LoginForm'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Login · Prática ERP' }

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string }>
}) {
    const sessao = await obterSessao()
    if (sessao) redirect('/')

    const { redirect: redirectTo } = await searchParams

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                    </div>
                    <h1 className="text-white text-xl font-semibold tracking-tight">Prática ERP</h1>
                    <p className="text-slate-500 text-sm mt-1">Acesso ao sistema</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <LoginForm redirectTo={redirectTo} />
                </div>

                <p className="text-center text-slate-700 text-xs mt-6">
                    © {new Date().getFullYear()} Prática Profissional
                </p>
            </div>
        </div>
    )
}
