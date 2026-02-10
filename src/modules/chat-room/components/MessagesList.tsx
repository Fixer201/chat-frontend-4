'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'
import {
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
 * Семантика: section[role="log"] с aria-live="polite" для экранных читалок,
 * обновляющий контент без прерывания текущей озвучки.
 */

// Временный флаг: показывать все сообщения без фильтрации по chatKey.
// Используется на этапе разработки, пока не реализована полноценная логика контактов.
const USE_MOCK = true // TODO: удалить после реализации контактов

export default function MessagesList({
    chatKey,
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
    const { messages } = useWebSocket()

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
    const chatMessages = useMemo(
        () =>
            USE_MOCK
                ? messages
                : messages.filter(
                      (msg) => msg.chatKey === chatKey,
                  ),
        [messages, chatKey],
    )

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

                        return (
                            <li
                                key={message.uid}
                                data-message-uid={
                                    message.uid
                                }
                            >
                                <MessageItem
                                    message={message}
                                    onEdit={onEditMessage}
                                    onReply={onReplyMessage}
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
                        )
                    })}
                </ul>
            )}
        </section>
    )
}
