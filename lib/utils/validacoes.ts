export const REGEX_RG = /^\d{6,8}[\dXx]$/;
export const REGEX_IE = /^\d{8,14}$/;
export const REGEX_CNPJ = /^\d{14}$/;

export const validarRG = (rg: string) => {
    const digitos = rg.replace(/[^\dXx]/g, '');
    return REGEX_RG.test(digitos);
};

export const validarIE = (ie: string) => {
    const apenasAlfanum = ie.replace(/[\s.\-\/]/g, '');
    return apenasAlfanum.length >= 8 && apenasAlfanum.length <= 14;
};

export const validarCEP = (cep: string) => {
    const apenasNumeros = cep.replace(/\D/g, '');
    return /^\d{8}$/.test(apenasNumeros);
};

export const validarCNPJ = (cnpj: string): boolean => {
    const numeros = cnpj.replace(/\D/g, '');

    if (!REGEX_CNPJ.test(numeros)) return false;
    if (/^(\d)\1{13}$/.test(numeros)) return false; 

    const calcDigito = (base: string, pesos: number[]) => {
        const soma = base.split('').reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const d1 = calcDigito(numeros.slice(0, 12), pesos1);
    const d2 = calcDigito(numeros.slice(0, 13), pesos2);

    return d1 === Number(numeros[12]) && d2 === Number(numeros[13]);
};