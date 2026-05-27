import { NextResponse, type NextRequest } from 'next/server'
import { verificarToken } from '@/lib/auth/session'

// const ROTAS_PUBLICAS = ['/login', '/recuperar-senha']

// export async function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl

//     const ehPublica = ROTAS_PUBLICAS.some(r => pathname.startsWith(r))
//     const ehAsset   = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

//     if (ehPublica || ehAsset) return NextResponse.next()

//     const token = request.cookies.get('pratica_session')?.value

//     if (!token) {
//         const loginUrl = new URL('/login', request.url)
//         loginUrl.searchParams.set('redirect', pathname)
//         return NextResponse.redirect(loginUrl)
//     }

//     const sessao = await verificarToken(token)

//     if (!sessao) {
//         const loginUrl = new URL('/login', request.url)
//         loginUrl.searchParams.set('redirect', pathname)
//         const response = NextResponse.redirect(loginUrl)
//         response.cookies.delete('pratica_session')
//         return response
//     }

//     const requestHeaders = new Headers(request.headers)
//     requestHeaders.set('x-usuario-id', String(sessao.id))

//     return NextResponse.next({ request: { headers: requestHeaders } })
// }

// export const config = {
//     matcher: [
//         /*
//          * Aplica o middleware em todas as rotas exceto:
//          * - _next/static (arquivos estáticos)
//          * - _next/image (imagens)
//          * - favicon.ico
//          * - arquivos com extensão (png, jpg, etc.)
//          */
//         '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//     ],
// }


export function middleware() {
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}