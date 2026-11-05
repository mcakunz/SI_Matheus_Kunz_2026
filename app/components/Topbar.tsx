"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { twMerge } from "tailwind-merge"
import {
    HiHome,
    HiOutlineGlobe,
    HiOutlineClipboardList,
    HiOutlineTag,
    HiOutlineCurrencyDollar,
    HiOutlineReceiptTax,
    HiOutlineOfficeBuilding,
    HiOutlineShieldCheck,
    HiChevronDown,
    HiOutlineLogout,
    HiOutlineUserCircle,
    HiOutlineCog,
    // ícones dos itens de cada menu (mesmo estilo "outline" dos grupos)
    HiOutlineFlag,
    HiOutlineMap,
    HiOutlineLocationMarker,
    HiOutlineUserGroup,
    HiOutlineShoppingCart,
    HiOutlineTruck,
    HiOutlineIdentification,
    HiOutlineBriefcase,
    HiOutlineCube,
    HiOutlineCollection,
    HiOutlineBadgeCheck,
    HiOutlineScale,
    HiOutlineDocumentDownload,
    HiOutlineUpload,
    HiOutlineDocumentText,
    HiOutlineTrendingDown,
    HiOutlineTrendingUp,
    HiOutlineCreditCard,
    HiOutlineCalendar,
    HiOutlineUsers,
    HiOutlineKey,
    HiOutlineLogin,
    HiOutlineDocumentSearch,
} from "react-icons/hi"
import { IconType } from "react-icons"
import { logout } from "@/app/(auth)/login/actions"
import { SessaoUsuario } from "@/lib/auth/types"

// ---------------------------------------------------------------------------
// MENU
// O grupo fica "ativo" quando a rota atual é um dos seus itens (calculado a partir dos próprios
// hrefs, então não precisa manter uma lista separada).
// ---------------------------------------------------------------------------

interface SubRoute {
    label: string
    href: string
    icon: IconType
}

interface RouteGroup {
    label: string
    icon: IconType
    href?: string
    subRoutes?: SubRoute[]
    adminOnly?: boolean
}

const ROUTE_GROUPS: RouteGroup[] = [
    {
        label: "Início",
        icon: HiHome,
        href: "/",
    },
    {
        label: "Localidades",
        icon: HiOutlineGlobe,
        subRoutes: [
            { label: "Países", href: "/paises", icon: HiOutlineFlag },
            { label: "Estados", href: "/estados", icon: HiOutlineMap },
            { label: "Cidades", href: "/cidades", icon: HiOutlineLocationMarker },
        ],
    },
    {
        label: "Cadastros",
        icon: HiOutlineClipboardList,
        subRoutes: [
            { label: "Clientes", href: "/clientes", icon: HiOutlineUserGroup },
            { label: "Fornecedores", href: "/fornecedores", icon: HiOutlineShoppingCart },
            { label: "Veículos", href: "/veiculos", icon: HiOutlineTruck },
            { label: "Transportadoras", href: "/transportadoras", icon: HiOutlineOfficeBuilding },
            { label: "Funcionários", href: "/funcionarios", icon: HiOutlineIdentification },
            { label: "Funções de Funcionário", href: "/funcoes-funcionario", icon: HiOutlineBriefcase },
        ],
    },
    {
        label: "Produtos",
        icon: HiOutlineTag,
        subRoutes: [
            { label: "Produtos", href: "/produtos", icon: HiOutlineCube },
            { label: "Categorias", href: "/categorias", icon: HiOutlineCollection },
            { label: "Marcas", href: "/marcas", icon: HiOutlineBadgeCheck },
            { label: "Unidades de Medida", href: "/unidades-medida", icon: HiOutlineScale },
        ],
    },
    {
        label: "Notas Fiscais",
        icon: HiOutlineReceiptTax,
        subRoutes: [
            { label: "Notas de Entrada", href: "/notas-entrada", icon: HiOutlineDocumentDownload },
            { label: "Notas de Saída", href: "/notas-saida", icon: HiOutlineUpload },
            { label: "NF-e", href: "/nfe", icon: HiOutlineDocumentText },
        ],
    },
    {
        label: "Financeiro",
        icon: HiOutlineCurrencyDollar,
        subRoutes: [
            { label: "Contas a Pagar", href: "/contas-pagar", icon: HiOutlineTrendingDown },
            { label: "Contas a Receber", href: "/contas-receber", icon: HiOutlineTrendingUp },
            { label: "Formas de Pagamento", href: "/formas-pagamento", icon: HiOutlineCreditCard },
            { label: "Condições de Pagamento", href: "/condicoes-pagamento", icon: HiOutlineCalendar },
        ],
    },
    {
        label: "Administração",
        icon: HiOutlineShieldCheck,
        adminOnly: true,
        subRoutes: [
            { label: "Usuários", href: "/admin/usuarios", icon: HiOutlineUsers },
            { label: "Perfis", href: "/admin/perfis", icon: HiOutlineUserCircle },
            { label: "Permissões", href: "/admin/permissoes", icon: HiOutlineKey },
            { label: "Log de Acesso", href: "/admin/log-acesso", icon: HiOutlineLogin },
            { label: "Auditoria", href: "/admin/auditoria", icon: HiOutlineDocumentSearch },
        ],
    },
]

const rotaAtiva = (pathname: string, href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

const grupoAtivo = (pathname: string, g: RouteGroup) =>
    g.href ? rotaAtiva(pathname, g.href) : (g.subRoutes ?? []).some(s => rotaAtiva(pathname, s.href))

// Qual menu suspenso está aberto: o label de um grupo, o menu do usuário ou nenhum.
type MenuAberto = string | "usuario" | null

// Largura mínima do menu suspenso (px) — min-w-64 normalmente, min-w-72 a partir de 2xl. Usada para decidir se
// o menu abre para a direita ou alinhado à direita do botão (perto da borda da tela).
const larguraMenu = () => (window.innerWidth >= 1536 ? 288 : 256)

// ---------------------------------------------------------------------------
// TOPBAR: cada grupo (Localidades, Cadastros...) é um botão na barra que abre o seu menu suspenso,
// em qualquer largura de tela. A barra se adapta à largura:
//   • >= 1536px (2xl, ex.: 1920x1080): fonte maior, ícone nos grupos, barra mais alta
//   • >= 1024px (lg): nome "Prática Profissional" ao lado do ícone; fonte normal
//   • < 1024px: só o ícone do sistema; fonte e espaçamento menores (cabe numa linha até ~720px);
//     abaixo disso os grupos quebram para uma 2ª linha em vez de sumirem
// ---------------------------------------------------------------------------

interface TopbarProps {
    children: React.ReactNode
    sessao: SessaoUsuario
}

const Topbar: React.FC<TopbarProps> = ({ children, sessao }) => {
    const pathname = usePathname()
    const [aberto, setAberto] = useState<MenuAberto>(null)
    const headerRef = useRef<HTMLElement>(null)

    const nivelPerfil = sessao?.nivelPerfil ?? 0
    const gruposVisiveis = ROUTE_GROUPS.filter(g => !g.adminOnly || nivelPerfil >= 80)

    const fechar = () => setAberto(null)

    // Fecha o menu aberto ao clicar fora da barra ou apertar Esc.
    useEffect(() => {
        if (!aberto) return

        function aoClicarFora(e: MouseEvent) {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) setAberto(null)
        }
        function aoTeclar(e: KeyboardEvent) {
            if (e.key === "Escape") setAberto(null)
        }

        document.addEventListener("mousedown", aoClicarFora)
        document.addEventListener("keydown", aoTeclar)
        return () => {
            document.removeEventListener("mousedown", aoClicarFora)
            document.removeEventListener("keydown", aoTeclar)
        }
    }, [aberto])

    const alternar = (menu: Exclude<MenuAberto, null>) => setAberto(atual => (atual === menu ? null : menu))

    return (
        <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden">
            <header ref={headerRef} className="relative z-40 shrink-0 bg-slate-900 border-b border-slate-800">
                <div className="min-h-14 2xl:min-h-16 px-2 sm:px-3 md:px-4 2xl:px-6 py-1.5 flex items-center gap-2 sm:gap-3 2xl:gap-5">

                    {/* Logo + nome do sistema */}
                    <Link href="/" onClick={fechar} className="flex items-center gap-2.5 shrink-0 lg:mr-2 2xl:mr-4">
                        <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                            <HiOutlineOfficeBuilding className="text-white w-5 h-5 2xl:w-6 2xl:h-6" />
                        </div>
                        <span className="hidden lg:block text-white text-base 2xl:text-lg font-semibold whitespace-nowrap tracking-tight">
                            Prática Profissional
                        </span>
                    </Link>

                    {/* Grupos do menu, cada um com o seu dropdown */}
                    <nav className="flex flex-wrap items-center gap-x-0.5 2xl:gap-x-1 gap-y-1 flex-1 min-w-0" aria-label="Menu principal">
                        {gruposVisiveis.map(g => (
                            <GrupoMenu
                                key={g.label}
                                grupo={g}
                                pathname={pathname}
                                aberto={aberto === g.label}
                                onAlternar={() => alternar(g.label)}
                                onNavegar={fechar}
                            />
                        ))}
                    </nav>

                    {/* Usuário */}
                    {sessao && (
                        <MenuUsuario
                            sessao={sessao}
                            aberto={aberto === "usuario"}
                            onAlternar={() => alternar("usuario")}
                            onNavegar={fechar}
                        />
                    )}
                </div>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto text-black">
                {children}
            </main>
        </div>
    )
}

export default Topbar

// ---------------------------------------------------------------------------
// GRUPO: botão na barra + menu suspenso com os itens
// ---------------------------------------------------------------------------
interface GrupoMenuProps {
    grupo: RouteGroup
    pathname: string
    aberto: boolean
    onAlternar: () => void
    onNavegar: () => void
}

function GrupoMenu({ grupo, pathname, aberto, onAlternar, onNavegar }: GrupoMenuProps) {
    const ativo = grupoAtivo(pathname, grupo)
    const botaoRef = useRef<HTMLButtonElement>(null)
    // Se o menu não couber à direita do botão (grupo perto da borda da tela), abre alinhado à direita.
    const [alinharDireita, setAlinharDireita] = useState(false)

    const classeBotao = twMerge(
        "relative flex items-center gap-1 lg:gap-1.5 2xl:gap-2 h-9 2xl:h-11 px-1.5 md:px-2 lg:px-2.5 xl:px-3 2xl:px-3.5",
        "rounded-md text-xs lg:text-sm 2xl:text-base font-medium whitespace-nowrap transition-colors",
        "text-slate-400 hover:text-white hover:bg-white/5",
        (ativo || aberto) && "text-white",
        aberto && "bg-white/10",
    )
    const marcaAtivo = ativo && (
        <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-emerald-400" />
    )
    // Ícone do grupo só em telas grandes (2xl), onde sobra espaço na barra.
    const iconeGrupo = <grupo.icon className="hidden 2xl:block shrink-0 w-5 h-5" />

    if (grupo.href) {
        return (
            <Link href={grupo.href} onClick={onNavegar} className={classeBotao} aria-current={ativo ? "page" : undefined}>
                {iconeGrupo}
                {grupo.label}
                {marcaAtivo}
            </Link>
        )
    }

    const aoClicar = () => {
        const r = botaoRef.current?.getBoundingClientRect()
        if (r) setAlinharDireita(r.left + larguraMenu() > window.innerWidth - 8)
        onAlternar()
    }

    return (
        <div className="relative">
            <button
                ref={botaoRef}
                type="button"
                onClick={aoClicar}
                className={classeBotao}
                aria-haspopup="menu"
                aria-expanded={aberto}
            >
                {iconeGrupo}
                {grupo.label}
                <HiChevronDown className={twMerge("shrink-0 w-3.5 h-3.5 2xl:w-4 2xl:h-4 transition-transform duration-150", aberto && "rotate-180")} />
                {marcaAtivo}
            </button>

            {aberto && (
                <div
                    role="menu"
                    className={twMerge(
                        "absolute top-full mt-1.5 min-w-64 2xl:min-w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5",
                        alinharDireita ? "right-0" : "left-0",
                    )}
                >
                    {grupo.subRoutes?.map(sub => {
                        const subAtivo = rotaAtiva(pathname, sub.href)
                        return (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                role="menuitem"
                                onClick={onNavegar}
                                aria-current={subAtivo ? "page" : undefined}
                                className={twMerge(
                                    "flex items-center gap-3 px-3 py-2.5 2xl:py-3 rounded-lg text-sm 2xl:text-base whitespace-nowrap transition-colors",
                                    "text-slate-300 hover:text-white hover:bg-white/5",
                                    subAtivo && "text-emerald-400 font-medium bg-emerald-500/10 hover:text-emerald-300 hover:bg-emerald-500/15",
                                )}
                            >
                                <sub.icon className={twMerge("shrink-0 w-5 h-5", subAtivo ? "text-emerald-400" : "text-slate-400")} />
                                {sub.label}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// USUÁRIO (canto direito): avatar + menu com perfil, senha e sair
// ---------------------------------------------------------------------------
interface MenuUsuarioProps {
    sessao: SessaoUsuario
    aberto: boolean
    onAlternar: () => void
    onNavegar: () => void
}

function Avatar({ sessao, grande = false }: { sessao: SessaoUsuario; grande?: boolean }) {
    const iniciais = sessao.nome
        .split(" ")
        .slice(0, 2)
        .map(n => n[0])
        .join("")
        .toUpperCase()
    const tamanho = grande ? "w-11 h-11 text-sm" : "w-8 h-8 2xl:w-9 2xl:h-9 text-[11px] 2xl:text-xs"

    return sessao.fotoPerfil ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={sessao.fotoPerfil}
            alt={sessao.nome}
            className={twMerge("rounded-full object-cover shrink-0 ring-1 ring-slate-700", tamanho)}
        />
    ) : (
        <div className={twMerge("rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0", tamanho)}>
            <span className="text-emerald-400 font-semibold">{iniciais}</span>
        </div>
    )
}

function MenuUsuario({ sessao, aberto, onAlternar, onNavegar }: MenuUsuarioProps) {
    const perfil = sessao.perfil?.replace("_", " ").toLowerCase() ?? ""
    const classeItem = "flex items-center gap-3 px-3 py-2.5 2xl:py-3 rounded-lg text-sm 2xl:text-base whitespace-nowrap transition-colors"

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={onAlternar}
                aria-haspopup="menu"
                aria-expanded={aberto}
                className={twMerge(
                    "flex items-center gap-2.5 h-10 2xl:h-12 px-1.5 xl:px-2 rounded-lg transition-colors hover:bg-white/5",
                    aberto && "bg-white/10",
                )}
            >
                <Avatar sessao={sessao} />
                <div className="hidden xl:block text-left min-w-0 max-w-48">
                    <p className="text-slate-200 text-sm 2xl:text-base font-medium truncate leading-tight">{sessao.nome}</p>
                    <p className="text-slate-500 text-xs truncate leading-tight capitalize">{perfil}</p>
                </div>
                <HiChevronDown
                    className={twMerge("hidden md:block w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-150", aberto && "rotate-180")}
                />
            </button>

            {aberto && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 min-w-72 2xl:min-w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Cabeçalho com quem está logado */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/60">
                        <Avatar sessao={sessao} grande />
                        <div className="min-w-0">
                            <p className="text-white text-sm 2xl:text-base font-semibold truncate">{sessao.nome}</p>
                            <p className="text-slate-400 text-xs 2xl:text-sm truncate">{sessao.email}</p>
                            {perfil && (
                                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium capitalize">
                                    {perfil}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-1.5">
                        <Link
                            href="/perfil"
                            role="menuitem"
                            onClick={onNavegar}
                            className={twMerge(classeItem, "text-slate-300 hover:text-white hover:bg-white/5")}
                        >
                            <HiOutlineUserCircle className="w-5 h-5 shrink-0 text-slate-400" />
                            Meu Perfil
                        </Link>
                        <Link
                            href="/perfil/senha"
                            role="menuitem"
                            onClick={onNavegar}
                            className={twMerge(classeItem, "text-slate-300 hover:text-white hover:bg-white/5")}
                        >
                            <HiOutlineCog className="w-5 h-5 shrink-0 text-slate-400" />
                            Alterar Senha
                        </Link>
                    </div>
                    <div className="p-1.5 border-t border-slate-700/60">
                        <form action={logout}>
                            <button
                                type="submit"
                                role="menuitem"
                                className={twMerge(classeItem, "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10")}
                            >
                                <HiOutlineLogout className="w-5 h-5 shrink-0" />
                                Sair
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
