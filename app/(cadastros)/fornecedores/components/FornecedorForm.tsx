"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarFornecedor } from "../actions"
import toast from "react-hot-toast"
import { HiPlus, HiTrash, HiStar } from "react-icons/hi"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"
import {
    FornecedorView,
    FornecedorEmail,
    FornecedorTelefone,
    CidadeSelect,
    PaisSelect,
    EstadoSelect,
    CondicaoPagamentoSelect,
    TransportadoraSelect,
} from "@/lib/types"

import { validarIE, validarRG } from "@/lib/utils/validacoes"
import { mascaraCPF, mascaraCNPJ, mascaraTelefone } from "@/lib/utils/mascaras"
import { useEndereco } from "@/lib/hooks/useEndereco"


const fornecedorEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'FISCAL', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const fornecedorTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'CELULAR', 'OUTRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const schema = z.object({
    tipo:                z.enum(['F', 'J']),
    ativo:               z.boolean(),
    fornecedor:          z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    apelido:             z.string().max(50).optional(),
    cpfCnpj:             z.string().min(11, "CPF/CNPJ inválido.").max(18),
    rgInscricaoEstadual: z.string().max(20).optional(),
    cep:                 z.string().max(9).optional(),
    endereco:            z.string().max(100).optional(),
    numero:              z.string().max(10).optional(),
    complemento:         z.string().max(50).optional(),
    bairro:              z.string().max(50).optional(),
    cidadeId:            z.string().min(1, "Selecione uma cidade."),
    condicaoPagamentoId: z.string().min(1, "Selecione uma condição de pagamento."),
    transportadoraId:    z.string().optional(),
    limiteCredito:       z.string().min(1, "Informe o limite de crédito."),
    observacoes:         z.string().max(150).optional(),
    emails:              z.array(fornecedorEmailSchema),
    telefones:           z.array(fornecedorTelefoneSchema),
}).superRefine((data, ctx) => {

    const valor = data.rgInscricaoEstadual?.trim() ?? ''
    if (valor) {
        if (data.tipo === 'F') {
            if (!validarRG(valor)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rgInscricaoEstadual'],
                    message: "RG inválido. Informe entre 7 e 9 dígitos.",
                })
            }
        } else {
            if (!validarIE(valor)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rgInscricaoEstadual'],
                    message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres.",
                })
            }
        }
    }

    const emailsPrincipais = data.emails.filter(e => e.principal).length
    if (emailsPrincipais > 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['emails'],
            message: "Apenas um e-mail pode ser marcado como principal.",
        })
    }

    const telPrincipais = data.telefones.filter(t => t.principal).length
    if (telPrincipais > 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['telefones'],
            message: "Apenas um telefone pode ser marcado como principal.",
        })
    }
})

type FormData = z.infer<typeof schema>

interface FornecedorFormProps {
    fornecedor?:        FornecedorView | null
    emailsIniciais?:    FornecedorEmail[]
    telefonesIniciais?: FornecedorTelefone[]
    listaCidades:       CidadeSelect[]
    listaEstados:       EstadoSelect[]
    listaPaises:        PaisSelect[]
    listaCondicoes:     CondicaoPagamentoSelect[]
    listaTransportadoras: TransportadoraSelect[]
}

export function FornecedorForm({
    fornecedor,
    emailsIniciais = [],
    telefonesIniciais = [],
    listaCidades,
    listaEstados,
    listaPaises,
    listaCondicoes,
    listaTransportadoras,
}: FornecedorFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            tipo:                (fornecedor?.tipo as 'F' | 'J') ?? 'J',
            ativo:               fornecedor ? fornecedor.ativo : true,
            fornecedor:          fornecedor?.fornecedor ?? '',
            apelido:             fornecedor?.apelido ?? '',
            cpfCnpj:             fornecedor?.cpfCnpj
                                     ? (fornecedor.cpfCnpj.replace(/\D/g,'').length === 11
                                         ? mascaraCPF(fornecedor.cpfCnpj)
                                         : mascaraCNPJ(fornecedor.cpfCnpj))
                                     : '',
            rgInscricaoEstadual: fornecedor?.rgInscricaoEstadual ?? '',
            cep:                 fornecedor?.cep ?? '',
            endereco:            fornecedor?.endereco ?? '',
            numero:              fornecedor?.numero ?? '',
            complemento:         fornecedor?.complemento ?? '',
            bairro:              fornecedor?.bairro ?? '',
            cidadeId:            fornecedor?.cidadeId?.toString() ?? '',
            condicaoPagamentoId: fornecedor?.condicaoPagamentoId?.toString() ?? '',
            transportadoraId:    fornecedor?.transportadoraId?.toString() ?? '',
            limiteCredito:       fornecedor?.limiteCredito?.toString() ?? '0',
            observacoes:         fornecedor?.observacoes ?? '',
            emails: emailsIniciais.map(e => ({
                id:        e.id,
                email:     e.email,
                tipo:      e.tipo,
                principal: e.principal,
                ativo:     e.ativo,
            })),
            telefones: telefonesIniciais.map(t => ({
                id:        t.id,
                telefone:  mascaraTelefone(t.telefone),
                tipo:      t.tipo,
                principal: t.principal,
                ativo:     t.ativo,
            })),
        },
    })

    const cidadeInicial = listaCidades.find(c => c.id === fornecedor?.cidadeId)
    const estadoInicial = listaEstados.find(e => e.id === cidadeInicial?.estadoId)

    const {
        paisSelecionado, setPaisSelecionado,
        estadoSelecionado,
        handlePaisChange, handleEstadoChange,
    } = useEndereco(setValue, estadoInicial?.paisId ?? '', estadoInicial?.id ?? '')

    const estadosFiltrados = paisSelecionado
        ? listaEstados.filter(e => e.paisId === paisSelecionado)
        : listaEstados

    const cidadesFiltradas = estadoSelecionado
        ? listaCidades.filter(c => c.estadoId === estadoSelecionado)
        : listaCidades

    const tipoPessoa = watch("tipo")
    const isPF = tipoPessoa === "F"

    const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
        control,
        name: "emails",
    })
    const { fields: telefoneFields, append: appendTelefone, remove: removeTelefone } = useFieldArray({
        control,
        name: "telefones",
    })

    const marcarEmailPrincipal = (index: number) => {
        emailFields.forEach((_, i) => setValue(`emails.${i}.principal`, i === index))
    }
    const marcarTelefonePrincipal = (index: number) => {
        telefoneFields.forEach((_, i) => setValue(`telefones.${i}.principal`, i === index))
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (fornecedor?.id) formData.append('id', String(fornecedor.id))

        const { emails, telefones, ...scalar } = data
        const payload = {
            ...scalar,
            cpfCnpj:  data.cpfCnpj.replace(/\D/g, ''),
            cep:      data.cep ? data.cep.replace(/\D/g, '') : '',
            telefones: data.telefones.map(t => ({
                ...t,
                telefone: t.telefone.replace(/\D/g, ''),
            })),
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && key !== 'telefones') {
                formData.append(key, String(value))
            }
        })

        formData.append('emails',    JSON.stringify(emails))
        formData.append('telefones', JSON.stringify(payload.telefones))

        try {
            await salvarFornecedor(formData)
            toast.success(fornecedor ? "Fornecedor atualizado com sucesso!" : "Fornecedor cadastrado com sucesso!")
            router.push("/fornecedores")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const Erro = ({ campo }: { campo: keyof FormData }) =>
        errors[campo] ? <p className="text-xs text-red-500 mt-1">{(errors[campo] as any)?.message}</p> : null

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-slate-900">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Tipo de Pessoa</FormLabel>
                    <FormSelect {...register('tipo')}>
                        <option value="J">Jurídica</option>
                        <option value="F">Física</option>
                    </FormSelect>
                </div>
                <div>
                    <FormLabel>Status</FormLabel>
                    <div className="mt-1 h-10 flex items-center">
                        <FormSwitch {...register('ativo')} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>{isPF ? "Nome Completo" : "Razão Social"}</FormLabel>
                    <FormInput
                        {...register('fornecedor')}
                        placeholder={isPF ? "Digite o nome completo" : "Digite a razão social"}
                    />
                    <Erro campo="fornecedor" />
                </div>
                <div>
                    <FormLabel>{isPF ? "Apelido" : "Nome Fantasia"}</FormLabel>
                    <FormInput
                        {...register('apelido')}
                        placeholder={isPF ? "Apelido" : "Nome fantasia"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
            </div>

            <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Endereço</p>

                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_120px] gap-4 md:gap-6 mb-4">
                    <div>
                        <FormLabel>CEP</FormLabel>
                        <FormInput
                            {...register('cep', {
                                onChange: (e) => {
                                    let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                                    if (v.length > 5) v = `${v.slice(0,5)}-${v.slice(5)}`
                                    e.target.value = v
                                }
                            })}
                            maxLength={9}
                            placeholder="00000-000"
                            inputMode="numeric"
                        />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                    <div>
                        <FormLabel>Complemento</FormLabel>
                        <FormInput {...register('complemento')} placeholder="Apto, bloco, sala..." />
                    </div>
                    <div>
                        <FormLabel>Bairro</FormLabel>
                        <FormInput {...register('bairro')} placeholder="Bairro" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                        <FormLabel required>País</FormLabel>
                        <FormSelect value={paisSelecionado} onChange={handlePaisChange}>
                            <option value="">Selecione o país...</option>
                            {listaPaises.map(p => (
                                <option key={p.id} value={p.id}>{p.pais}</option>
                            ))}
                        </FormSelect>
                    </div>
                    <div>
                        <FormLabel required>Estado</FormLabel>
                        <FormSelect
                            value={estadoSelecionado}
                            onChange={handleEstadoChange}
                            disabled={!paisSelecionado}
                        >
                            <option value="">Selecione o estado...</option>
                            {estadosFiltrados.map(e => (
                                <option key={e.id} value={e.id}>{e.estado}</option>
                            ))}
                        </FormSelect>
                    </div>
                    <div>
                        <FormLabel required>Cidade</FormLabel>
                        <FormSelect
                            {...register('cidadeId')}
                            disabled={!estadoSelecionado}
                        >
                            <option value="">Selecione a cidade...</option>
                            {cidadesFiltradas.map(c => (
                                <option key={c.id} value={c.id}>{c.cidade}</option>
                            ))}
                        </FormSelect>
                        <Erro campo="cidadeId" />
                    </div>
                </div>
            </div>

            <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Financeiro</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                        <FormLabel required>Condição de Pagamento</FormLabel>
                        <FormSelect {...register('condicaoPagamentoId')}>
                            <option value="">Selecione uma condição...</option>
                            {listaCondicoes.map(c => (
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
                    <div>
                        <FormLabel>Transportadora</FormLabel>
                        <FormSelect {...register('transportadoraId')}>
                            <option value="">Nenhuma</option>
                            {listaTransportadoras.map(t => (
                                <option key={t.id} value={t.id}>{t.razaoSocial}</option>
                            ))}
                        </FormSelect>
                    </div>
                </div>
            </div>

            <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">E-mails</p>
                    <button
                        type="button"
                        onClick={() => appendEmail({ email: '', tipo: 'COMERCIAL', principal: emailFields.length === 0, ativo: true })}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <HiPlus size={14} /> Adicionar e-mail
                    </button>
                </div>

                {(errors.emails as any)?.message && (
                    <p className="text-xs text-red-500 mb-2">{(errors.emails as any).message}</p>
                )}

                {emailFields.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Nenhum e-mail cadastrado.</p>
                )}

                <div className="flex flex-col gap-3">
                    {emailFields.map((field, index) => {
                        const isPrincipal = watch(`emails.${index}.principal`)
                        const isAtivo     = watch(`emails.${index}.ativo`)

                        return (
                            <div key={field.id} className={`grid grid-cols-1 md:grid-cols-[1fr_160px_auto_auto_auto] gap-2 items-end p-3 rounded-lg border ${isAtivo ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                                <div>
                                    {index === 0 && <FormLabel>E-mail</FormLabel>}
                                    <FormInput
                                        {...register(`emails.${index}.email`)}
                                        type="email"
                                        placeholder="email@exemplo.com"
                                    />
                                    {errors.emails?.[index]?.email && (
                                        <p className="text-xs text-red-500 mt-1">{errors.emails[index]?.email?.message}</p>
                                    )}
                                </div>
                                <div>
                                    {index === 0 && <FormLabel>Tipo</FormLabel>}
                                    <FormSelect {...register(`emails.${index}.tipo`)}>
                                        <option value="COMERCIAL">Comercial</option>
                                        <option value="FINANCEIRO">Financeiro</option>
                                        <option value="FISCAL">Fiscal</option>
                                        <option value="OUTRO">Outro</option>
                                    </FormSelect>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500">Principal</span>}
                                    <button
                                        type="button"
                                        onClick={() => marcarEmailPrincipal(index)}
                                        title="Marcar como principal"
                                        className={`p-1.5 rounded-md transition-colors ${isPrincipal ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'}`}
                                    >
                                        <HiStar size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500">Ativo</span>}
                                    <div className="h-8 flex items-center">
                                        <FormSwitch {...register(`emails.${index}.ativo`)} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500 invisible">X</span>}
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(index)}
                                        title="Remover e-mail"
                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <HiTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Telefones</p>
                    <button
                        type="button"
                        onClick={() => appendTelefone({ telefone: '', tipo: 'COMERCIAL', principal: telefoneFields.length === 0, ativo: true })}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <HiPlus size={14} /> Adicionar telefone
                    </button>
                </div>

                {(errors.telefones as any)?.message && (
                    <p className="text-xs text-red-500 mb-2">{(errors.telefones as any).message}</p>
                )}

                {telefoneFields.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Nenhum telefone cadastrado.</p>
                )}

                <div className="flex flex-col gap-3">
                    {telefoneFields.map((field, index) => {
                        const isPrincipal = watch(`telefones.${index}.principal`)
                        const isAtivo     = watch(`telefones.${index}.ativo`)

                        return (
                            <div key={field.id} className={`grid grid-cols-1 md:grid-cols-[1fr_160px_auto_auto_auto] gap-2 items-end p-3 rounded-lg border ${isAtivo ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                                <div>
                                    {index === 0 && <FormLabel>Telefone</FormLabel>}
                                    <FormInput
                                        {...register(`telefones.${index}.telefone`, {
                                            onChange: (e) => {
                                                e.target.value = mascaraTelefone(e.target.value)
                                            }
                                        })}
                                        placeholder="(00) 00000-0000"
                                        maxLength={16}
                                        inputMode="numeric"
                                    />
                                    {errors.telefones?.[index]?.telefone && (
                                        <p className="text-xs text-red-500 mt-1">{errors.telefones[index]?.telefone?.message}</p>
                                    )}
                                </div>
                                <div>
                                    {index === 0 && <FormLabel>Tipo</FormLabel>}
                                    <FormSelect {...register(`telefones.${index}.tipo`)}>
                                        <option value="COMERCIAL">Comercial</option>
                                        <option value="FINANCEIRO">Financeiro</option>
                                        <option value="CELULAR">Celular</option>
                                        <option value="OUTRO">Outro</option>
                                    </FormSelect>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500">Principal</span>}
                                    <button
                                        type="button"
                                        onClick={() => marcarTelefonePrincipal(index)}
                                        title="Marcar como principal"
                                        className={`p-1.5 rounded-md transition-colors ${isPrincipal ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'}`}
                                    >
                                        <HiStar size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500">Ativo</span>}
                                    <div className="h-8 flex items-center">
                                        <FormSwitch {...register(`telefones.${index}.ativo`)} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {index === 0 && <span className="text-xs text-slate-500 invisible">X</span>}
                                    <button
                                        type="button"
                                        onClick={() => removeTelefone(index)}
                                        title="Remover telefone"
                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <HiTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <FormLabel>Observações</FormLabel>
                <FormInput {...register('observacoes')} placeholder="Observações adicionais" maxLength={150} />
            </div>

            {fornecedor && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(fornecedor.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {fornecedor.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(fornecedor.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : fornecedor ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/fornecedores")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
