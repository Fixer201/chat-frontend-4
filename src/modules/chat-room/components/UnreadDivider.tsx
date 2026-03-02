'use client'

import { memo } from 'react'

/**
 * Разделитель непрочитанных сообщений в списке чата.
 *
 * Вставляется перед первым непрочитанным сообщением в MessagesList.
 * Визуально — горизонтальная линия с текстом «Непрочитанные сообщения»
 * по центру, стилизованная под акцентный фиолетовый цвет.
 *
 * Атрибут data-unread-divider используется для DOM-доступа
 * при автоскролле к непрочитанным (useScrollToUnread).
 */
function UnreadDivider() {
    return (
        <li
            role="separator"
            aria-label="Непрочитанные сообщения"
            data-unread-divider
            className="flex items-center gap-3 px-4 py-2 select-none"
        >
            <div className="h-px flex-1 bg-accent-violet-primary/40" />
            <span className="text-xs font-medium text-accent-violet-primary">
                Непрочитанные сообщения
            </span>
            <div className="h-px flex-1 bg-accent-violet-primary/40" />
        </li>
    )
}

export default memo(UnreadDivider)
