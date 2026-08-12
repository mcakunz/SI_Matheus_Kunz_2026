import { useState, useCallback, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { PaisSelect, EstadoSelect, CidadeSelect } from '@/lib/types';

export function useEndereco(
    setValue: UseFormSetValue<any>,
    paisInicial:    number | '' = '',
    estadoInicial:  number | '' = '',
    listaPaisesInicial:  PaisSelect[]  = [],
    listaEstadosInicial: EstadoSelect[] = [],
    listaCidadesInicial: CidadeSelect[] = [],
) {
    const [paisSelecionado,   setPaisSelecionado]   = useState<number | ''>(paisInicial)
    const [estadoSelecionado, setEstadoSelecionado] = useState<number | ''>(estadoInicial)
    
    const [listaPaises,  setListaPaises]  = useState<PaisSelect[]>(listaPaisesInicial)
    const [listaEstados, setListaEstados] = useState<EstadoSelect[]>(listaEstadosInicial)
    const [listaCidades, setListaCidades] = useState<CidadeSelect[]>(listaCidadesInicial)

    useEffect(() => {
        if (listaPaisesInicial.length > 0 && listaPaises.length === 0) {
            setListaPaises(listaPaisesInicial)
        }
    }, [listaPaisesInicial, listaPaises.length])

    useEffect(() => {
        if (listaEstadosInicial.length > 0 && listaEstados.length === 0) {
            setListaEstados(listaEstadosInicial)
        }
    }, [listaEstadosInicial, listaEstados.length])

    useEffect(() => {
        if (listaCidadesInicial.length > 0 && listaCidades.length === 0) {
            setListaCidades(listaCidadesInicial)
        }
    }, [listaCidadesInicial, listaCidades.length])

    const handlePaisChange = useCallback((id: string) => {
        const val = id ? Number(id) : ''
        setPaisSelecionado(val)
        setEstadoSelecionado('')
        setValue('cidadeId', '')  
    }, [setValue])

    const handleEstadoChange = useCallback((id: string) => {
        const val = id ? Number(id) : ''
        setEstadoSelecionado(val)
        setValue('cidadeId', '')  
    }, [setValue])

    const handlePaisCriado = useCallback((novoPais: PaisSelect) => {
        setListaPaises(prev =>
            [...prev, novoPais].sort((a, b) => a.pais.localeCompare(b.pais, 'pt-BR'))
        )
        setPaisSelecionado(novoPais.id)
        setEstadoSelecionado('')
        setValue('cidadeId', '')
    }, [setValue])

    const handleEstadoCriado = useCallback((novoEstado: EstadoSelect) => {
        setListaEstados(prev =>
            [...prev, novoEstado].sort((a, b) => a.estado.localeCompare(b.estado, 'pt-BR'))
        )
        setPaisSelecionado(novoEstado.paisId)
        handleEstadoChange(String(novoEstado.id))
    }, [handleEstadoChange])

    const handleCidadeCriada = useCallback((novaCidade: CidadeSelect) => {
        setListaCidades(prev =>
            [...prev, novaCidade].sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'))
        )
        setEstadoSelecionado(novaCidade.estadoId)
        setValue('cidadeId', String(novaCidade.id))
    }, [setValue])

    const estadosFiltrados = paisSelecionado
        ? listaEstados.filter(e => e.paisId === paisSelecionado)
        : listaEstados

    const cidadesFiltradas = estadoSelecionado
        ? listaCidades.filter(c => c.estadoId === estadoSelecionado)
        : listaCidades

    return {
        paisSelecionado, setPaisSelecionado,
        estadoSelecionado, setEstadoSelecionado,
        listaPaises, listaEstados, listaCidades,
        estadosFiltrados, cidadesFiltradas,
        handlePaisChange, handleEstadoChange,
        handlePaisCriado, handleEstadoCriado, handleCidadeCriada,
    };
}