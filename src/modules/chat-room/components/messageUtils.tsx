import SentIcon from '@public/images/messageStatus/sent.svg'
import DeliveredIcon from '@public/images/messageStatus/delivered.svg'
import ReadIcon from '@public/images/messageStatus/read.svg'

/** Статус прочтения исходящего сообщения */
export type ReadStatus = 'sent' | 'delivered' | 'read'

/**
 * Определяет статус прочтения сообщения по временным меткам.
 * Возвращает null для входящих сообщений — статус прочтения
 * отображается только для собственных (исходящих) сообщений.
 */
export function getReadStatus(
    message: {
        read_at?: number | null
        delivered_at?: number | null
    },
    isOwn: boolean,
): ReadStatus | null {
    if (!isOwn) return null

    if (message.read_at) return 'read'
    if (message.delivered_at) return 'delivered'

    return 'sent'
}

// Форматирование Unix-timestamp в строку времени (ЧЧ:ММ) по русской локали.
// Умножение на 1000 — бэкенд отдаёт timestamp в секундах, Date ожидает миллисекунды.
export function formatTime(timestamp?: number) {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleTimeString(
        'ru-RU',
        {
            hour: '2-digit',
            minute: '2-digit',
        },
    )
}

// ISO-строка для атрибута dateTime в <time> — a11y: скринридер озвучит полную дату
export function getISOTime(timestamp?: number) {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toISOString()
}

/**
 * Иконка статуса прочтения: одна галочка (sent), двойная серая (delivered),
 * двойная фиолетовая (read). Для входящих сообщений не рендерится.
 */
export function ReadCheckmark({
    status,
}: Readonly<{
    status: ReadStatus | null
}>) {
    if (!status) return null

    if (status === 'sent') {
        return (
            <SentIcon
                width={18}
                height={16}
                className="fill-text-gray"
            />
        )
    }

    if (status === 'delivered') {
        return (
            <DeliveredIcon
                width={18}
                height={12}
                className="fill-text-gray"
            />
        )
    }

    return (
        <ReadIcon
            width={18}
            height={11}
            className="fill-accent-violet-primary"
        />
    )
}
