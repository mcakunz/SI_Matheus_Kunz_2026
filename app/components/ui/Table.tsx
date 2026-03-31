export function Table({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto text-black mt-4 min-h-50">
            <table className="w-full text-left border-collapse">{children}</table>
        </div>
    )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead><tr className="bg-gray-100 border-b">{children}</tr></thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
    return <tbody>{children}</tbody>
}

export function TableRow({ children }: { children: React.ReactNode }) {
    return <tr className="border-b hover:bg-gray-50">{children}</tr>
}

export function TableHead({ children }: { children: React.ReactNode }) {
    return <th className="p-3 font-semibold">{children}</th>
}

export function TableCell({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
    return <td className="p-3" colSpan={colSpan}>{children}</td>
}

export function TableEmpty({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
    return (
        <tr>
            <td colSpan={colSpan} className="p-4 text-center text-gray-500">{children}</td>
        </tr>
    )
}