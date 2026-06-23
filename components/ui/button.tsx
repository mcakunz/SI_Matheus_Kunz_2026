import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

export function Button({
    children,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "bg-slate-800 text-white hover:bg-slate-700",
                "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm",
                className 
            )}
        >
            {children}
        </button>
    )
}