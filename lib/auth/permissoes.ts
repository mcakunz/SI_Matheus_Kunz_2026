import { obterSessao } from './session'
import { query } from '@/lib/db'
import { ResultadoPermissao, SessaoUsuario } from './types'

export async function checarPermissao(
    recurso: string,
    acao: string
): Promise<ResultadoPermissao> {
    const sessao = await obterSessao()
    if (!sessao) return { autorizado: false, motivo: 'Não autenticado.' }
    return checarPermissaoUsuario(sessao.id, recurso, acao)
}

export async function checarPermissaoUsuario(
    usuarioId: number,
    recurso: string,
    acao: string
): Promise<ResultadoPermissao> {
    const rows = await query<{ recurso: string; acao: string }>(
        `SELECT recurso, acao
           FROM vw_permissoes_usuario
          WHERE "usuarioId" = $1
            AND recurso     = $2
            AND acao        = $3`,
        [usuarioId, recurso, acao]
    )

    if (rows.length > 0) return { autorizado: true }

    return {
        autorizado: false,
        motivo: `Sem permissão para "${acao}" em "${recurso}".`,
    }
}

export async function obterPermissoesUsuario(usuarioId: number) {
    return query<{ recurso: string; acao: string }>(
        `SELECT recurso, acao FROM vw_permissoes_usuario WHERE "usuarioId" = $1`,
        [usuarioId]
    )
}

export async function exigirPermissao(recurso: string, acao: string) {
    const resultado = await checarPermissao(recurso, acao)
    if (!resultado.autorizado) throw new Error(resultado.motivo)
}

export function ehAdmin(sessao: SessaoUsuario): boolean {
    return sessao.nivelPerfil >= 80
}

export function ehSuperAdmin(sessao: SessaoUsuario): boolean {
    return sessao.nivelPerfil >= 99
}