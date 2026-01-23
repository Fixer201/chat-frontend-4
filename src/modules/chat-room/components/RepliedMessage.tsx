'use client'

import { RepliedMessage as RepliedMessageType } from '@shared/types/message'

interface RepliedMessageProps {
    readonly repliedMessage: RepliedMessageType
}

/**
 * Компонент для отображения ответа на сообщение
 *
 * TODO: Реализовать верстку согласно дизайну
 * - Компактная цитата оригинального сообщения
 * - Вертикальная полоска слева (accent-violet-primary)
 * - Имя автора оригинального сообщения
 * - Превью текста (первые ~50 символов)
 *
 * Примечание: Ответ на пересланное сообщение выглядит как обычный ответ
 */
export default function RepliedMessage({
    repliedMessage,
}: RepliedMessageProps) {
    return (
        <div className="mb-1 rounded bg-gray-main p-2">
            <p className="text-xs text-text-gray">
                Ответ на сообщение
            </p>
            <p className="truncate text-sm">
                {repliedMessage.content}
            </p>
        </div>
    )
}
