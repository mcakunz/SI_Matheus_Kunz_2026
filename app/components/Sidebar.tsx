"use client"

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiHome, HiOutlineGlobe, HiOutlineTruck, HiOutlineDocumentText } from "react-icons/hi";
import SidebarItem from "./SidebarItem";

interface SidebarProps{
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    children 
}) => {
    const pathname = usePathname();

    const routes = useMemo(() => [
        {
            icon: HiHome,
            label: 'Página Inicial',
            active: pathname === '/',
            href: '/',
        },
        {
            icon: HiOutlineGlobe,
            label: 'Localidades',
            active: pathname.startsWith('/paises') || pathname.startsWith('/estados') || pathname.startsWith('/cidades'),
            subRoutes: [
                { label: 'Países', href: '/paises', active: pathname === '/paises' },
                { label: 'Estados', href: '/estados', active: pathname === '/estados' },
                { label: 'Cidades', href: '/cidades', active: pathname === '/cidades' },
            ]
        },
        {
            icon: HiOutlineTruck,
            label: 'Fornecedores',
            active: pathname === '/fornecedores',
            href: '/fornecedores',
        },
        {
            icon: HiOutlineDocumentText,
            label: 'Produtos',
            active: pathname === '/produtos',
            href: '/produtos'
        }
    ], [pathname])

    return (
        <div className="flex h-screen w-full bg-slate-100">
            <aside className="hidden md:flex flex-col bg-slate-900 h-full w-65 px-4 py-6">
                <h1 className="text-white text-xl font-bold mb-8 px-2 border-b border-slate-700 pb-4">
                    Prática Profissional
                </h1>
                <div className="flex flex-col gap-y-2">
                    {routes.map((item) => (
                        <SidebarItem key={item.label} {...item} />
                    ))}
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto p-6 text-black">
                {children}
            </main>
        </div>
    )
}

export default Sidebar;