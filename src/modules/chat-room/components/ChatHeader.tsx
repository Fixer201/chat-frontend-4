// @modules/chat-room/components/ChatHeader.tsx
import Image from 'next/image'
import { ChatItem } from '@shared/types/chat'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { useMemo } from 'react'
import { getStatusText } from '@shared/lib/getStatusText'
import InChatSearch from '@modules/search/components/InChatSearch'

import {
    useContactData,
    Contact,
} from '@shared/hooks/useContactData'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'

/**
 * Шапка чата — аватар, имя собеседника, статус онлайн и кнопки действий.
 *
 * Статус (secondaryText) вычисляется в useMemo, чтобы избежать гидрации
 * с разными значениями от new Date() на сервере и клиенте.
 *
 * Кнопка «Назад» видна только на мобильных устройствах (md:hidden)
 * и передаётся через опциональный колбэк onBack.
 *
 * Режим поиска: при isSearchOpen === true отображает InChatSearch вместо обычной шапки.
 */
export default function ChatHeader({
    chat,
    onBack,
    onSearchOpen,
    isSearchOpen = false,
    searchQuery = '',
    onSearchQueryChange,
    onSearchNavigate,
    onSearchClose,
    currentMatchIndex,
    totalSearchResults = 0,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
    onSearchOpen?: () => void
    isSearchOpen?: boolean
    searchQuery?: string
    onSearchQueryChange?: (query: string) => void
    onSearchNavigate?: (direction: 'up' | 'down') => void
    onSearchClose?: () => void
    currentMatchIndex?: number | null
    totalSearchResults?: number
}>) {
    // Получаем свежие данные контакта по UID (теперь типа Contact)
    const shouldLoadData =
        chat.chatType === 'chat' && chat.chat.uid
    const {
        data: contactData,
        loading,
        error,
    } = useContactData(shouldLoadData ? chat.chat.uid : '')
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )
    const contactMatch = contactsList.find(
        (contact) =>
            contact.userUid === chat.chat.uid ||
            contact.uid === chat.chat.uid,
    )

    // Используем данные из API или fallback на chat.chat (с добавлением userUid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentContact: Contact =
        contactMatch ||
        contactData ||
        ({
            ...chat.chat,
            userUid: chat.chat.uid, // Добавляем userUid (UID пользователя)
        } as Contact)

    // Вычисляем secondaryText декларативно с useMemo (на клиенте после гидрации)
    const secondaryText = useMemo(() => {
        return getStatusText(currentContact, '')
    }, [currentContact])

    /**
     * Условный рендеринг: режим поиска vs обычная шапка.
     *
     * При isSearchOpen === true:
     * - Скрываем аватар, имя, статус, кнопки
     * - Показываем InChatSearch с полем поиска и навигацией
     * - Сохраняем те же размеры и границы для плавного перехода
     *
     * Fallback пустые функции (|| (() => {})) защищают от undefined
     * при вызове колбэков, хотя TypeScript их помечает как optional.
     */
    if (isSearchOpen) {
        return (
            <section
                className={`
                  rounded-t-md border-b border-gray-border bg-gray-light
                `}
            >
                <InChatSearch
                    searchQuery={searchQuery}
                    onChange={
                        onSearchQueryChange || (() => {})
                    }
                    onNavigate={
                        onSearchNavigate || (() => {})
                    }
                    onClose={onSearchClose || (() => {})}
                    currentIndex={currentMatchIndex || null}
                    totalResults={totalSearchResults}
                    avatarSrc={getAvatarSrc(chat.chat)}
                />
            </section>
        )
    }

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
                            {`${currentContact.firstName || ''} ${currentContact.lastName || ''}`.trim() ||
                                currentContact.nickname ||
                                currentContact.phone ||
                                currentContact.username ||
                                'Контакт'}
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
                            onClick={onSearchOpen}
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
