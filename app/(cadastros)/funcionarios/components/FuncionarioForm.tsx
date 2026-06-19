"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { salvarFuncionario } from "../actions"
import toast from "react-hot-toast"

import { Button } from "@/app/components/ui/Button"
import { FormInput } from "@/app/components/ui/FormInput"
import { FormLabel } from "@/app/components/ui/FormLabel"
import { FormSelect } from "@/app/components/ui/FormSelect"
import { FormSwitch } from "@/components/ui/FormSwitch"
import { PaisLookup } from "@/components/ui/PaisLookup"
import { EstadoLookup } from "@/components/ui/EstadoLookup"
import { CidadeLookup } from "@/components/ui/CidadeLookup"
import { EmailList } from "@/app/components/ui/EmailList"
import { TelefoneList } from "@/app/components/ui/TelefoneList"
import { useEndereco } from "@/lib/hooks/useEndereco"
import { mascaraCPF, mascaraTelefone } from "@/lib/utils/mascaras"
import {
    FuncionarioView, CidadeSelect, EstadoSelect, PaisSelect,
    FuncaoFuncionarioSelect, FuncionarioEmail, FuncionarioTelefone,
} from "@/lib/types"
import { toDateString } from "@/lib/utils/helpers"
import { TIPOS_EMAIL_FUNCIONARIO, TIPOS_TELEFONE_FUNCIONARIO } from "@/lib/TiposContato"

const funcionarioEmailSchema = z.object({
    id:        z.number().optional(),
    email:     z.string().email("E-mail inválido."),
    tipo:      z.enum(['PESSOAL', 'CORPORATIVO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const funcionarioTelefoneSchema = z.object({
    id:        z.number().optional(),
    telefone:  z.string().min(10, "Telefone inválido.").max(15),
    tipo:      z.enum(['PESSOAL', 'CORPORATIVO']),
    principal: z.boolean(),
    ativo:     z.boolean(),
})

const schema = z.object({
    funcionario:         z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(100),
    apelido:             z.string().max(50).optional(),
    cpfCnpj:             z.string().min(11, "CPF inválido.").max(14),
    rgInscricaoEstadual: z.string().max(20).optional(),
    emails:              z.array(funcionarioEmailSchema),
    telefones:           z.array(funcionarioTelefoneSchema),    cep:                 z.string().min(8, "CEP inválido.").max(9),
    endereco:            z.string().min(1, "Informe o endereço.").max(100),
    numero:              z.string().min(1, "Informe o número.").max(10),
    complemento:         z.string().max(50).optional(),
    bairro:              z.string().min(1, "Informe o bairro.").max(50),
    cidadeId:            z.string().min(1, "Selecione uma cidade."),
    funcaoFuncionarioId: z.string().min(1, "Selecione uma função."),
    dataNascimento:      z.string().min(1, "Informe a data de nascimento."),
    dataAdmissao:        z.string().min(1, "Informe a data de admissão."),
    dataDemissao:        z.string().optional(),
    cnh:                 z.string().max(11).optional(),
    dataValidadeCnh:     z.string().optional(),
    sexo:                z.enum(['M', 'F', 'O']),
    salario:             z.string().min(1, "Informe o salário."),
    tipo:                z.enum(['INTERNO', 'EXTERNO', 'TERCEIRIZADO']),
    observacao:          z.string().max(150).optional(),
    ativo:               z.boolean(),
}).superRefine((data, ctx) => {
    if (data.dataDemissao && data.dataDemissao < data.dataAdmissao) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dataDemissao'],
            message: "A data de demissão não pode ser anterior à data de admissão.",
        })
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

interface FuncionarioFormProps {
    funcionario?:       FuncionarioView | null
    listaCidades:       CidadeSelect[]
    listaEstados:       EstadoSelect[]
    listaPaises:        PaisSelect[]
    listaFuncoes:       FuncaoFuncionarioSelect[]
    emailsIniciais?:    FuncionarioEmail[]
    telefonesIniciais?: FuncionarioTelefone[]
}

export function FuncionarioForm({
    funcionario,
    listaCidades,
    listaEstados,
    listaPaises,
    listaFuncoes,
    emailsIniciais    = [],
    telefonesIniciais = [],
}: FuncionarioFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const cidadeInicial = listaCidades.find(c => c.id === funcionario?.cidadeId)
    const estadoInicial = listaEstados.find(e => e.id === cidadeInicial?.estadoId)

    const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            funcionario:         funcionario?.funcionario ?? '',
            apelido:             funcionario?.apelido ?? '',
            cpfCnpj:             funcionario?.cpfCnpj
                                     ? mascaraCPF(funcionario.cpfCnpj)
                                     : '',
            rgInscricaoEstadual: funcionario?.rgInscricaoEstadual ?? '',
            emails: emailsIniciais.map(e => ({
                id: e.id, email: e.email, tipo: e.tipo, principal: e.principal, ativo: e.ativo,
            })),
            telefones: telefonesIniciais.map(t => ({
                id: t.id, telefone: mascaraTelefone(t.telefone), tipo: t.tipo, principal: t.principal, ativo: t.ativo,
            })),
            cep:                 funcionario?.cep ?? '',
            endereco:            funcionario?.endereco ?? '',
            numero:              funcionario?.numero ?? '',
            complemento:         funcionario?.complemento ?? '',
            bairro:              funcionario?.bairro ?? '',
            cidadeId:            funcionario?.cidadeId?.toString() ?? '',
            funcaoFuncionarioId: funcionario?.funcaoFuncionarioId?.toString() ?? '',
            dataNascimento:      toDateString(funcionario?.dataNascimento),
            dataAdmissao:        toDateString(funcionario?.dataAdmissao),
            dataDemissao:        toDateString(funcionario?.dataDemissao),
            cnh:                 funcionario?.cnh ?? '',
            dataValidadeCnh:     toDateString(funcionario?.dataValidadeCnh),
            sexo:                (funcionario?.sexo as 'M' | 'F' | 'O') ?? 'M',
            salario:             funcionario?.salario?.toString() ?? '0',
            tipo:                (funcionario?.tipo as 'INTERNO' | 'EXTERNO' | 'TERCEIRIZADO') ?? 'INTERNO',
            observacao:          funcionario?.observacao ?? '',
            ativo:               funcionario ? funcionario.ativo : true,
        }
    })

    const {
        paisSelecionado,
        estadoSelecionado,
        listaPaises:     paisesAtualizados,
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

    const funcaoSelecionadaId = watch('funcaoFuncionarioId')
    const funcaoSelecionada   = listaFuncoes.find(f => f.id === Number(funcaoSelecionadaId))
    const requerCnh           = funcaoSelecionada?.requerCnh ?? false

    const { fields: emailFields,    append: appendEmail,    remove: removeEmail    } = useFieldArray({ control, name: 'emails' })
    const { fields: telefoneFields, append: appendTelefone, remove: removeTelefone } = useFieldArray({ control, name: 'telefones' })

    const marcarEmailPrincipal = (index: number) => {
        emailFields.forEach((_, i) => setValue(`emails.${i}.principal`, i === index))
    }
    const marcarTelefonePrincipal = (index: number) => {
        telefoneFields.forEach((_, i) => setValue(`telefones.${i}.principal`, i === index))
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        const formData = new FormData()
        if (funcionario?.id) formData.append('id', String(funcionario.id))

        const { emails, telefones, ...scalar } = data
        const payload = {
            ...scalar,
            cpfCnpj:  data.cpfCnpj.replace(/\D/g, ''),
            cep:      data.cep.replace(/\D/g, ''),
            telefones: data.telefones.map(t => ({ ...t, telefone: t.telefone.replace(/\D/g, '') })),
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && key !== 'telefones') {
                formData.append(key, String(value))
            }
        })

        formData.append('emails',    JSON.stringify(emails))
        formData.append('telefones', JSON.stringify(payload.telefones))

        try {
            await salvarFuncionario(formData)
            toast.success(funcionario ? "Funcionário atualizado com sucesso!" : "Funcionário cadastrado com sucesso!")
            router.push("/funcionarios")
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
                    <FormLabel required>Tipo</FormLabel>
                    <FormSelect {...register('tipo')}>
                        <option value="INTERNO">Interno</option>
                        <option value="EXTERNO">Externo</option>
                        <option value="TERCEIRIZADO">Terceirizado</option>
                    </FormSelect>
                    <Erro campo="tipo" />
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
                    <FormLabel required>Nome Completo</FormLabel>
                    <FormInput {...register('funcionario')} placeholder="Nome do funcionário" />
                    <Erro campo="funcionario" />
                </div>
                <div>
                    <FormLabel>Apelido</FormLabel>
                    <FormInput {...register('apelido')} placeholder="Apelido" />
                </div>
                <div>
                    <FormLabel required>Sexo</FormLabel>
                    <FormSelect {...register('sexo')}>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                    </FormSelect>
                    <Erro campo="sexo" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel required>CPF</FormLabel>
                    <FormInput
                        {...register('cpfCnpj', {
                            onChange: (e) => {
                                e.target.value = mascaraCPF(e.target.value)
                            }
                        })}
                        maxLength={14}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                    />
                    <Erro campo="cpfCnpj" />
                </div>
                <div>
                    <FormLabel>RG</FormLabel>
                    <FormInput
                        {...register('rgInscricaoEstadual')}
                        placeholder="Número do RG"
                        maxLength={20}
                    />
                    <Erro campo="rgInscricaoEstadual" />
                </div>
                <div>
                    <FormLabel required>Data de Nascimento</FormLabel>
                    <FormInput type="date" {...register('dataNascimento')} />
                    <Erro campo="dataNascimento" />
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
                tiposEmail={TIPOS_EMAIL_FUNCIONARIO}
            />

            <TelefoneList
                fields={telefoneFields}
                append={appendTelefone}
                remove={removeTelefone}
                register={register}
                watch={watch}
                errors={errors.telefones}
                marcarPrincipal={marcarTelefonePrincipal}
                tiposTelefone={TIPOS_TELEFONE_FUNCIONARIO}
            />

            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_120px] gap-4 md:gap-6">
                <div>
                    <FormLabel required>CEP</FormLabel>
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
                    <FormLabel required>Logradouro</FormLabel>
                    <FormInput {...register('endereco')} placeholder="Rua, avenida, alameda..." />
                    <Erro campo="endereco" />
                </div>
                <div>
                    <FormLabel required>Número</FormLabel>
                    <FormInput {...register('numero')} maxLength={10} placeholder="Nº" />
                    <Erro campo="numero" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel required>País</FormLabel>
                    <PaisLookup
                        paises={paisesAtualizados}
                        value={String(paisSelecionado)}
                        onChange={handlePaisChange}
                    />
                </div>
                <div>
                    <FormLabel required>Estado</FormLabel>
                    <EstadoLookup
                        estados={estadosFiltrados}
                        value={String(estadoSelecionado)}
                        onChange={handleEstadoChange}
                    />
                </div>
                <div>
                    <FormLabel required>Cidade</FormLabel>
                    <Controller
                        name="cidadeId"
                        control={control}
                        render={({ field }) => (
                            <CidadeLookup
                                cidades={cidadesFiltradas}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.cidadeId?.message}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Complemento</FormLabel>
                    <FormInput {...register('complemento')} placeholder="Apto, bloco, sala..." />
                </div>
                <div>
                    <FormLabel required>Bairro</FormLabel>
                    <FormInput {...register('bairro')} placeholder="Bairro" />
                    <Erro campo="bairro" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                    <FormLabel required>Função</FormLabel>
                    <FormSelect {...register('funcaoFuncionarioId')}>
                        <option value="">Selecione uma função...</option>
                        {listaFuncoes.map((f) => (
                            <option key={f.id} value={f.id}>{f.funcaoFuncionario}</option>
                        ))}
                    </FormSelect>
                    <Erro campo="funcaoFuncionarioId" />
                </div>
                <div>
                    <FormLabel required>Salário (R$)</FormLabel>
                    <FormInput type="number" {...register('salario')} min={0} step="0.01" />
                    <Erro campo="salario" />
                </div>
                <div>
                    <FormLabel required>Data de Admissão</FormLabel>
                    <FormInput type="date" {...register('dataAdmissao')} />
                    <Erro campo="dataAdmissao" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <FormLabel>Data de Demissão</FormLabel>
                    <FormInput type="date" {...register('dataDemissao')} />
                    <Erro campo="dataDemissao" />
                </div>
            </div>

            {(requerCnh || funcionario?.cnh) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <FormLabel required={requerCnh}>CNH</FormLabel>
                        <FormInput
                            {...register('cnh')}
                            maxLength={11}
                            placeholder="Número da CNH"
                            inputMode="numeric"
                        />
                        <Erro campo="cnh" />
                    </div>
                    <div>
                        <FormLabel required={requerCnh}>Validade da CNH</FormLabel>
                        <FormInput type="date" {...register('dataValidadeCnh')} />
                        <Erro campo="dataValidadeCnh" />
                    </div>
                </div>
            )}

            <div>
                <FormLabel>Observações</FormLabel>
                <FormInput {...register('observacao')} placeholder="Observações adicionais" maxLength={150} />
            </div>

            {funcionario && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                    <span>Cadastrado: {new Date(funcionario.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    {funcionario.dataAlteracao && (
                        <span>
                            Alterado:{" "}
                            {new Date(funcionario.dataAlteracao).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Salvando..." : funcionario ? "Salvar Alterações" : "Salvar"}
                </Button>
                <button
                    type="button"
                    onClick={() => router.push("/funcionarios")}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}