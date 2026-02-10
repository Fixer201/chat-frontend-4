'use client'

import { memo } from 'react'
import Image from 'next/image'
import { ForwardedMessage as ForwardedMessageType } from '@shared/types/message'

/** Пропсы компонента пересланного сообщения */
interface ForwardedMessageProps {
    readonly forwardedMessage: ForwardedMessageType
}

/**
 * Формирует полное имя автора пересланного сообщения.
 *
 * Приоритет отображения:
 * 1. first_name + last_name (если оба доступны)
 * 2. Только first_name
 * 3. Фоллбэк «Пользователь» — если бэкенд не вернул имя
 */
function getAuthorName(msg: ForwardedMessageType): string {
    if (msg.first_name && msg.last_name) {
        return `${msg.first_name} ${msg.last_name}`
    }
    if (msg.first_name) {
        return msg.first_name
    }
    return 'Пользователь'
}

/**
 * Выбирает URL аватара автора пересланного сообщения.
 *
 * Предпочитаем WebP-формат (меньший размер при том же качестве),
 * затем обычный URL, и при отсутствии обоих — дефолтный аватар.
 */
function getAvatarUrl(msg: ForwardedMessageType): string {
    return (
        msg.avatar_webp_url ||
        msg.avatar_url ||
        '/images/contacts/DefaultAvatar.svg'
    )
}

/**
 * Заголовок пересланного сообщения внутри пузыря чата.
 *
 * Не является отдельной карточкой — рендерится как часть пузыря сообщения.
 * Добавляет в начало пузыря метку «Переслано от» и строку с аватаром + именем автора.
 * Текст пересланного сообщения отображается ниже как обычный контент пузыря.
 *
 * Структура внутри пузыря:
 *   Переслано от                (фиолетовый, мелкий)
 *   [avatar] Сергей Авдиев      (фиолетовый, полужирный)
 *   Текст сообщения...          (обычный чёрный — рендерится в MessageItem)
 *
 * memo — Vercel pattern (rerender-memo): стабильные пропсы из массива
 * forwardedMessages, ререндер только при смене данных.
 */
const ForwardedMessage = memo(function ForwardedMessage({
    forwardedMessage,
}: ForwardedMessageProps) {
    const authorName = getAuthorName(forwardedMessage)
    const avatarUrl = getAvatarUrl(forwardedMessage)

    return (
        <div
            className="mb-1"
            aria-label={`Переслано от ${authorName}`}
        >
            {/* Метка «Переслано от» — фиолетовый акцентный цвет для визуального отличия
                от обычных сообщений. Мелкий шрифт — второстепенная информация. */}
            <p className="text-xs text-accent-violet-primary">
                Переслано от
            </p>

            {/* Блок автора: аватар + имя в одну строку.
                Аватар 20×20px — компактный, но различимый размер внутри пузыря.
                Имя в фиолетовом полужирном шрифте — акцент на источнике пересылки. */}
            <div className="flex items-center gap-1.5">
                {/* Аватар 20×20px — компактный, но различимый размер внутри пузыря */}
                <div
                    className={`
                  relative h-5 w-5 shrink-0 overflow-hidden rounded-full
                  bg-gray-main
                `}
                >
                    <Image
                        src={avatarUrl}
                        alt=""
                        fill
                        sizes="20px"
                        className="object-cover"
                    />
                </div>
                {/* Имя автора в фиолетовом полужирном — акцент на источнике пересылки */}
                <span
                    className={`
                  truncate text-sm font-semibold text-accent-violet-primary
                `}
                >
                    {authorName}
                </span>
            </div>
        </div>
    )
})

export default ForwardedMessage
