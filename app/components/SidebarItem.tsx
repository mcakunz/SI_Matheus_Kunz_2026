"use client"
import Link from "next/link";
import { useState } from "react";
import { IconType } from "react-icons";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { twMerge } from "tailwind-merge";


interface SubRoute {
    label: string,
    href: string,
    active?: boolean,
}

interface SidebarItemProps {
    icon: IconType,
    label: string,
    active?: boolean,
    href?: string,
    subRoutes?: SubRoute[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon: Icon, label, active, href, subRoutes
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubRoutes = subRoutes && subRoutes.length > 0;

    if (hasSubRoutes) {
        return (
            <div className="flex flex-col">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={twMerge(
                    `flex flex-row h-auto items-center w-full justify-between text-xl font-medium cursor-pointer hover:text-white transition text-slate-400 py-2 px-2 rounded-md`,
                    active && "text-white"
                  )}  
                >
                    <div className="flex items-center gap-x-4">
                        <Icon size={53} />
                        <p className="truncate">{label}</p>
                    </div>
                    {isOpen ? <HiChevronUp size={32} /> : <HiChevronDown size={32} />}
                </button>

                {isOpen && (
                    <div className="flex flex-col gap-y-2 mt-2 ml-10">
                        {subRoutes.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={twMerge(
                                "text-xl text-slate-400 hover:text-white transition",
                                sub.active && "text-white font-semibold"
                              )}
                            >
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
          href={href || "#"}
          className={twMerge(
            "flex flex-row h-auto items-center w-full gap-x-4 text-xl font-medium cursor-pointer hover:text-white transition text-slate-400 py-2 px-2",
            active && "text-white bg-slate-800 rounded-md"
          )}
        >
            <Icon size={53} />
            <p className="truncate">{label}</p>
        </Link>
    );
};

export default SidebarItem;