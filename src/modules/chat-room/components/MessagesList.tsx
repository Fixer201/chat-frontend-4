'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'
import { useMemo } from 'react'

// Флаг для отображения всех моковых сообщений независимо от chatKey
const USE_MOCK = true // TODO: удалить после реализации контактов

export default function MessagesList({
    chatKey,
}: Readonly<{
    chatKey: string
}>) {
    const { messages } = useWebSocket()

    // Фильтруем сообщения только для текущего чата
    // В режиме моков показываем все сообщения для демонстрации верстки
    const chatMessages = useMemo(
        () =>
            USE_MOCK
                ? messages
                : messages.filter(
                      (msg) => msg.chatKey === chatKey,
                  ),
        [messages, chatKey],
    )

    console.log(chatMessages)

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
                        alt="Иллюстрация пустого чата"
                        aria-hidden="false"
                    />
                    <p className="text-lg font-medium">
                        Сообщений пока нет
                    </p>
                    <p className="text-sm">
                        Напишите первым :)
                    </p>
                </div>
            ) : (
                // Список сообщений
                <ul className="flex flex-col gap-2 p-4">
                    {chatMessages.map((message) => (
                        <li key={message.uid}>
                            <MessageItem
                                message={message}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
