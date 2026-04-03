"use client"

import { useState } from "react"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty } from '@/app/components/ui/Table'
import { Modal } from "@/app/components/ui/Modal"
import { Button } from "@/app/components/ui/Button"
import { alternarStatusPais, salvarPais } from "./actions"

export default function PaisesClientTable({
    paises,
}: { paises: any[] }) {
    const [linhaSelecionada, setLinhaSelecionada] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        try {
            await salvarPais(formData)
            setIsModalOpen(false)
            setLinhaSelecionada(null)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAlternarStatus = async () => {
        if (!linhaSelecionada) return
        setLoading(true)

        try {
            await alternarStatusPais(linhaSelecionada.id, linhaSelecionada.ativo)
            setLinhaSelecionada(null)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4"> 
            <div className="flex items-center gap-2">
                <Button onClick={() => { setLinhaSelecionada(null); setIsModalOpen(true) }}>
                    Adicionar
                </Button>

                <Button disabled={!linhaSelecionada} onClick={() => setIsModalOpen(true)}>
                    Editar
                </Button>

                <Button disabled={!linhaSelecionada || loading} onClick={handleAlternarStatus}>
                    {linhaSelecionada?.ativo ? 'Desativar' : 'Ativar'}
                </Button>

                <Button disabled={!linhaSelecionada}>
                    Excluir
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableHead>ID</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Sigla</TableHead>
                    <TableHead>Nacionalidade</TableHead>
                    <TableHead>Status</TableHead>
                </TableHeader>
                <TableBody>
                    {paises.map((pais) => (
                        <TableRow
                            key={pais.id}
                            onClick={() => setLinhaSelecionada(linhaSelecionada?.id === pais.id ? null : pais)}
                            className={linhaSelecionada?.id === pais.id ? 'bg-emerald-100!' : ''}
                        >
                            <TableCell className="text-slate-400 font-mono text-xs">{pais.id}</TableCell>
                            <TableCell className="font-medium text-slate-900">{pais.pais}</TableCell>
                            <TableCell className="text-slate-500">{pais.codigo || '-'}</TableCell>
                            <TableCell className="text-slate-500 font-medium">{pais.sigla || '-'}</TableCell>
                            <TableCell className="text-slate-900">{pais.nacionalidade || '-'}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    pais.ativo 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {pais.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                    {paises.length === 0 && <TableEmpty colSpan={6}>Nenhum país encontrado.</TableEmpty>}
                </TableBody>
            </Table>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={linhaSelecionada ? "Editar País" : "Novo País"}
            >
                <form onSubmit={handleSalvar} className="flex flex-col gap-4 text-black">
                    <input type="hidden" name="id" value={linhaSelecionada?.id || ''} />

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do País <span className="text-red-500">*</span></label>
                        <input name="pais" required defaultValue={linhaSelecionada?.pais || ""} className="w-full p-2 border rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Código</label>
                            <input name="codigo" maxLength={5} defaultValue={linhaSelecionada?.codigo || ""} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sigla</label>
                            <input name="sigla" maxLength={5} defaultValue={linhaSelecionada?.sigla || ""} className="w-full p-2 border rounded uppercase" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nacionalidade</label>
                        <input name="nacionalidade" defaultValue={linhaSelecionada?.nacionalidade || ""} className="w-full p-2 border rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="ativo" defaultValue={linhaSelecionada ? (linhaSelecionada.ativo ? 'true' : 'false') : 'true'} className="w-full p-2 border rounded bg-white">
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="mt-4 w-full h-10"
                    >
                        {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </form>
            </Modal>
        </div>
    )
}