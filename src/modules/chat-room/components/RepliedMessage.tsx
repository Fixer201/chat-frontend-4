'use client'

import { memo } from 'react'
import { RepliedMessage as RepliedMessageType } from '@shared/types/message'

/** Пропсы компонента цитируемого (ответного) сообщения */
interface RepliedMessageProps {
    readonly repliedMessage: RepliedMessageType
    /** Колбэк клика по цитате для прокрутки к оригинальному сообщению */
    readonly onNavigateToOriginal?: (uid: string) => void
}

/**
 * Формирует полное имя автора оригинального сообщения.
 *
 * Имя автора никогда не обрезается (требование дизайна) —
 * в отличие от текста сообщения, который truncated до 1 строки.
 *
 * Приоритет: first_name + last_name → first_name → фоллбэк
 */
function getAuthorName(msg: RepliedMessageType): string {
    if (msg.first_name && msg.last_name) {
        return `${msg.first_name} ${msg.last_name}`
    }
    if (msg.first_name) {
        return msg.first_name
    }
    return 'Сообщение'
}

/**
 * Компонент отображения цитаты (ответа на сообщение) внутри пузыря чата.
 *
 * Структура карточки:
 * ┌─────────────────────────────────────┐
 * │ ▌ Имя автора                        │
 * │ ▌ Текст оригинального сообщения...  │
 * └─────────────────────────────────────┘
 *
 * Клик по карточке прокручивает чат к оригинальному сообщению
 * (если uid доступен и передан колбэк onNavigateToOriginal).
 *
 * memo — Vercel pattern (rerender-memo): стабильные пропсы из массива
 * repliedMessages, ререндер только при смене данных ответа.
 */
const RepliedMessage = memo(function RepliedMessage({
    repliedMessage,
    onNavigateToOriginal,
}: RepliedMessageProps) {
    const authorName = getAuthorName(repliedMessage)

    /** Обработка клика: навигация к оригинальному сообщению по его uid */
    const handleClick = () => {
        if (repliedMessage.uid && onNavigateToOriginal) {
            onNavigateToOriginal(repliedMessage.uid)
        }
    }

    /**
     * Определяем интерактивность карточки:
     * - Если есть uid и колбэк — карточка кликабельна (cursor-pointer + hover)
     * - Иначе — статичная цитата без hover-эффекта (cursor-default)
     */
    const isClickable =
        !!repliedMessage.uid && !!onNavigateToOriginal

    return (
        <div
            role={isClickable ? 'button' : undefined}
            {...(isClickable ? { tabIndex: 0 } : {})}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={
                isClickable
                    ? (e) => {
                          if (
                              e.key === 'Enter' ||
                              e.key === ' '
                          ) {
                              e.preventDefault()
                              handleClick()
                          }
                      }
                    : undefined
            }
            className={`
              mb-1 rounded border-l-2 border-l-accent-violet-primary
              bg-accent-violet-primary/10 p-2 transition-colors
              ${
                  isClickable
                      ? `
                cursor-pointer
                hover:bg-accent-violet-primary/20
              `
                      : `cursor-default`
              }
            `}
            aria-label={`Ответ на сообщение от ${authorName}`}
        >
            {/* Имя автора: не обрезается (по требованию дизайна), акцентный фиолетовый цвет */}
            <p className="text-xs font-medium text-accent-violet-primary">
                {authorName}
            </p>

            {/* Текст оригинального сообщения: одна строка с многоточием.
                line-clamp-1 ограничивает высоту, не зависит от длины текста.
                Цвет text-text-black — цитируемый текст читается как основной контент. */}
            <p className="line-clamp-1 text-sm text-text-black">
                {repliedMessage.content}
            </p>
        </div>
    )
})

export default RepliedMessage
