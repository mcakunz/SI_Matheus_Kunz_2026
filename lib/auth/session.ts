import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessaoUsuario } from './types'

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao-min-32-chars'
)

const COOKIE_NAME = 'pratica_session'
const EXPIRACAO   = '8h'

export async function criarToken(usuario: SessaoUsuario): Promise<string> {
    return new SignJWT({ ...usuario })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(EXPIRACAO)
        .sign(SECRET)
}

export async function verificarToken(token: string): Promise<SessaoUsuario | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET)
        return payload as unknown as SessaoUsuario
    } catch {
        return null
    }
}

export async function criarSessao(usuario: SessaoUsuario) {
    const token = await criarToken(usuario)
    const cookieStore = await cookies()

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path:     '/',
        maxAge:   60 * 60 * 8, // 8 horas
    })
}

export async function obterSessao(): Promise<SessaoUsuario | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verificarToken(token)
}

export async function destruirSessao() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}