/* TODO: Добавить полный тип, не использовать any*/
type ApiError = {
    message: string
}

export function mapApiError(error: ApiError): string {
    return error?.message || 'An unexpected error occurred'
}
