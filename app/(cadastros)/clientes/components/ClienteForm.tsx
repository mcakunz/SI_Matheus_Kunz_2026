"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarCliente } from "../actions"
import toast from "react-hot-toast"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { ClienteCompleto, CidadeSelect, PaisSelect, CondicaoPagamentoSelect } from "@/lib/types"


const schema = z.object({
    tipo:                   z.enum(['F', 'J']),
    ativo:                  z.boolean(),
    cliente:                z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(150),
    apelido:                z.string().max(60).optional(),
    cpf_cnpj:               z.string().min(11, "CPF/CNPJ inválido.").max(14),
    rg_inscricao_estadual:  z.string().max(20).optional(),
    data_nascimento:        z.string().optional(),
    sexo:                   z.enum(['M', 'F', 'O', '']).optional(),
    email:                  z.string().email("E-mail inválido.").optional().or(z.literal('')),
    telefone:               z.string().max(20).optional(),
    observacao:             z.string().max(255).optional(),
    endereco:               z.string().max(200).optional(),
    numero:                 z.string().max(10).optional(),
    complemento:            z.string().max(100).optional(),
    bairro:                 z.string().max(50).optional(),
    cep:                    z.string().max(9).optional(),
    cidade_id:              z.string().min(1, "Selecione uma cidade."),
    pais_id:                z.string().min(1, "Selecione um país."),
    //condicao_pagamento_id:  z.string().min(1, "Selecione uma condição de pagamento."),
    condicao_pagamento_id: z.string().optional(),
    limite_credito:         z.string().min(1, "Informe o limite de crédito."),
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
            tipo:                   (cliente?.tipo as 'F' | 'J') ?? 'F',
            ativo:                  cliente ? cliente.ativo : true, 
            cliente:                cliente?.cliente ?? '',
            apelido:                cliente?.apelido ?? '',
            cpf_cnpj:               cliente?.cpf_cnpj ?? '',
            rg_inscricao_estadual:  cliente?.rg_inscricao_estadual ?? '',
            data_nascimento:        cliente?.data_nascimento ?? '',
            sexo:                   (cliente?.sexo as 'M'|'F'|'O'|'') ?? '',
            email:                  cliente?.email ?? '',
            telefone:               cliente?.telefone ?? '',
            observacao:             cliente?.observacao ?? '',
            endereco:               cliente?.endereco ?? '',
            numero:                 cliente?.numero ?? '',
            complemento:            cliente?.complemento ?? '',
            bairro:                 cliente?.bairro ?? '',
            cep:                    cliente?.cep ?? '',
            cidade_id:              cliente?.cidade_id?.toString() ?? '',
            pais_id:                cliente?.pais_id?.toString() ?? '',
            condicao_pagamento_id:  cliente?.condicao_pagamento_id?.toString() ?? '',
            limite_credito:         cliente?.limite_credito?.toString() ?? '0',
        }
    })

    const tipoPessoa = watch("tipo")
    const isPF = tipoPessoa === "F"

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (cliente?.id) formData.append('id', String(cliente.id))

        Object.entries(data).forEach(([key, value]) => {
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="geral" className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                        <FormLabel required>Tipo de Pessoa</FormLabel>
                        <FormSelect {...register('tipo')}>
                            <option value="F">Física</option>
                            <option value="J">Jurídica</option>
                        </FormSelect>
                    </div>
                <div>
                    <FormLabel>Status</FormLabel>
                    <FormSelect {...register('ativo')}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </FormSelect>
                </div>
                </div>

                <div className="mb-4 md:mb-6">
                    <FormLabel required>{isPF ? "Nome Completo" : "Razão Social"}</FormLabel>
                    <FormInput 
                        {...register('cliente')}
                        placeholder={isPF ? "Digite o nome completo" : "Digite a razão social"}
                    />
                    <Erro campo="cliente" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                        <FormLabel>{isPF ? "Apelido" : "Nome Fantasia"}</FormLabel>
                        <FormInput 
                            {...register('apelido')} 
                            placeholder={isPF ? "Apelido" : "Nome fantasia"} 
                        />
                    </div>
                    <div>
                        <FormLabel required>{isPF ? "CPF" : "CNPJ"}</FormLabel>
                        <FormInput 
                            {...register('cpf_cnpj')}
                            maxLength={isPF ? 11 : 14}
                            placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                            inputMode="numeric"
                            onKeyDown={(e) => {
                                const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown']
                                if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
                                    e.preventDefault()
                                }
                            }}
                            onPaste={(e) => {
                                const text = e.clipboardData.getData('text')
                                if (!/^\d+$/.test(text)) e.preventDefault()
                            }}
                        />
                        <Erro campo="cpf_cnpj" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                        <FormLabel>{isPF ? "RG" : "Inscrição Estadual"}</FormLabel>
                        <FormInput 
                            {...register('rg_inscricao_estadual')}
                            placeholder={isPF ? "Número do RG" : "Número da I.E."} 
                        />
                    </div>
                    <div>
                        <FormLabel>{isPF ? "Data de Nascimento" : "Data de Fundação"}</FormLabel>
                        <FormInput type="date" {...register('data_nascimento')} />
                    </div>
                </div>

                {isPF && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                        <div>
                            <FormLabel>Sexo</FormLabel>
                            <FormSelect {...register('sexo')}>
                                <option value="">Não informado</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="O">Outro</option>
                            </FormSelect>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                        <FormLabel>E-mail</FormLabel>
                        <FormInput type="email" {...register('email')} placeholder="email@exemplo.com" />
                        <Erro campo="email" />
                    </div>
                    <div>
                        <FormLabel>Telefone</FormLabel>
                        <FormInput {...register('telefone')} maxLength={20} placeholder="(00) 00000-0000" />
                    </div>
                </div>

                <div className="mb-4 md:mb-6">
                    <FormLabel>Observações</FormLabel>
                    <FormInput {...register('observacao')} placeholder="Observações adicionais" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_120px] gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                    <FormLabel>CEP</FormLabel>
                    <FormInput 
                        {...register('cep', {
                            onChange: (e) => {
                                let value = e.target.value;
                                value = value.replace(/^(\d{5})(\d)/, "$1-$2");
                                e.target.value = value;
                            }
                        })} 
                        maxLength={9} 
                        placeholder="00000-000" 
                        inputMode="numeric"
                        onKeyDown={(e) => {
                            const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight'];
                            if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
                                e.preventDefault();
                            }
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                        <FormLabel>Complemento</FormLabel>
                        <FormInput {...register('complemento')} placeholder="Apto, bloco, sala..." />
                    </div>
                    <div>
                        <FormLabel>Bairro</FormLabel>
                        <FormInput {...register('bairro')} placeholder="Bairro" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <FormLabel required>Cidade</FormLabel>
                        <FormSelect {...register('cidade_id')}>
                            <option value="">Selecione a cidade...</option>
                            {listaCidades.map((c) => (
                                <option key={c.id} value={c.id}>{c.cidade}</option>
                            ))}
                        </FormSelect>
                        <Erro campo="cidade_id" />
                    </div>
                    <div>
                        <FormLabel required>País</FormLabel>
                        <FormSelect {...register('pais_id')}>
                            <option value="">Selecione o país...</option>
                            {listaPaises.map((p) => (
                                <option key={p.id} value={p.id}>{p.pais}</option>
                            ))}
                        </FormSelect>
                        <Erro campo="pais_id" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 mt-6">
                    <div>
                        <FormLabel required>Condição de Pagamento</FormLabel>
                        <FormSelect {...register('condicao_pagamento_id')}>
                            <option value="">Selecione uma condição...</option>
                            {listaCondicoes.map((c) => (
                                <option key={c.id} value={c.id}>{c.condicao_pagamento}</option>
                            ))}
                        </FormSelect>
                        <Erro campo="condicao_pagamento_id" />
                    </div>

                    <div>
                        <FormLabel required>Limite de Crédito (R$)</FormLabel>
                        <FormInput type="number" {...register('limite_credito')} min={0} step="0.01" />
                        <Erro campo="limite_credito" />
                    </div>
                </div>

                {cliente && (
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                        <span>Cadastrado: {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}</span>
                        {cliente.data_alteracao && (
                            <span>
                                Alterado:{" "}
                                {new Date(cliente.data_alteracao).toLocaleDateString('pt-BR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </span>
                        )}
                    </div>
                )}
            </Tabs>

            <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-200">
                <button
                    type="button"
                    onClick={() => router.push("/clientes")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : "Salvar Cliente"}
                </Button>
            </div>
        </form>
    )
}
