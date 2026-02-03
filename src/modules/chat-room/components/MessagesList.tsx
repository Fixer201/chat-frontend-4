'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'
import { useMemo } from 'react'
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
}: Readonly<{
    chatKey: string
    onEditMessage?: (message: Message) => void
    onReplyMessage?: (message: Message) => void
    onSelectMessage?: (message: Message) => void
    onForwardMessage?: (message: Message) => void
    isSelectionMode?: boolean
    selectedMessages?: Message[]
    chatName?: string
}>) {
    const { messages } = useWebSocket()

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

    return (
        <section
            role="log"
            aria-label="История сообщений"
            aria-live="polite"
            className="flex h-full w-full flex-col"
        >
            {chatMessages.length === 0 ? (
                <div
                    // eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
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
                <ul className="flex flex-col gap-2 p-4">
                    {chatMessages.map((message) => (
                        <li key={message.uid}>
                            <MessageItem
                                message={message}
                                onEdit={onEditMessage}
                                onReply={onReplyMessage}
                                onSelect={onSelectMessage}
                                onForward={onForwardMessage}
                                isSelectionMode={
                                    isSelectionMode
                                }
                                isSelected={selectedMessages?.some(
                                    (m) =>
                                        m.uid ===
                                        message.uid,
                                )}
                                chatName={chatName}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
