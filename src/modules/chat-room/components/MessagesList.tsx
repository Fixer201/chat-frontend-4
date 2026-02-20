'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'
import DateDivider from './DateDivider'
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import { Message } from '@shared/types/message'

/**
 * Список сообщений чата — основная область отображения переписки.
 *
 * Получает сообщения из WebSocket-контекста и фильтрует по chatKey.
 * При пустом списке отображает заглушку с иллюстрацией.
 * Каждое сообщение рендерится через MessageItem с поддержкой
 * контекстного меню, режима выбора и действий (ответ, пересылка, удаление).
 *
 * Между группами сообщений разных дней вставляется DateDivider —
 * горизонтальная линия с меткой даты («Сегодня», «15 января» и т.д.),
 * позволяющая пользователю ориентироваться в хронологии переписки.
 *
 * Семантика: section[role="log"] с aria-live="polite" для экранных читалок,
 * обновляющий контент без прерывания текущей озвучки.
 */

// Временный флаг: показывать все сообщения без фильтрации по chatKey.
// Используется на этапе разработки, пока не реализована полноценная логика контактов.
const USE_MOCK = false // TODO: удалить после реализации контактов

/**
 * Проверяет, принадлежат ли два Unix-timestamp (в секундах) одному
 * календарному дню в локальном часовом поясе пользователя.
 *
 * Используется в цикле рендеринга MessagesList для определения
 * границ между днями: если текущее сообщение и предыдущее относятся
 * к разным дням — перед текущим вставляется DateDivider.
 *
 * Сравнение ведётся по трём компонентам (год, месяц, день),
 * а не через разницу в миллисекундах, чтобы корректно обрабатывать
 * пограничные случаи (сообщения в 23:59 и 00:01 — разные дни).
 *
 * @param a — timestamp предыдущего сообщения (может быть undefined)
 * @param b — timestamp текущего сообщения (может быть undefined)
 * @returns true если оба timestamp определены и относятся к одному дню
 */
function isSameDay(
    a: number | undefined,
    b: number | undefined,
): boolean {
    if (!a || !b) return false
    const da = new Date(a * 1000)
    const db = new Date(b * 1000)
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    )
}

export default function MessagesList({
    chatKey,
    apiMessages = [],
    contactUid,
    isTemporary = false,
    onEditMessage,
    onReplyMessage,
    onSelectMessage,
    onForwardMessage,
    isSelectionMode,
    selectedMessages,
    chatName,

    searchQuery = '',
    currentMatchIndex,
    onSearchMatchesFound,
}: Readonly<{
    chatKey: string
    apiMessages?: Message[]
    contactUid?: string
    isTemporary?: boolean
    onEditMessage?: (message: Message) => void
    onReplyMessage?: (message: Message) => void
    onSelectMessage?: (message: Message) => void
    onForwardMessage?: (message: Message) => void
    isSelectionMode?: boolean
    selectedMessages?: Message[]
    chatName?: string
    searchQuery?: string
    currentMatchIndex?: number | null
    onSearchMatchesFound?: (count: number) => void
    onSearchNavigate?: (index: number) => void
}>) {
    const { messages: wsMessages } = useWebSocket()

    /** Ref на контейнер списка для поиска DOM-элементов сообщений по uid */
    const listRef = useRef<HTMLUListElement>(null)

    /**
     * Прокрутка к сообщению по uid с подсветкой.
     *
     * Используется при клике по карточке цитаты (RepliedMessage):
     * находим li[data-message-uid] в DOM, прокручиваем к нему
     * и добавляем кратковременную подсветку для визуального акцента.
     *
     * Vercel pattern (rerender-functional-setstate):
     * useCallback без зависимостей — стабильная ссылка, не вызывает
     * ререндер дочерних компонентов при передаче через props.
     */
    const handleNavigateToMessage = useCallback(
        (uid: string) => {
            if (!listRef.current) return

            const target = listRef.current.querySelector(
                `[data-message-uid="${CSS.escape(uid)}"]`,
            )
            if (!target) return

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })

            // Кратковременная подсветка целевого сообщения
            const bubble = target.querySelector(
                '[data-message-bubble]',
            )
            if (bubble) {
                bubble.classList.add(
                    'ring-2',
                    'ring-system-blue',
                    'shadow-lg',
                    'shadow-system-blue/25',
                )
                setTimeout(() => {
                    bubble.classList.remove(
                        'ring-2',
                        'ring-system-blue',
                        'shadow-lg',
                        'shadow-system-blue/25',
                    )
                }, 1500)
            }
        },
        [],
    )

    // Фильтрация сообщений по chatKey текущего чата.
    // В режиме USE_MOCK отключена — все сообщения отображаются для отладки.
    // Объединение: API-сообщения + WebSocket (избегайте дубликатов по uid)
    const allMessages = useMemo(() => {
        const combined = [...apiMessages, ...wsMessages]
        const unique = combined.filter(
            (msg, index, self) =>
                index ===
                self.findIndex((m) => m.uid === msg.uid),
        )
        return unique.sort(
            (a, b) =>
                (a.created_at || 0) - (b.created_at || 0),
        ) // Сортировка по времени
    }, [apiMessages, wsMessages])

    // Фильтрация по chatKey (уберите USE_MOCK после тестирования)
    const chatMessages = useMemo(() => {
        const filtered = allMessages.filter((msg) => {
            if (msg.chatKey === chatKey) return true
            if (!isTemporary || !contactUid) return false

            return (
                msg.toUserId === contactUid ||
                msg.from_user === contactUid
            )
        })

        console.debug('[MessagesList] filter', {
            chatKey,
            isTemporary,
            contactUid,
            total: allMessages.length,
            filtered: filtered.length,
        })

        return filtered
    }, [allMessages, chatKey, isTemporary, contactUid])

    // --- Логика поиска по сообщениям ---

    /**
     * Вычисляем индексы сообщений, совпадающих с поисковым запросом.
     *
     * Возвращает массив индексов в порядке снизу вверх (индекс 0 = самое новое совпадение).
     * Это соответствует дизайну Telegram где поиск начинается с последних сообщений.
     *
     * Vercel pattern (rerender-dependencies):
     * - useMemo для кеширования дорогих вычислений
     * - Примитивные зависимости: массив chatMessages и строка searchQuery
     * - Пересчёт только при изменении сообщений или запроса
     *
     */
    const matchingMessageIndices = useMemo(() => {
        if (!searchQuery.trim()) return []

        return chatMessages
            .map((msg, index) => ({
                index,
                // Простой case-insensitive поиск подстроки
                matches: msg.content
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
            }))
            .filter((item) => item.matches)
            .map((item) => item.index)
    }, [chatMessages, searchQuery])

    /**
     * Уведомляем родителя (ChatRoom) о количестве найденных результатов.
     * ChatRoom использует это для:
     * 1. Обновления счётчика в InChatSearch ("X из Y")
     * 2. Автоматической установки currentMatchIndex при первом результате
     *
     * Используем useEffect потому что это side effect (вызов setState родителя).
     * React запрещает setState во время рендера дочернего компонента.
     *
     *
     * Зависимости оптимизированы (rerender-dependencies):
     * - matchingMessageIndices.length (примитив) вместо массива
     * - onSearchMatchesFound стабилен (useCallback в родителе)
     */
    useEffect(() => {
        if (onSearchMatchesFound) {
            onSearchMatchesFound(
                matchingMessageIndices.length,
            )
        }
    }, [
        matchingMessageIndices.length,
        onSearchMatchesFound,
    ])

    return (
        <section
            role="log"
            aria-label="История сообщений"
            aria-live="polite"
            className="flex h-full w-full flex-col"
        >
            {chatMessages.length === 0 ? (
                <div
                    className={`
                      flex h-full flex-col items-center justify-center
                      text-text-gray
                    `}
                    role="status"
                    aria-label="Пустой чат"
                >
                    <Image
                        height="200"
                        width="200"
                        src="/img_frog_Web.svg"
                        alt=""
                        aria-hidden="true"
                    />
                    <p className="text-lg font-medium">
                        Сообщений пока нет
                    </p>
                    <p className="text-sm">
                        Напишите первым :)
                    </p>
                </div>
            ) : (
                <ul
                    ref={listRef}
                    className="flex flex-col gap-2 p-4"
                >
                    {chatMessages.map((message, index) => {
                        const matchIndex =
                            matchingMessageIndices.indexOf(
                                index,
                            )
                        const isMatch = matchIndex !== -1
                        const isCurrentMatch =
                            currentMatchIndex !== null &&
                            matchIndex === currentMatchIndex

                        /**
                         * Логика вставки DateDivider между группами сообщений разных дней.
                         *
                         * Разделитель показывается, когда:
                         * 1. У сообщения есть created_at (без даты разделитель бессмысленен)
                         * 2. Это первое сообщение в списке (index === 0) — всегда
                         *    показываем дату начала переписки
                         * 3. Или дата текущего сообщения отличается от даты предыдущего —
                         *    началась новая календарная дата, нужен визуальный разделитель
                         *
                         * Проверка выполняется за O(1) — сравниваются только два соседних
                         * сообщения, без предварительного группирования всего массива.
                         */
                        const showDivider =
                            !!message.created_at &&
                            (index === 0 ||
                                !isSameDay(
                                    chatMessages[index - 1]
                                        .created_at,
                                    message.created_at,
                                ))

                        return (
                            /*
                             * Fragment необходим для рендеринга двух элементов
                             * (DateDivider + li) под одним key без лишнего DOM-узла.
                             * key на Fragment наследуется от message.uid.
                             */
                            <Fragment key={message.uid}>
                                {showDivider && (
                                    <DateDivider
                                        timestampSec={
                                            message.created_at!
                                        }
                                    />
                                )}
                                <li
                                    data-message-uid={
                                        message.uid
                                    }
                                >
                                    <MessageItem
                                        message={message}
                                        onEdit={
                                            onEditMessage
                                        }
                                        onReply={
                                            onReplyMessage
                                        }
                                        onSelect={
                                            onSelectMessage
                                        }
                                        onForward={
                                            onForwardMessage
                                        }
                                        onNavigateToMessage={
                                            handleNavigateToMessage
                                        }
                                        isSelectionMode={
                                            isSelectionMode
                                        }
                                        isSelected={selectedMessages?.some(
                                            (m) =>
                                                m.uid ===
                                                message.uid,
                                        )}
                                        chatName={chatName}
                                        searchQuery={
                                            isMatch
                                                ? searchQuery
                                                : ''
                                        }
                                        isCurrentMatch={
                                            isCurrentMatch
                                        }
                                    />
                                </li>
                            </Fragment>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}
