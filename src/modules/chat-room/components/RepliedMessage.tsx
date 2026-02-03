'use client'

import { RepliedMessage as RepliedMessageType } from '@shared/types/message'

/** Пропсы содержат объект цитируемого сообщения с текстовым контентом */
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
    // Блок цитаты: cursor-pointer подсказывает, что можно кликнуть для перехода к сообщению
    return (
        <div
            className={`
              mb-1 cursor-pointer rounded border-l-2
              border-l-accent-violet-primary bg-gray-main p-2 transition-colors
              hover:bg-accent-violet-ultra-light
            `}
        >
            <p className="text-xs text-text-gray">
                Ответ на сообщение
            </p>
            <p className="truncate text-sm">
                {repliedMessage.content}
            </p>
        </div>
    )
}
