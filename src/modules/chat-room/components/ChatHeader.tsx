/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
// @modules/chat-room/components/ChatHeader.tsx
import Image from 'next/image'
import { ChatItem } from '@shared/types/chat'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { useMemo } from 'react'
import { getStatusText } from '@shared/lib/getStatusText'
import {
    useContactData,
    Contact,
} from '@shared/hooks/useContactData'

/**
 * Шапка чата — аватар, имя собеседника, статус онлайн и кнопки действий.
 *
 * Данные контакта берутся из API для актуальности.
 * secondaryText вычисляется декларативно с useMemo, чтобы избежать setState в эффекте.
 */
export default function ChatHeader({
    chat,
    onBack,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
}>) {
    // Получаем свежие данные контакта по UID (теперь типа Contact)
    const shouldLoadData =
        chat.chatType === 'chat' && chat.chat.uid
    const {
        data: contactData,
        loading,
        error,
    } = useContactData(shouldLoadData ? chat.chat.uid : '')

    // Используем данные из API или fallback на chat.chat (с добавлением userUid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentContact: Contact =
        contactData ||
        ({
            ...chat.chat,
            userUid: chat.chat.uid, // Добавляем userUid (UID пользователя)
        } as Contact)

    // Вычисляем secondaryText декларативно с useMemo (на клиенте после гидрации)
    const secondaryText = useMemo(() => {
        return getStatusText(currentContact, '')
    }, [currentContact])

    return (
        <section
            className={`
              rounded-t-md border-b border-gray-border bg-gray-light px-3 py-2
              md:px-4
            `}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-row items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            aria-label="Back to chats"
                            className={`
                              cursor-pointer rounded-lg p-1 transition-colors
                              hover:bg-gray-main
                              focus-visible:outline-2
                              focus-visible:outline-accent-violet-primary
                              active:scale-95
                              md:hidden
                            `}
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
                    {/* Аватар: используем currentContact */}
                    <Image
                        src={getAvatarSrc(currentContact)}
                        width={40}
                        height={40}
                        alt={
                            currentContact.firstName +
                            ' ' +
                            currentContact.lastName
                        }
                        className={`
                          cursor-pointer rounded-full transition-opacity
                          hover:opacity-80
                        `}
                        unoptimized
                    />

                    <div className="flex min-w-0 flex-col">
                        {/* Имя: используем currentContact */}
                        <h2 className="truncate font-semibold">
                            {currentContact.firstName}{' '}
                            {currentContact.lastName}
                        </h2>
                        <p className="text-sm text-text-gray">
                            {loading
                                ? 'Загрузка...'
                                : error
                                  ? 'Ошибка'
                                  : secondaryText}
                        </p>
                    </div>
                </div>
                <div
                    className={`
                      flex gap-1
                      md:gap-2
                    `}
                >
                    <div
                        className={`
                          flex gap-2 text-text-gray
                          md:gap-4
                        `}
                    >
                        <button
                            aria-label="Search in chat"
                            className={`
                              cursor-pointer rounded-lg p-1 transition-colors
                              hover:bg-gray-main
                              focus-visible:outline-2
                              focus-visible:outline-accent-violet-primary
                              active:scale-95
                            `}
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
                            className={`
                              cursor-pointer rounded-lg p-1 transition-colors
                              hover:bg-gray-main
                              focus-visible:outline-2
                              focus-visible:outline-accent-violet-primary
                              active:scale-95
                            `}
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
