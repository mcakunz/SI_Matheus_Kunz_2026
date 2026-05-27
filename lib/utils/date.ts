/**
 * Formata uma data ISO ou timestamp para o padrão pt-BR.
 * @param dateStr A data a ser formatada
 * @param comHora Se true, inclui horas e minutos
 */
export function formatarData(dateStr: string | Date | null | undefined, comHora = false): string {
    if (!dateStr) return '';
    
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        ...(comHora ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}