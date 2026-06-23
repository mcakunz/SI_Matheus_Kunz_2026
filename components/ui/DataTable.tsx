"use client"
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'

interface DataTableProps {
    columns: GridColDef[]
    data: any[]
    selectedRow?: any | null
    onRowSelect?: (row: any | null) => void
}

export function DataTable({
    columns,
    data,
    selectedRow,
    onRowSelect,
} : DataTableProps) {
    return(
        <div className='bg-slate-50 border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full h-[calc(100vh-180px)] min-h-[400px]'>
            <DataGrid
                rows={data}
                columns={columns}
                localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}

                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0},
                    },
                }}
                pageSizeOptions={[10, 25, 50]}

                rowSelectionModel={{
                    type: 'include',
                    ids: new Set(selectedRow ? [selectedRow.id] : [])
                } as GridRowSelectionModel}

                onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
                    if (!onRowSelect) return
                    const ids = newSelection.ids
                    if (ids.size === 0) {
                        onRowSelect(null)
                    } else {
                        const selectedId = Array.from(ids)[0]
                        const selectedData = data.find((row) => row.id === selectedId)
                        onRowSelect(selectedData || null)
                    }
                }}

                getCellClassName={(params) =>
                    selectedRow?.id === params.row.id ? 'cell-selected' : ''
                }
                
                disableMultipleRowSelection={true}

                sx={{
                    border: 'none',
                    '& .MuiDataGrid-main': {
                        backgroundColor: '#f8fafc', 
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f1f5f9', 
                        borderBottom: '1px solid #e2e8f0'
                    },
                    '& .MuiDataGrid-row': {
                        backgroundColor: 'transparent',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f1f5f9', 
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#f1f5f9',
                        borderTop: '1px solid #e2e8f0',
                    },
                    '& .MuiDataGrid-row.Mui-selected': {
                        backgroundColor: '#d1fae5 !important',
                    },
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                }}
            />
        </div>
    )
}