// Функция форматирования времени последнего подключения
/**
 * Форматирует время последнего подключения в удобный формат
 * @param lastSeenMs - timestamp в миллисекундах
 * @returns
 *   - Сегодня: "ЧЧ:ММ" (например: "21:49")
 *   - Эта неделя (но не сегодня): "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"
 *   - Ранее: "ДД.ММ.ГГГГ" (например: "15.10.2023")
 */
export const formatLastSeen = (
    lastSeenMs: number,
): string => {
    const lastSeen = new Date(lastSeenMs)
    const now = new Date()

    // Проверяем сегодняшний день
    if (
        lastSeen.getDate() === now.getDate() &&
        lastSeen.getMonth() === now.getMonth() &&
        lastSeen.getFullYear() === now.getFullYear()
    ) {
        // Сегодня - возвращаем время в формате ЧЧ:ММ
        const hours = lastSeen
            .getHours()
            .toString()
            .padStart(2, '0')
        const minutes = lastSeen
            .getMinutes()
            .toString()
            .padStart(2, '0')
        return `${hours}:${minutes}`
    }

    // Проверяем эту неделю
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    if (lastSeen > weekAgo) {
        // На этой неделе - возвращаем сокращенное название дня недели
        const days = [
            'Вс',
            'Пн',
            'Вт',
            'Ср',
            'Чт',
            'Пт',
            'Сб',
        ]
        return days[lastSeen.getDay()]
    }

    // Ранее - возвращаем дату в формате ДД.ММ.ГГГГ
    const day = lastSeen
        .getDate()
        .toString()
        .padStart(2, '0')
    const month = (lastSeen.getMonth() + 1)
        .toString()
        .padStart(2, '0')
    const year = lastSeen.getFullYear()
    return `${day}.${month}.${year}`
}
