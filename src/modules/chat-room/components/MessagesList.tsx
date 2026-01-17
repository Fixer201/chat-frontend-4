'use client'

import Image from 'next/image'
import { useWebSocket } from '@shared/context/websocketContext'
import MessageItem from './MessageItem'

export default function MessagesList({
    chatKey,
}: Readonly<{
    chatKey: string
}>) {
    const { messages } = useWebSocket()

    // Фильтруем сообщения только для текущего чата
    const chatMessages = messages.filter(
        (msg) => msg.chatKey === chatKey,
    )

    console.log(chatMessages)

    return (
        <section
            role="log"
            aria-label="История сообщений"
            aria-live="polite"
            className="flex h-full w-full flex-col overflow-y-auto"
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
