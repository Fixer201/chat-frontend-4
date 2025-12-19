// Функция вычисления статуса в сети - времени и даты

// Расшифровка статусов из фигмы:
// в сети = онлайн
// был(а) только что = менее 1 минуты назад
// был(а) 22 минуты назад = от 1 минуты до 59 минут
// был(а) 22 часа назад = от 1 часа до 23 часов
// был(а) вчера в 21:15 = от 24 часов до 47 ч. 59 мин.
// был(а) 02.04.24 = от 48 часов до бесконечности, отображается всегда

import { STATUS_TEXTS } from '@shared/config/constants'

export const getContactWebStatus = (
    isOnline: boolean,
    // Поле из БД - время последнего онлайна в минутах (предположительно положительное число)
    wasOnlineAt: number,
): string => {
    // если онлайн, возвращаем статус "в сети"
    if (isOnline) {
        return STATUS_TEXTS.online
    }

    // проверка wasOnlineAt - если не число или отрицательное, считаем "только что"
    if (!Number.isFinite(wasOnlineAt) || wasOnlineAt < 0) {
        return STATUS_TEXTS.justNow
    }

    const today = new Date()
    const milliseconds = wasOnlineAt * 60 * 1000
    const lastOnlineDate = new Date(
        today.getTime() - milliseconds,
    )

    if (wasOnlineAt < 1) {
        return STATUS_TEXTS.justNow
    }
    if (wasOnlineAt >= 1 && wasOnlineAt < 60) {
        const minutes = Math.floor(wasOnlineAt)
        return STATUS_TEXTS.minutesAgo(minutes)
    }

    if (wasOnlineAt >= 60 && wasOnlineAt < 1440) {
        const hours = Math.floor(wasOnlineAt / 60)
        return STATUS_TEXTS.hoursAgo(hours)
    }

    if (wasOnlineAt >= 1440 && wasOnlineAt < 2880) {
        const hours = lastOnlineDate
            .getHours()
            .toString()
            .padStart(2, '0')
        const minutes = lastOnlineDate
            .getMinutes()
            .toString()
            .padStart(2, '0')
        return STATUS_TEXTS.yesterdayAt(hours, minutes)
    }

    const dateString = lastOnlineDate.toLocaleDateString(
        'ru-RU',
        {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        },
    )
    return STATUS_TEXTS.dateAgo(dateString)
}
