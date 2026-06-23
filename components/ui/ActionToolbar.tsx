import Link from "next/link"
import { Button } from "./Button"

interface ActionToolbarProps {
    selectedRow: { ativo: boolean; id?: number } | null
    loading?: boolean
    onAddHref?: string
    onEditHref?: string
    onAdd?: () => void
    onEdit?: () => void
    onToggleStatus: () => void
    onDelete: () => void
}

export function ActionToolbar({
    selectedRow,
    loading = false,
    onAddHref,
    onEditHref,
    onAdd,
    onEdit,
    onToggleStatus,
    onDelete,
}: ActionToolbarProps) {
    const addButton = onAddHref ? (
        <Link href={onAddHref}>
            <Button>Adicionar</Button>
        </Link>
    ) : (
        <Button onClick={onAdd}>Adicionar</Button>
    )

    const editButton = onEditHref && selectedRow ? (
        <Link href={onEditHref}>
            <Button disabled={!selectedRow}>Editar</Button>
        </Link>
    ) : (
        <Button disabled={!selectedRow} onClick={onEdit}>Editar</Button>
    )

    return (
        <div className="flex items-center gap-2">
            {addButton}
            {editButton}
            <Button disabled={!selectedRow || loading} onClick={onToggleStatus}>
                {selectedRow?.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button disabled={!selectedRow || loading} onClick={onDelete}>
                Excluir
            </Button>
        </div>
    )
}
