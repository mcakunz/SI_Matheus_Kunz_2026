export function ErrorLoadingData({ message }: { message: string }) {
    return (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mt-4 shadow">
            Erro ao carregar os dados: {message}
        </div>
    )
}