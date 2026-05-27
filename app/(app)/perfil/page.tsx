import { obterSessao } from "@/lib/auth/session"
import { queryOne } from "@/lib/db"
import { notFound } from "next/navigation"

import { formatarData } from "@/lib/utils/date"

interface UsuarioPerfil {
    id:              number
    usuario:         string
    nome:            string
    email:           string
    perfil:          string
    nivelPerfil:     number
    situacao:        string
    ultimoLogin:     string | null
    dataCadastro:    string
    fotoPerfil:      string | null
}

export default async function PerfilPage() {
    const sessao = await obterSessao()
    if (!sessao) notFound()

    const usuario = await queryOne<UsuarioPerfil>(
        `SELECT u.id, u.usuario, u.nome, u.email, p.perfil,
                p.nivel AS "nivelPerfil", u.situacao,
                u."ultimoLogin", u."dataCadastro", u."fotoPerfil"
           FROM tb_usuarios u
           JOIN tb_perfis_usuario p ON p.id = u."perfilId"
          WHERE u.id = $1`,
        [sessao.id]
    )

    if (!usuario) notFound()

    const iniciais = usuario.nome
        .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    return (
        <div className="p-6 mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Perfil</h1>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex flex-col gap-6">

                <div className="flex items-center gap-5">
                    {usuario.fotoPerfil ? (
                        <img
                            src={usuario.fotoPerfil}
                            alt={usuario.nome}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                            <span className="text-emerald-600 text-xl font-bold">{iniciais}</span>
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{usuario.nome}</h2>
                        <p className="text-slate-500 text-sm">@{usuario.usuario}</p>
                        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {usuario.perfil.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                    {[
                        { label: 'E-mail',         value: usuario.email          },
                        { label: 'Usuário',        value: `@${usuario.usuario}`  },
                        { label: 'Situação',       value: usuario.situacao       },
                        { label: 'Nível de acesso',value: `${usuario.perfil.replace('_',' ')} (nível ${usuario.nivelPerfil})` },
                        { label: 'Último acesso',  value: formatarData(usuario.ultimoLogin)   },
                        { label: 'Cadastrado em',  value: formatarData(usuario.dataCadastro)  },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                            <p className="text-sm text-slate-700 font-medium">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 border-t border-slate-100 pt-5">
                    <a
                        href="/perfil/senha"
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
                    >
                        Alterar Senha
                    </a>
                </div>
            </div>
        </div>
    )
}
