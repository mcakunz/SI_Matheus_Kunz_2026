export interface DBErrorLabels {
    unique?:     Record<string, string>
    foreignKey?: string
}
 
export function tratarErroDB(error: any, labels?: DBErrorLabels): never {
    switch (error.code) {
        // Unique violation — detail: 'Key (sigla)=(BRA) already exists.'
        case '23505': {
            const campo = error.detail?.match(/Key \((\w+)\)/)?.[1]
            const label = (campo && labels?.unique?.[campo]) ?? campo ?? "estes dados"
            throw new Error(`Já existe um registro com ${label} cadastrado.`)
        }
        // Foreign key violation
        case '23503': {
            throw new Error(labels?.foreignKey ?? "Este registro não pode ser excluído pois existem outros dados vinculados a ele.")
        }
        // Not null violation
        case '23502': {
            const campo = error.column ?? "desconhecido"
            throw new Error(`O campo "${campo}" é obrigatório e não pode ficar vazio.`)
        }
        // String muito longa
        case '22001': {
            throw new Error("Um dos campos ultrapassa o tamanho máximo permitido.")
        }
        default: {
            throw new Error(error.message ?? "Ocorreu um erro inesperado. Tente novamente.")
        }
    }
}