'use client'

import { ForwardedMessage as ForwardedMessageType } from '@shared/types/message'

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
    return (
        <div className="rounded-lg bg-gray-main p-2">
            <p className="text-xs text-text-gray">
                Переслано от [Пользователь]
            </p>
            <p className="text-sm">
                {forwardedMessage.content}
            </p>
        </div>
    )
}
