/**
 * Erro de regra de negócio: a mensagem já está pronta para mostrar ao usuário.
 * As actions repassam este erro direto, sem passar pelo tratarErroDB (que é para erros do banco).
 */
export class ErroNegocio extends Error {}
