export const REGEX_RG = /^\d{6,8}[\dXx]$/;
export const REGEX_IE = /^\d{8,14}$/;

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