interface StatusBadgeProps {
    ativo: boolean
}

export function StatusBadge({ ativo }: StatusBadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            ativo
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
            {ativo ? 'Ativo' : 'Inativo'}
        </span>
    )
}