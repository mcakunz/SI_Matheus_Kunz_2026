export function MaisBadge({ count }: { count: number }) {
    if (count <= 0) return null
    return (
        <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            +{count}
        </span>
    )
}