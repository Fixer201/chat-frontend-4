'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'
import { useMemo, useState } from 'react'
import { Message } from '@shared/types/message'

// Флаг для отображения всех моковых сообщений независимо от chatKey
const USE_MOCK = true // TODO: удалить после реализации контактов

export default function MessagesList({
    chatKey,
    onEditMessage,
}: Readonly<{
    chatKey: string
    onEditMessage?: (message: Message) => void
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
                // Список сообщений
                <ul className="flex flex-col gap-2 p-4">
                    {chatMessages.map((message) => (
                        <li key={message.uid}>
                            <MessageItem
                                message={message}
                                onEdit={onEditMessage}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
