import React from 'react'

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto text-slate-900 mt-4 min-h-50 ${className}`}>
            <table className="w-full text-left border-collapse">{children}</table>
        </div>
    )
}

export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <thead><tr className={`bg-slate-50/80 border-b border-slate-200 ${className}`}>{children}</tr></thead>
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>
}

export function TableRow({
    children,
    className = '', 
    onClick 
} : { 
    children: React.ReactNode,
    className?: string,
    onClick?: () => void
}) {
    return (
        <tr 
            onClick={onClick}
            className={`transition-colors bg-white hover:bg-slate-50/80 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </tr>
    )
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <th className={`p-3 font-semibold text-slate-600 text-sm ${className}`}>{children}</th>
}

export function TableCell({ children, colSpan, className = '' }: { children: React.ReactNode; colSpan?: number; className?: string }) {
    return <td className={`p-3 text-sm ${className}`} colSpan={colSpan}>{children}</td>
}

export function TableEmpty({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
    return (
        <tr>
            <td colSpan={colSpan} className="p-8 text-center text-slate-500">{children}</td>
        </tr>
    )
}