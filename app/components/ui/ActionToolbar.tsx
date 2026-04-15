import { boolean } from "zod"
import { Button } from "./Button"

interface ActionToolbarProps {
    selectedRow: { ativo: boolean } | null
    loading?: boolean
    onAdd: () => void
    onEdit: () => void
    onToggleStatus: () => void
    onDelete: () => void
}

export function ActionToolbar({
    selectedRow,
    loading = false,
    onAdd,
    onEdit, 
    onToggleStatus,
    onDelete,
}: ActionToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            <Button onClick={onAdd}>
                Adicionar
            </Button>
            <Button disabled={!selectedRow} onClick={onEdit}>
                Editar
            </Button>
            <Button disabled={!selectedRow || loading} onClick={onToggleStatus}>
                {selectedRow?.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button disabled={!selectedRow || loading} onClick={onDelete}>
                Excluir
            </Button>
        </div>
    )
}