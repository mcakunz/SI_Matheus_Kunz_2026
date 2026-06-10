import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

export function useEndereco(
    setValue: UseFormSetValue<any>,
    paisInicial:   number | '' = '',
    estadoInicial: number | '' = '',
) {
    const [paisSelecionado,   setPaisSelecionado]   = useState<number | ''>(paisInicial)
    const [estadoSelecionado, setEstadoSelecionado] = useState<number | ''>(estadoInicial)

    const handlePaisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : '';
        setPaisSelecionado(val);
        setEstadoSelecionado('');
        setValue('cidadeId', '');
    };

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : '';
        setEstadoSelecionado(val);
        setValue('cidadeId', '');
    };

    return {
        paisSelecionado, setPaisSelecionado,
        estadoSelecionado, setEstadoSelecionado,
        handlePaisChange, handleEstadoChange
    };
}