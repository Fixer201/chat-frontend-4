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
import { useContactsMap } from '@shared/hooks/useContactsMap'

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
    onCall,
    isSearchOpen = false,
    searchQuery = '',
    onSearchQueryChange,
    onSearchNavigate,
    onSearchClose,
    currentMatchIndex,
    totalSearchResults = 0,
    onSidebarOpen,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
    onSearchOpen?: () => void
    onCall?: () => void
    isSearchOpen?: boolean
    searchQuery?: string
    onSearchQueryChange?: (query: string) => void
    onSearchNavigate?: (direction: 'up' | 'down') => void
    onSearchClose?: () => void
    currentMatchIndex?: number | null
    totalSearchResults?: number
    onSidebarOpen?: (contact: Contact) => void
}>) {
    // Группы и каналы используют отдельную логику отображения
    const isGroupOrChannel = chat.chatType !== 'chat'

    // Данные контакта загружаются только для личных чатов
    const {
        data: contactData,
        loading,
        error,
    } = useContactData(
        !isGroupOrChannel && chat.chat.uid
            ? chat.chat.uid
            : '',
    )
    const contactsMap = useContactsMap()
    const contactMatch = !isGroupOrChannel
        ? contactsMap.get(chat.chat.uid)
        : undefined

    // Контакт для личного чата: список контактов → API → fallback на chat.chat
    const currentContact: Contact | null = useMemo(() => {
        if (!isGroupOrChannel) {
            return (
                contactMatch ||
                contactData ||
                ({
                    ...chat.chat,
                    userUid: chat.chat.uid,
                } as Contact)
            )
        }
        return null
    }, [
        isGroupOrChannel,
        contactMatch,
        contactData,
        chat.chat,
    ])

    // Имя в шапке: для групп — chat.name, для личных — данные контакта
    const displayName = isGroupOrChannel
        ? chat.name || 'Группа'
        : `${currentContact?.firstName || ''} ${currentContact?.lastName || ''}`.trim() ||
          currentContact?.nickname ||
          currentContact?.phone ||
          currentContact?.username ||
          'Контакт'

    // Аватар: для групп — из объекта чата, для личных — из контакта
    const avatarData = isGroupOrChannel
        ? chat.chat
        : currentContact || chat.chat

    // Подпись: для групп — кол-во участников, для личных — онлайн-статус
    const secondaryText = useMemo(() => {
        if (isGroupOrChannel) {
            const count = chat.participants?.length ?? 0
            if (count === 0) return chat.description || ''
            const lastTwo = count % 100
            const lastOne = count % 10
            if (lastTwo >= 11 && lastTwo <= 19)
                return `${count} участников`
            if (lastOne === 1) return `${count} участник`
            if (lastOne >= 2 && lastOne <= 4)
                return `${count} участника`
            return `${count} участников`
        }
        return currentContact
            ? getStatusText(currentContact, '')
            : ''
    }, [
        isGroupOrChannel,
        chat.participants,
        chat.description,
        currentContact,
    ])

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
                <div
                    className="flex flex-row items-center gap-4"
                    onKeyDown={(e) => {
                        if (
                            (e.key === 'Enter' ||
                                e.key === ' ') &&
                            currentContact
                        ) {
                            onSidebarOpen?.(currentContact)
                        }
                    }}
                    onClick={() =>
                        currentContact &&
                        onSidebarOpen?.(currentContact)
                    }
                    role="button"
                >
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
                    <Image
                        src={getAvatarSrc(avatarData)}
                        width={40}
                        height={40}
                        alt={displayName}
                        className={`
                          cursor-pointer rounded-full transition-opacity
                          hover:opacity-80
                        `}
                        unoptimized
                    />

                    <div className="flex min-w-0 flex-col">
                        <h2 className="truncate font-semibold">
                            {displayName}
                        </h2>
                        <p className="text-sm text-text-gray">
                            {!isGroupOrChannel && loading
                                ? 'Загрузка...'
                                : !isGroupOrChannel && error
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
                            onClick={onCall}
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
