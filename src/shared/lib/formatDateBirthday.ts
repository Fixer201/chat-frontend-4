export const formatBirthday = (
    timestamp?: number | string,
) => {
    if (!timestamp) return null

    try {
        // Преобразуем timestamp в число, если это строка
        const date = new Date(Number(timestamp))

        // Проверяем, что дата валидна
        if (isNaN(date.getTime())) return null

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return null
    }
}
