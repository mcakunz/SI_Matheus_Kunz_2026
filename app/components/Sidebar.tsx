"use client"

import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import Link from "next/link"
import { twMerge } from "tailwind-merge"
import {
    HiHome,
    HiOutlineGlobe,
    HiOutlineTruck,
    HiOutlineDocumentText,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardList,
    HiOutlineOfficeBuilding,
    HiOutlineTag,
    HiOutlineScale,
    HiOutlineUserGroup,
    HiChevronDown,
    HiOutlineReceiptTax,
} from "react-icons/hi"
import { IconType } from "react-icons"



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
}

interface SidebarProps {
    children: React.ReactNode
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
            { label: "Transportadoras", href: "/transportadoras" },
            { label: "Funcionários", href: "/funcionarios" },
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
]

function SidebarGroup({ group, pathname }: { group: RouteGroup; pathname: string }) {
    const isGroupActive = group.href
        ? pathname === group.href
        : group.matchPaths?.some((p) => pathname.startsWith(p)) ?? false

    const [isOpen, setIsOpen] = useState(isGroupActive)

    if (group.href) {
        return (
            <Link
                href={group.href}
                className={twMerge(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
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
                onClick={() => setIsOpen((o) => !o)}
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

            <div
                className={twMerge(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="ml-4 mt-0.5 mb-1 border-l border-slate-700/60 pl-3 flex flex-col gap-0.5">
                    {group.subRoutes?.map((sub) => {
                        const isSubActive = pathname === sub.href
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

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const pathname = usePathname()

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
                    {ROUTE_GROUPS.map((group) => (
                        <SidebarGroup key={group.label} group={group} pathname={pathname} />
                    ))}
                </nav>

                <div className="px-4 py-3 border-t border-slate-800">
                    <p className="text-slate-600 text-[10px] tracking-wide">
                        {new Date().getFullYear()} · ERP 
                    </p>
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto text-black">
                {children}
            </main>
        </div>
    )
}

export default Sidebar
