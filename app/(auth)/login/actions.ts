"use server"

import { compare } from 'bcrypt'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { query, queryOne } from '@/lib/db'
import { criarSessao } from '@/lib/auth/session'
import { SessaoUsuario } from '@/lib/auth/types'

const MAX_TENTATIVAS = 5

interface UsuarioDB {
    id:              number
    usuario:         string
    nome:            string
    email:           string
    senhaHash:       string
    perfilId:        number
    perfil:          string
    nivelPerfil:     number
    fotoPerfil:      string | null
    situacao:        string
    tentativasLogin: number
}

export async function login(formData: FormData) {
    const login = (formData.get('login') as string)?.trim().toLowerCase()
    const senha = formData.get('senha') as string

    if (!login || !senha) throw new Error('Preencha o login e a senha.')

    const headerStore = await headers()
    const ip        = headerStore.get('x-forwarded-for') ?? 'desconhecido'
    const userAgent = headerStore.get('user-agent') ?? ''

    const usuario = await queryOne<UsuarioDB>(
        `SELECT u.id, u.usuario, u.nome, u.email, u."senhaHash",
                u."perfilId", p.perfil, p.nivel AS "nivelPerfil",
                u."fotoPerfil", u.situacao, u."tentativasLogin"
           FROM tb_usuarios u
           JOIN tb_perfis_usuario p ON p.id = u."perfilId"
          WHERE (lower(u.usuario) = $1 OR lower(u.email) = $1)
            AND u.ativo = true`,
        [login]
    )

    if (!usuario) {
        await registrarLog(null, login, false, ip, userAgent, 'Usuário não encontrado')
        throw new Error('Login ou senha inválidos.')
    }

    if (usuario.situacao === 'BLOQUEADO') {
        await registrarLog(usuario.id, login, false, ip, userAgent, 'Conta bloqueada')
        throw new Error('Esta conta está bloqueada. Entre em contato com o administrador.')
    }

    if (usuario.situacao !== 'ATIVO') {
        await registrarLog(usuario.id, login, false, ip, userAgent, `Situação: ${usuario.situacao}`)
        throw new Error('Esta conta não está ativa.')
    }

    const senhaCorreta = await compare(senha, usuario.senhaHash)
    if (!senhaCorreta) {
        const novasTentativas = usuario.tentativasLogin + 1
        const bloquear = novasTentativas >= MAX_TENTATIVAS

        await query(
            `UPDATE tb_usuarios
                SET "tentativasLogin" = $1,
                    situacao = CASE WHEN $2 THEN 'BLOQUEADO'::situacao_usuario ELSE situacao END
              WHERE id = $3`,
            [novasTentativas, bloquear, usuario.id]
        )

        await registrarLog(usuario.id, login, false, ip, userAgent,
            bloquear ? 'Conta bloqueada por excesso de tentativas' : 'Senha incorreta'
        )

        if (bloquear) {
            throw new Error(`Conta bloqueada após ${MAX_TENTATIVAS} tentativas. Contate o administrador.`)
        }

        const restantes = MAX_TENTATIVAS - novasTentativas
        throw new Error(`Senha incorreta. ${restantes} tentativa(s) restante(s).`)
    }

    await query(
        `UPDATE tb_usuarios
            SET "tentativasLogin" = 0,
                "ultimoLogin"     = CURRENT_TIMESTAMP
          WHERE id = $1`,
        [usuario.id]
    )

    await registrarLog(usuario.id, login, true, ip, userAgent)

    const sessao: SessaoUsuario = {
        id:          usuario.id,
        usuario:     usuario.usuario,
        nome:        usuario.nome,
        email:       usuario.email,
        perfilId:    usuario.perfilId,
        perfil:      usuario.perfil,
        nivelPerfil: usuario.nivelPerfil,
        fotoPerfil:  usuario.fotoPerfil,
    }

    await criarSessao(sessao)
    redirect('/')
}

export async function logout() {
    const { destruirSessao } = await import('@/lib/auth/session')
    await destruirSessao()
    redirect('/login')
}

async function registrarLog(
    usuarioId: number | null,
    loginTentado: string,
    sucesso: boolean,
    ip: string,
    userAgent: string,
    observacao?: string
) {
    await query(
        `INSERT INTO tb_log_acesso
            ("usuarioId", "loginTentado", sucesso, "ipOrigem", "userAgent", observacao)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [usuarioId, loginTentado, sucesso, ip, userAgent, observacao ?? null]
    )
}