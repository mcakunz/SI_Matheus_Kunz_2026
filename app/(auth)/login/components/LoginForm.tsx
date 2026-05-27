"use client"

import { useState } from "react"
import { login } from "../actions"

interface LoginFormProps {
    redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
    const [erro, setErro] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mostrarSenha, setMostrarSenha] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErro(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        if (redirectTo) formData.append('redirectTo', redirectTo)

        try {
            await login(formData)
        } catch (err: any) {
            if (err?.message?.includes('NEXT_REDIRECT')) return
            setErro(err.message ?? 'Erro ao fazer login.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Usuário ou e-mail
                </label>
                <input
                    name="login"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    required
                    placeholder="seu.usuario"
                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600
                               rounded-lg px-3.5 py-2.5 text-sm outline-none
                               focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30
                               transition-colors"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    Senha
                </label>
                <div className="relative">
                    <input
                        name="senha"
                        type={mostrarSenha ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600
                                   rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none
                                   focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30
                                   transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setMostrarSenha(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                    >
                        {mostrarSenha ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {erro && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-3">
                    <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-red-400 text-xs leading-relaxed">{erro}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50
                           text-white font-medium text-sm py-2.5 rounded-lg
                           transition-colors shadow-lg shadow-emerald-500/20
                           disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Entrando...
                    </>
                ) : (
                    'Entrar'
                )}
            </button>
        </form>
    )
}
