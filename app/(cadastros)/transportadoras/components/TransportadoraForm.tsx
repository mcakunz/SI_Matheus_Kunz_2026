"use client"

import { useCallback, useState }                      from "react"
import { useRouter }                                  from "next/navigation"
import { useForm, useFieldArray, Controller }         from "react-hook-form"
import { zodResolver }                                from "@hookform/resolvers/zod"
import { z }                                          from "zod"
import { salvarTransportadora }                       from "../actions"
import toast                                          from "react-hot-toast"

import { Button }          from "@/components/ui/Button"
import { FormInput }       from "@/components/ui/FormInput"
import { FormLabel }       from "@/components/ui/FormLabel"
import { FormSelect }      from "@/components/ui/FormSelect"
import { FormSwitch }      from "@/components/ui/FormSwitch"
import { EmailList }       from "@/app/components/ui/EmailList"
import { TelefoneList }    from "@/app/components/ui/TelefoneList"
import { VeiculoList }     from "@/app/components/ui/VeiculoList"
import { PaisLookup }      from "@/app/components/ui/PaisLookup"
import { EstadoLookup }    from "@/app/components/ui/EstadoLookup"
import { CidadeLookup }    from "@/app/components/ui/CidadeLookup"
import { CondicaoPagamentoLookup } from "@/app/components/ui/CondicaoPagamentoLookup"

import {
    TransportadoraView,
    TransportadoraEmail,
    TransportadoraTelefone,
    CidadeSelect,
    PaisSelect,
    EstadoSelect,
    CondicaoPagamentoSelect,
    VeiculoSelect,
} from "@/lib/types"

import { validarIE, validarRG }                             from "@/lib/utils/validacoes"
import { mascaraCPF, mascaraCNPJ, mascaraTelefone }         from "@/lib/utils/mascaras"
import { useEndereco }                                      from "@/lib/hooks/useEndereco"
import { TIPOS_EMAIL_TRANSPORTADORA, TIPOS_TELEFONE_TRANSPORTADORA } from "@/lib/TiposContato"
import { useCondicaoPagamentoCadastrada }                   from "@/lib/hooks/useCondicaoPagamentoCadastrado"
import { useVeiculoCadastrado } from "@/lib/hooks/useVeiculoCadastrado"
import { getValueOptions } from "@mui/x-data-grid/internals"


const transportadoraEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO', 'FISCAL']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const transportadoraTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['COMERCIAL', 'FINANCEIRO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const transportadoraVeiculoSchema = z.object({
    veiculoId: z.string().min(1, "Selecione um veículo."),
})

const schema = z.object({
    tipo:                  z.enum(['F', 'J']),
    ativo:                 z.boolean(),
    razaoSocial:           z.string().min(2, "A razão social deve ter no mínimo 2 caracteres.").max(100),
    nomeFantasiaApelido:   z.string().max(80).optional(),
    cnpj:                  z.string().min(11, "CPF/CNPJ inválido.").max(18),
    rgIe:                  z.string().max(20).optional(),
    cep:                   z.string().max(9).optional(),
    endereco:              z.string().max(100).optional(),
    numero:                z.string().max(10).optional(),
    complemento:           z.string().max(50).optional(),
    bairro:                z.string().max(50).optional(),
    cidadeId:              z.string().min(1, "Selecione uma cidade."),
    condicaoPagamentoId:   z.string().min(1, "Selecione uma condição de pagamento."),
    limiteCredito:         z.string().min(1, "Informe o limite de crédito."),
    observacoes:           z.string().max(150).optional(),
    emails:                z.array(transportadoraEmailSchema),
    telefones:             z.array(transportadoraTelefoneSchema),
    veiculos:              z.array(transportadoraVeiculoSchema),
}).superRefine((data, ctx) => {
    const valor = data.rgIe?.trim() ?? ''
    if (valor) {
        if (data.tipo === 'F') {
            if (!validarRG(valor)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rgIe'], message: "RG inválido. Informe entre 7 e 9 dígitos." })
            }
        } else {
            if (!validarIE(valor)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rgIe'], message: "Inscrição Estadual inválida. Informe entre 8 e 14 caracteres." })
            }
        }
    }

    if (data.emails.filter(e => e.principal).length > 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['emails'], message: "Apenas um e-mail pode ser marcado como principal." })
    }

    if (data.telefones.filter(t => t.principal).length > 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['telefones'], message: "Apenas um telefone pode ser marcado como principal." })
    }

    const ids = data.veiculos.map(v => v.veiculoId)
    if (new Set(ids).size !== ids.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['veiculos'], message: "Existem veículos duplicados na lista." })
    }
})

type FormData = z.infer<typeof schema>

interface TransportadoraFormProps {
    transportadora?:    TransportadoraView | null
    emailsIniciais?:    TransportadoraEmail[]
    telefonesIniciais?: TransportadoraTelefone[]
    veiculosIniciais?:  VeiculoSelect[]
    listaVeiculos:      VeiculoSelect[]
    listaCidades:       CidadeSelect[]
    listaEstados:       EstadoSelect[]
    listaPaises:        PaisSelect[]
    listaCondicoes:     CondicaoPagamentoSelect[]
}

export function TransportadoraForm({
    transportadora,
    emailsIniciais    = [],
    telefonesIniciais = [],
    veiculosIniciais  = [],
    listaVeiculos,
    listaCidades,
    listaEstados,
    listaPaises,
    listaCondicoes,
}: TransportadoraFormProps) {
    const router  = useRouter()
    const [loading, setLoading] = useState(false)

    const [condicoes, setCondicoes] = useState<CondicaoPagamentoSelect[]>(listaCondicoes)
    const [veiculos, setVeiculos]   = useState<VeiculoSelect[]>(listaVeiculos)

    const cidadeInicial = listaCidades.find(c => c.id === transportadora?.cidadeId)
    const estadoInicial = listaEstados.find(e => e.id === cidadeInicial?.estadoId)

    const { register, handleSubmit, watch, setValue, getValues, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            tipo:                  (transportadora?.tipo as 'F' | 'J') ?? 'J',
            ativo:                 transportadora ? transportadora.ativo : true,
            razaoSocial:           transportadora?.razaoSocial           ?? '',
            nomeFantasiaApelido:   transportadora?.nomeFantasiaApelido   ?? '',
            cnpj: transportadora?.cnpj
                                     ? (transportadora.cnpj.replace(/\D/g, '').length === 11
                                         ? mascaraCPF(transportadora.cnpj)
                                         : mascaraCNPJ(transportadora.cnpj))
                                     : '',
            rgIe:                  transportadora?.rgIe          ?? '',
            cep:                   transportadora?.cep            ?? '',
            endereco:              transportadora?.endereco       ?? '',
            numero:                transportadora?.numero         ?? '',
            complemento:           transportadora?.complemento   ?? '',
            bairro:                transportadora?.bairro         ?? '',
            cidadeId:              transportadora?.cidadeId?.toString()            ?? '',
            condicaoPagamentoId:   transportadora?.condicaoPagamentoId?.toString() ?? '',
            limiteCredito:         transportadora?.limiteCredito?.toString()        ?? '0',
            observacoes:           transportadora?.observacoes    ?? '',
            emails: emailsIniciais.map(e => ({
                id: e.id, email: e.email, tipo: e.tipo, principal: e.principal, ativo: e.ativo,
            })),
            telefones: telefonesIniciais.map(t => ({
                id: t.id, telefone: mascaraTelefone(t.telefone), tipo: t.tipo, principal: t.principal, ativo: t.ativo,
            })),
            veiculos: veiculosIniciais.map(v => ({ veiculoId: String(v.id) })),
        },
    })

    const {
        paisSelecionado,
        estadoSelecionado,
        listaPaises:      paisesAtualizados,
        estadosFiltrados,
        cidadesFiltradas,
        handlePaisChange,
        handleEstadoChange,
    } = useEndereco(
        setValue,
        estadoInicial?.paisId ?? '',
        estadoInicial?.id     ?? '',
        listaPaises,
        listaEstados,
        listaCidades,
    )

    const { fields: emailFields,    append: appendEmail,    remove: removeEmail    } = useFieldArray({ control, name: "emails" })
    const { fields: telefoneFields, append: appendTelefone, remove: removeTelefone } = useFieldArray({ control, name: "telefones" })
    const { fields: veiculoFields,  append: appendVeiculo,  remove: removeVeiculo  } = useFieldArray({ control, name: "veiculos" })

    const handleCondicaoCriada = useCallback((novaCondicao: CondicaoPagamentoSelect) => {
        setCondicoes(prev =>
            [...prev, novaCondicao].sort((a, b) => a.condicaoPagamento.localeCompare(b.condicaoPagamento, 'pt-BR'))
        )
        setValue('condicaoPagamentoId', String(novaCondicao.id))
    }, [setValue])

    useCondicaoPagamentoCadastrada(handleCondicaoCriada)

    const handleVeiculoCriado = useCallback((novoVeiculo: VeiculoSelect) => {
        setVeiculos(prev =>
            [...prev, novoVeiculo].sort((a, b) => a.placa.localeCompare(b.placa, 'pt-BR'))
        )

        const veiculosAtuais = getValues('veiculos')
        const indexVazio = veiculosAtuais.findIndex((v: any) => !v.veiculoId)

        if (indexVazio >= 0) {
        setValue(`veiculos.${indexVazio}.veiculoId`, String(novoVeiculo.id))
        } else {
            appendVeiculo({ veiculoId: String(novoVeiculo.id) })
        }
    }, [appendVeiculo, getValues, setValue])

    useVeiculoCadastrado(handleVeiculoCriado)

    const marcarEmailPrincipal    = (index: number) => emailFields.forEach((_, i)    => setValue(`emails.${i}.principal`,    i === index))
    const marcarTelefonePrincipal = (index: number) => telefoneFields.forEach((_, i) => setValue(`telefones.${i}.principal`, i === index))


    const tipoPessoa = watch("tipo")
    const isPF       = tipoPessoa === "F"

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (transportadora?.id) formData.append('id', String(transportadora.id))

        const { emails, telefones, veiculos, ...scalar } = data

        Object.entries({
            ...scalar,
            cnpj: data.cnpj.replace(/\D/g, ''),
            cep:  data.cep ? data.cep.replace(/\D/g, '') : '',
        }).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formData.append(key, String(value))
        })

        formData.append('emails',    JSON.stringify(emails))
        formData.append('telefones', JSON.stringify(telefones.map(t => ({
            ...t,
            telefone: t.telefone.replace(/\D/g, ''),
        }))))
        formData.append('veiculos',  JSON.stringify(veiculos))

        try {
            await salvarTransportadora(formData)
            toast.success(transportadora ? "Transportadora atualizada com sucesso!" : "Transportadora cadastrada com sucesso!")
            router.push("/transportadoras")
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
                        {...register('razaoSocial')}
                        placeholder={isPF ? "Digite o nome completo" : "Digite a razão social"}
                    />
                    <Erro campo="razaoSocial" />
                </div>
                <div>
                    <FormLabel>{isPF ? "Apelido" : "Nome Fantasia"}</FormLabel>
                    <FormInput
                        {...register('nomeFantasiaApelido')}
                        placeholder={isPF ? "Apelido" : "Nome fantasia"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>{isPF ? "CPF" : "CNPJ"}</FormLabel>
                    <FormInput
                        {...register('cnpj', {
                            onChange: (e) => {
                                e.target.value = isPF ? mascaraCPF(e.target.value) : mascaraCNPJ(e.target.value)
                            },
                        })}
                        maxLength={isPF ? 14 : 18}
                        placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                        inputMode="numeric"
                    />
                    <Erro campo="cnpj" />
                </div>
                <div>
                    <FormLabel>{isPF ? "RG" : "Inscrição Estadual"}</FormLabel>
                    <FormInput
                        {...register('rgIe')}
                        placeholder={isPF ? "Número do RG" : "Número da I.E."}
                        maxLength={isPF ? 9 : 20}
                    />
                    <Erro campo="rgIe" />
                </div>
            </div>

            <div className="pt-1">
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_120px] gap-4 md:gap-6 mb-4">
                    <div>
                        <FormLabel>CEP</FormLabel>
                        <FormInput
                            {...register('cep', {
                                onChange: (e) => {
                                    let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                                    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`
                                    e.target.value = v
                                },
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
                        <PaisLookup paises={paisesAtualizados} value={String(paisSelecionado)} onChange={handlePaisChange} />
                    </div>
                    <div>
                        <FormLabel required>Estado</FormLabel>
                        <EstadoLookup estados={estadosFiltrados} value={String(estadoSelecionado)} onChange={handleEstadoChange} />
                    </div>
                    <div>
                        <FormLabel required>Cidade</FormLabel>
                        <Controller
                            name="cidadeId"
                            control={control}
                            render={({ field }) => (
                                <CidadeLookup cidades={cidadesFiltradas} value={field.value} onChange={field.onChange} error={errors.cidadeId?.message} />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Condição de Pagamento</FormLabel>
                    <Controller
                        name="condicaoPagamentoId"
                        control={control}
                        render={({ field }) => (
                            <CondicaoPagamentoLookup
                                condicoes={condicoes}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.condicaoPagamentoId?.message}
                            />
                        )}
                    />
                </div>
                    <div>
                        <FormLabel required>Limite de Crédito (R$)</FormLabel>
                        <FormInput type="number" {...register('limiteCredito')} min={0} step="0.01" />
                        <Erro campo="limiteCredito" />
                    </div>
                </div>
            </div>
   
            <EmailList
                fields={emailFields}
                append={appendEmail}
                remove={removeEmail}
                register={register}
                watch={watch}
                errors={errors.emails}
                marcarPrincipal={marcarEmailPrincipal}
                tiposEmail={TIPOS_EMAIL_TRANSPORTADORA}
            />

            <TelefoneList
                fields={telefoneFields}
                append={appendTelefone}
                remove={removeTelefone}
                register={register}
                watch={watch}
                errors={errors.telefones}
                marcarPrincipal={marcarTelefonePrincipal}
                tiposTelefone={TIPOS_TELEFONE_TRANSPORTADORA}
            />

            <VeiculoList
                fields={veiculoFields}
                append={appendVeiculo}
                remove={removeVeiculo}
                watch={watch}
                control={control}
                errors={errors.veiculos}
                listaVeiculos={veiculos}
            />

            <div>
                <FormLabel>Observações</FormLabel>
                <FormInput {...register('observacoes')} placeholder="Observações adicionais" maxLength={150} />
            </div>

            {transportadora && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(transportadora.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {transportadora.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(transportadora.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : transportadora ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/transportadoras")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}