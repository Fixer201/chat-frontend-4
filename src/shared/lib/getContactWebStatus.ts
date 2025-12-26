// Функция вычисления статуса в сети - времени и даты

// Расшифровка статусов из фигмы:
// в сети = онлайн
// был(а) только что = менее 1 минуты назад
// был(а) 22 минуты назад = от 1 минуты до 59 минут
// был(а) 22 часа назад = от 1 часа до 23 часов
// был(а) вчера в 21:15 = от 24 часов до 47 ч. 59 мин.
// был(а) 02.04.24 = от 48 часов до бесконечности, отображается всегда

import { STATUS_TEXTS } from '@shared/config/constants';

export const getContactWebStatus = (
    isOnline: boolean,
   
    wasOnlineAt: string | number | Date | null | undefined,
): string => {
    // Если онлайн, статус "в сети"
    if (isOnline) {
        return STATUS_TEXTS.online;
    }

    // Если wasOnlineAt некорректен, считаем "только что"
    if (!wasOnlineAt) {
        return STATUS_TEXTS.justNow;
    }

    const now = new Date();
    const lastOnlineDate = new Date(wasOnlineAt);

    if (isNaN(lastOnlineDate.getTime())) {
        return STATUS_TEXTS.justNow;
    }

    const diffMs = now.getTime() - lastOnlineDate.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // Менее 1 минуты: "был(а) только что"
    if (diffMinutes < 1) {
        return STATUS_TEXTS.justNow;
    }

    // От 1 до 59 минут: "был(а) X минут назад"
    if (diffMinutes >= 1 && diffMinutes < 60) {
        const minutes = Math.floor(diffMinutes);
        return STATUS_TEXTS.minutesAgo(minutes);
    }

    // От 1 до 23 часов: "был(а) X часа назад"
    if (diffMinutes >= 60 && diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return STATUS_TEXTS.hoursAgo(hours);
    }

    // От 24 до 47 часов 59 минут: "был(а) вчера в HH:MM"
    if (diffMinutes >= 1440 && diffMinutes < 2880) {
        const hours = lastOnlineDate
            .getHours()
            .toString()
            .padStart(2, '0');
        const minutes = lastOnlineDate
            .getMinutes()
            .toString()
            .padStart(2, '0');
        return STATUS_TEXTS.yesterdayAt(hours, minutes);
    }

    // От 48 часов и далее: "был(а) DD.MM.YY"
    const dateString = lastOnlineDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
    return STATUS_TEXTS.dateAgo(dateString);
};