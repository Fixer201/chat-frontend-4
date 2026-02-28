// Функция форматирования времени последнего подключения
/**
 * Форматирует время последнего подключения в удобный формат
 * @param lastSeenMs - timestamp в миллисекундах (Unix timestamp * 1000)
 * @returns
 *   - Сегодня: "ЧЧ:ММ" (например: "21:49")
 *   - Эта неделя (но не сегодня): "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"
 *   - Ранее: "ДД.ММ.ГГГГ" (например: "15.10.2023")
 */
export const formatLastSeen = (
    lastSeenMs: number | string | Date,
): string => {
    const lastSeen = new Date(lastSeenMs)
    const now = new Date()

    // Проверяем сегодняшний день
    // Сравниваем день, месяц и год для определения "сегодня"
    if (
        lastSeen.getDate() === now.getDate() &&
        lastSeen.getMonth() === now.getMonth() &&
        lastSeen.getFullYear() === now.getFullYear()
    ) {
        // Сегодня - возвращаем время в формате ЧЧ:ММ
        // padStart добавляет ведущий ноль для однозначных чисел
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

    // Проверяем эту неделю (последние 7 дней)
    // Создаем дату 7 дней назад для сравнения
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
        return days[lastSeen.getDay()] // getDay() возвращает 0-6 (0 - воскресенье)
    }

    // Ранее - возвращаем дату в формате ДД.ММ.ГГГГ
    // padStart(2, '0') для обеспечения двузначного формата
    const day = lastSeen
        .getDate()
        .toString()
        .padStart(2, '0')
    const month = (lastSeen.getMonth() + 1)
        .toString()
        .padStart(2, '0') // Месяцы 0-11
    const year = lastSeen.getFullYear()
    return `${day}.${month}.${year}`
}
