'use client'

import { ForwardedMessage as ForwardedMessageType } from '@shared/types/message'

/** Пропсы содержат объект пересланного сообщения с текстом и метаданными */
interface ForwardedMessageProps {
    readonly forwardedMessage: ForwardedMessageType
}

/**
 * Компонент для отображения пересланного сообщения
 *
 * TODO: Реализовать верстку согласно дизайну
 * - Блок "Переслано от [Имя пользователя]" с аватаром
 * - Вертикальная полоска слева (accent-violet-primary)
 * - Контент пересланного сообщения
 *
 */
export default function ForwardedMessage({
    forwardedMessage,
}: ForwardedMessageProps) {
    // Блок пересланного сообщения: cursor-default + border-accent для визуального отличия
    return (
        <div
            className={`
          cursor-default rounded-lg border-l-2 border-l-accent-violet-primary
          bg-gray-main p-2
        `}
        >
            <p className="text-xs text-text-gray">
                Переслано от [Пользователь]
            </p>
            <p className="text-sm">
                {forwardedMessage.content}
            </p>
        </div>
    )
}
