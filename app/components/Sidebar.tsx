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
    HiChevronDown,
    HiOutlineLogout,
    HiOutlineUserCircle,
    HiOutlineCog,
    HiOutlineShieldCheck,
} from "react-icons/hi"
import { IconType } from "react-icons"
import { logout } from "@/app/(auth)/login/actions"
import { SessaoUsuario } from "@/lib/auth/types"

interface SubRoute {
    label: string
    href: string
}

interface RouteGroup {
    label: string
    icon: IconType
    href?: string
    subRoutes?: SubRoute[]
    matchPaths?: string[]
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
        matchPaths: ["/paises", "/estados", "/cidades"],
        subRoutes: [
            { label: "Países", href: "/paises" },
            { label: "Estados", href: "/estados" },
            { label: "Cidades", href: "/cidades" },
        ],
    },
    {
        label: "Cadastros",
        icon: HiOutlineClipboardList,
        matchPaths: ["/clientes", "/fornecedores", "/transportadoras", "/funcionarios"],
        subRoutes: [
            { label: "Clientes", href: "/clientes" },
            { label: "Fornecedores", href: "/fornecedores" },
            { label: "Veiculos", href: "/veiculos" },
            { label: "Transportadoras", href: "/transportadoras" },
            { label: "Funcionários", href: "/funcionarios" },
            { label: "Funcões de Funcionário", href: "/funcoes-funcionario" },
        ],
    },
    {
        label: "Produtos",
        icon: HiOutlineTag,
        matchPaths: ["/produtos", "/categorias", "/marcas", "/unidades-medida"],
        subRoutes: [
            { label: "Produtos", href: "/produtos" },
            { label: "Categorias", href: "/categorias" },
            { label: "Marcas", href: "/marcas" },
            { label: "Unidades de Medida", href: "/unidades-medida" },
        ],
    },
    {
        label: "Notas Fiscais",
        icon: HiOutlineReceiptTax,
        matchPaths: ["/notas-entrada", "/notas-saida", "/nfe"],
        subRoutes: [
            { label: "Notas de Entrada", href: "/notas-entrada" },
            { label: "Notas de Saída", href: "/notas-saida" },
            { label: "NF-e", href: "/nfe" },
        ],
    },
    {
        label: "Financeiro",
        icon: HiOutlineCurrencyDollar,
        matchPaths: ["/contas-pagar", "/contas-receber", "/formas-pagamento", "/condicoes-pagamento"],
        subRoutes: [
            { label: "Contas a Pagar", href: "/contas-pagar" },
            { label: "Contas a Receber", href: "/contas-receber" },
            { label: "Formas de Pagamento", href: "/formas-pagamento" },
            { label: "Condições de Pagamento", href: "/condicoes-pagamento" },
        ],
    },
    {
        label: "Administração",
        icon: HiOutlineShieldCheck,
        adminOnly: true,
        matchPaths: ["/admin"],
        subRoutes: [
            { label: "Usuários", href: "/admin/usuarios" },
            { label: "Perfis", href: "/admin/perfis" },
            { label: "Permissões", href: "/admin/permissoes" },
            { label: "Log de Acesso", href: "/admin/log-acesso" },
            { label: "Auditoria", href: "/admin/auditoria" },
        ],
    },
]

function SidebarGroup({ group, pathname }: { group: RouteGroup; pathname: string }) {
    const isGroupActive = group.href
        ? pathname === group.href
        : group.matchPaths?.some(p => pathname.startsWith(p)) ?? false

    const [isOpen, setIsOpen] = useState(isGroupActive)

    if (group.href) {
        return (
            <Link
                href={group.href}
                className={twMerge(
                    "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                    "text-slate-400 hover:text-white hover:bg-white/5",
                    isGroupActive && "text-white bg-white/10"
                )}
            >
                {isGroupActive && (
                    <span className="absolute left-0 h-7 w-0.5 bg-emerald-400 rounded-r-full" />
                )}
                <group.icon size={18} className="shrink-0" />
                <span className="truncate">{group.label}</span>
            </Link>
        )
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(o => !o)}
                className={twMerge(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                    "text-slate-400 hover:text-white hover:bg-white/5",
                    isGroupActive && "text-white"
                )}
            >
                <group.icon size={18} className="shrink-0" />
                <span className="flex-1 text-left truncate">{group.label}</span>
                <HiChevronDown
                    size={14}
                    className={twMerge(
                        "shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div className={twMerge(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="ml-4 mt-0.5 mb-1 border-l border-slate-700/60 pl-3 flex flex-col gap-0.5">
                    {group.subRoutes?.map(sub => {
                        const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/')
                        return (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                className={twMerge(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-150",
                                    "text-slate-500 hover:text-slate-200",
                                    isSubActive && "text-emerald-400 font-medium"
                                )}
                            >
                                {isSubActive && (
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                )}
                                <span className={isSubActive ? "" : "ml-3"}>{sub.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function UserProfile({ sessao }: { sessao: SessaoUsuario }) {
    const [menuAberto, setMenuAberto] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!menuAberto) return

        function handleClickFora(e: MouseEvent) {
            if(ref.current && !ref.current.contains(e.target as Node)) {
                setMenuAberto(false)
            }
        }

        document.addEventListener('mousedown', handleClickFora)
        return () => document.removeEventListener('mousedown', handleClickFora)
    }, [menuAberto])

    const iniciais = sessao.nome
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="relative" ref={ref}>
            {menuAberto && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-3 py-2.5 border-b border-slate-700/60">
                        <p className="text-white text-xs font-medium truncate">{sessao.nome}</p>
                        <p className="text-slate-500 text-[11px] truncate">{sessao.email}</p>
                    </div>
                    <div className="p-1">
                        <Link
                            href="/perfil"
                            onClick={() => setMenuAberto(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <HiOutlineUserCircle size={16} className="shrink-0" />
                            Meu Perfil
                        </Link>
                        <Link
                            href="/perfil/senha"
                            onClick={() => setMenuAberto(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <HiOutlineCog size={16} className="shrink-0" />
                            Alterar Senha
                        </Link>
                    </div>
                    <div className="p-1 border-t border-slate-700/60">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                                <HiOutlineLogout size={16} className="shrink-0" />
                                Sair
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                onClick={() => setMenuAberto(v => !v)}
                className={twMerge(
                    "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors",
                    "hover:bg-white/5",
                    menuAberto && "bg-white/5"
                )}
            >
                {sessao.fotoPerfil ? (
                    <img
                        src={sessao.fotoPerfil}
                        alt={sessao.nome}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <span className="text-emerald-400 text-[11px] font-semibold">{iniciais}</span>
                    </div>
                )}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-slate-200 text-xs font-medium truncate leading-tight">{sessao.nome}</p>
                    <p className="text-slate-600 text-[10px] truncate leading-tight capitalize">
                        {sessao.perfil?.replace('_', ' ').toLowerCase() ?? ''}
                    </p>
                </div>
                <HiChevronDown
                    size={13}
                    className={twMerge(
                        "text-slate-600 shrink-0 transition-transform duration-150",
                        menuAberto && "rotate-180"
                    )}
                />
            </button>
        </div>
    )
}

interface SidebarProps {
    children: React.ReactNode
    sessao: SessaoUsuario
}

const Sidebar: React.FC<SidebarProps> = ({ children, sessao }) => {
    const pathname = usePathname()

    const nivelPerfil = sessao?.nivelPerfil ?? 0

    const gruposVisiveis = ROUTE_GROUPS.filter(
        g => !g.adminOnly || nivelPerfil >= 80
    )

    return (
        <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
            <aside className="hidden md:flex flex-col bg-slate-900 h-full w-60 shrink-0 border-r border-slate-800">

                <div className="px-4 py-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5"> 
                        <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                            <HiOutlineOfficeBuilding size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold leading-tight">Prática</p>
                            <p className="text-slate-500 text-[10px] leading-tight tracking-wide uppercase">Profissional</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5 relative">
                    {gruposVisiveis.map(group => (
                        <SidebarGroup key={group.label} group={group} pathname={pathname} />
                    ))}
                </nav>

                <div className="px-3 py-3 border-t border-slate-800">
                    {sessao && <UserProfile sessao={sessao} />}
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto text-black">
                {children}
            </main>
        </div>
    )
}

export default Sidebar
