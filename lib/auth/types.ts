export interface SessaoUsuario {
    id:        number
    usuario:   string
    nome:      string
    email:     string
    perfilId:  number
    perfil:    string
    nivelPerfil: number
    fotoPerfil?: string | null
}

export interface TokenPayload extends SessaoUsuario {
    iat?: number
    exp?: number
}

export type ResultadoPermissao =
    | { autorizado: true }
    | { autorizado: false; motivo: string }