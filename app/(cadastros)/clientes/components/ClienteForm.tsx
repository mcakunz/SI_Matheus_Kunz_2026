"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarCliente } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { ClienteCompleto, CidadeSelect, PaisSelect, CondicaoPagamentoSelect } from "@/lib/types"


function mascaraCPF(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function mascaraCNPJ(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 14)
    if (d.length <= 2)  return d
    if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`
    if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
    if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function mascaraTelefone(valor: string): string {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2)  return d.length ? `(${d}` : ''
    if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}


const schema = z.object({
    tipo:                z.enum(['F', 'J']),
    ativo:               z.boolean(),
    cliente:             z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    apelido:             z.string().max(50).optional(),
    cpfCnpj:             z.string().min(11, "CPF/CNPJ inválido.").max(18),
    rgInscricaoEstadual: z.string().max(20).optional(),
    dataNascimento:      z.string().optional(),
    sexo:                z.enum(['M', 'F', 'O', '']).optional(),
    email:               z.string().email("E-mail inválido.").optional().or(z.literal('')),
    telefone:            z.string().max(16).optional(),
    observacao:          z.string().max(150).optional(),
    endereco:            z.string().max(100).optional(),
    numero:              z.string().max(10).optional(),
    complemento:         z.string().max(50).optional(),
    bairro:              z.string().max(50).optional(),
    cep:                 z.string().max(9).optional(),
    cidadeId:            z.string().min(1, "Selecione uma cidade."),
    paisId:              z.string().min(1, "Selecione um país."),
    condicaoPagamentoId: z.string().optional(),
    limiteCredito:       z.string().min(1, "Informe o limite de crédito."),
}).superRefine((data, ctx) => {
    const valor = data.rgInscricaoEstadual?.trim() ?? ''
    if (!valor) return

    if (data.tipo === 'F') {
        const digitos = valor.replace(/[^\dXx]/g, '')
        if (!/^\d{6,8}[\dXx]$/.test(digitos)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgInscricaoEstadual'],
                message: "RG inválido. Informe entre 7 e 9 dígitos.",
            })
        }
    } else {
        const apenasAlfanum = valor.replace(/[\s.\-\/]/g, '')
        if (apenasAlfanum.length < 8 || apenasAlfanum.length > 14) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rgInscricaoEstadual'],
                message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres.",
            })
        }
    }
})

type FormData = z.infer<typeof schema>

interface ClienteFormProps {
    cliente?: ClienteCompleto | null
    listaCidades: CidadeSelect[]
    listaPaises: PaisSelect[]
    listaCondicoes: CondicaoPagamentoSelect[]
}

export function ClienteForm({ cliente, listaCidades, listaPaises, listaCondicoes }: ClienteFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            tipo:                (cliente?.tipo as 'F' | 'J') ?? 'F',
            ativo:               cliente ? cliente.ativo : true,
            cliente:             cliente?.cliente ?? '',
            apelido:             cliente?.apelido ?? '',
            cpfCnpj:             cliente?.cpfCnpj
                                     ? (cliente.cpfCnpj.replace(/\D/g,'').length === 11
                                         ? mascaraCPF(cliente.cpfCnpj)
                                         : mascaraCNPJ(cliente.cpfCnpj))
                                     : '',
            rgInscricaoEstadual: cliente?.rgInscricaoEstadual ?? '',
            dataNascimento:      cliente?.dataNascimento ?? '',
            sexo:                (cliente?.sexo as 'M' | 'F' | 'O' | '') ?? '',
            email:               cliente?.email ?? '',
            telefone:            cliente?.telefone ? mascaraTelefone(cliente.telefone) : '',
            observacao:          cliente?.observacao ?? '',
            endereco:            cliente?.endereco ?? '',
            numero:              cliente?.numero ?? '',
            complemento:         cliente?.complemento ?? '',
            bairro:              cliente?.bairro ?? '',
            cep:                 cliente?.cep ?? '',
            cidadeId:            cliente?.cidadeId?.toString() ?? '',
            paisId:              cliente?.paisId?.toString() ?? '',
            condicaoPagamentoId: cliente?.condicaoPagamentoId?.toString() ?? '',
            limiteCredito:       cliente?.limiteCredito?.toString() ?? '0',
        }
    })

    const tipoPessoa = watch("tipo")
    const isPF = tipoPessoa === "F"

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (cliente?.id) formData.append('id', String(cliente.id))

        const payload = {
            ...data,
            telefone: data.telefone ? data.telefone.replace(/\D/g, '') : data.telefone,
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value))
            }
        })

        try {
            await salvarCliente(formData)
            toast.success(cliente ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!")
            router.push("/clientes")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{errors[campo]?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Tipo de Pessoa</FormLabel>
                    <FormSelect {...register('tipo')}>
                        <option value="F">Física</option>
                        <option value="J">Jurídica</option>
                    </FormSelect>
                </div>
                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel required>{isPF ? "Cliente" : "Razão Social"}</FormLabel>
                    <FormInput
                        {...register('cliente')}
                        placeholder={isPF ? "Digite o nome completo" : "Digite a razão social"}
                    />
                    <Erro campo="cliente" />
                </div>
                <div>
                    <FormLabel>{isPF ? "Apelido" : "Nome Fantasia"}</FormLabel>
                    <FormInput
                        {...register('apelido')}
                        placeholder={isPF ? "Apelido" : "Nome fantasia"}
                    />
                </div>
                {isPF ? (
                    <div>
                        <FormLabel>Sexo</FormLabel>
                        <FormSelect {...register('sexo')}>
                            <option value="">Não informado</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </FormSelect>
                    </div>
                ) : <div />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_120px] gap-4 md:gap-6">
                <div>
                    <FormLabel>CEP</FormLabel>
                    <FormInput
                        {...register('cep', {
                            onChange: (e) => {
                                let v = e.target.value
                                v = v.replace(/^(\d{5})(\d)/, '$1-$2')
                                e.target.value = v
                            }
                        })}
                        maxLength={9}
                        placeholder="00000-000"
                        inputMode="numeric"
                        onKeyDown={(e) => {
                            const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight']
                            if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                        }}
                    />
                    <Erro campo="cep" />
                </div>
                <div>
                    <FormLabel>Logradouro</FormLabel>
                    <FormInput {...register('endereco')} placeholder="Rua, avenida, alameda..." />
                </div>
                <div>
                    <FormLabel>Número</FormLabel>
                    <FormInput {...register('numero')} maxLength={10} placeholder="Nº" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Complemento</FormLabel>
                    <FormInput {...register('complemento')} placeholder="Apto, bloco, sala..." />
                </div>
                <div>
                    <FormLabel>Bairro</FormLabel>
                    <FormInput {...register('bairro')} placeholder="Bairro" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Cidade</FormLabel>
                    <FormSelect {...register('cidadeId')}>
                        <option value="">Selecione a cidade...</option>
                        {listaCidades.map((c) => (
                            <option key={c.id} value={c.id}>{c.cidade}</option>
                        ))}
                    </FormSelect>
                    <Erro campo="cidadeId" />
                </div>
                <div>
                    <FormLabel required>País</FormLabel>
                    <FormSelect {...register('paisId')}>
                        <option value="">Selecione o país...</option>
                        {listaPaises.map((p) => (
                            <option key={p.id} value={p.id}>{p.pais}</option>
                        ))}
                    </FormSelect>
                    <Erro campo="paisId" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel>Telefone</FormLabel>
                    <FormInput
                        {...register('telefone', {
                            onChange: (e) => {
                                e.target.value = mascaraTelefone(e.target.value)
                            }
                        })}
                        maxLength={16}
                        placeholder="(00) 00000-0000"
                        inputMode="numeric"
                    />
                </div>
                <div>
                    <FormLabel>E-mail</FormLabel>
                    <FormInput type="email" {...register('email')} placeholder="email@exemplo.com" />
                    <Erro campo="email" />
                </div>
                <div />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel required>{isPF ? "CPF" : "CNPJ"}</FormLabel>
                    <FormInput
                        {...register('cpfCnpj', {
                            onChange: (e) => {
                                e.target.value = isPF
                                    ? mascaraCPF(e.target.value)
                                    : mascaraCNPJ(e.target.value)
                            }
                        })}
                        maxLength={isPF ? 14 : 18}
                        placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                        inputMode="numeric"
                    />
                    <Erro campo="cpfCnpj" />
                </div>
                <div>
                    <FormLabel>{isPF ? "RG" : "Inscrição Estadual"}</FormLabel>
                    <FormInput
                        {...register('rgInscricaoEstadual')}
                        placeholder={isPF ? "Número do RG" : "Número da I.E."}
                        maxLength={isPF ? 9 : 20}
                    />
                    <Erro campo="rgInscricaoEstadual" />
                </div>
                <div>
                    <FormLabel>{isPF ? "Data de Nascimento" : "Data de Fundação"}</FormLabel>
                    <FormInput type="date" {...register('dataNascimento')} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Condição de Pagamento</FormLabel>
                    <FormSelect {...register('condicaoPagamentoId')}>
                        <option value="">Selecione uma condição...</option>
                        {listaCondicoes.map((c) => (
                            <option key={c.id} value={c.id}>{c.condicaoPagamento}</option>
                        ))}
                    </FormSelect>
                    <Erro campo="condicaoPagamentoId" />
                </div>
                <div>
                    <FormLabel required>Limite de Crédito (R$)</FormLabel>
                    <FormInput type="number" {...register('limiteCredito')} min={0} step="0.01" />
                    <Erro campo="limiteCredito" />
                </div>
            </div>

            <div>
                <FormLabel>Observações</FormLabel>
                <FormInput {...register('observacao')} placeholder="Observações adicionais" />
            </div>

            {cliente && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {cliente.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(cliente.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : cliente ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/clientes")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}