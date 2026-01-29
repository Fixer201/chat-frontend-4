import Image from 'next/image'
import { ChatItem } from '@shared/types/chat'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { useEffect, useState } from 'react'
import { getStatusText } from '@shared/lib/getStatusText'

export default function ChatHeader({
    chat,
    onBack,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
}>) {
    const [secondaryText, setSecondaryText] = useState('')
    useEffect(() => {
        // Вычисляем secondaryText на клиенте после гидрации для избежания mismatch.
        // getStatusText() использует getContactWebStatus(), который зависит от new Date(),
        // поэтому значение будет разным на сервере (SSR) и клиенте.
        // useEffect гарантирует, что вычисление происходит ТОЛЬКО после гидрации.
        const text = getStatusText(chat.chat, '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondaryText(text)
    }, [chat])

    return (
        <section
            className={`
              rounded-t-md border-b border-gray-border bg-gray-light px-3 py-2
              md:px-4
            `}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-row items-center gap-4">
                    {/* Back button for mobile */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            aria-label="Back to chats"
                            className="md:hidden"
                            type="button"
                        >
                            <Image
                                src="/images/login/back.svg"
                                width={24}
                                height={24}
                                alt=""
                            />
                        </button>
                    )}
                    <Image
                        src={getAvatarSrc(chat.chat)}
                        width={40}
                        height={40}
                        alt={
                            chat.chat.firstName +
                            ' ' +
                            chat.chat.lastName
                        }
                        className="rounded-full"
                        unoptimized
                    />

                    <div className="flex min-w-0 flex-col">
                        {/* User Full Name */}
                        <h2 className="truncate font-semibold">
                            {chat.chat.firstName}{' '}
                            {chat.chat.lastName}
                        </h2>
                        <p className="text-sm text-text-gray">
                            {secondaryText}
                        </p>
                    </div>
                </div>
                <div
                    className={`
                  flex gap-1
                  md:gap-2
                `}
                >
                    {/* Кнопки поиска, звонка и т.д. */}
                    <div
                        className={`
                      flex gap-2 text-text-gray
                      md:gap-4
                    `}
                    >
                        <button
                            aria-label="Search in chat"
                            className="cursor-pointer"
                            type="button"
                        >
                            <Image
                                src="/images/chatHeader/Search.svg"
                                height="20"
                                width="20"
                                alt=""
                            />
                        </button>
                        <button
                            aria-label="Call"
                            className="cursor-pointer"
                            type="button"
                        >
                            <Image
                                src="/images/chatHeader/Phone.svg"
                                height="20"
                                width="20"
                                alt=""
                            />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
