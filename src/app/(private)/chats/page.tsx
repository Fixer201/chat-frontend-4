'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ChatRoom from '@modules/chat-room/components/ChatRoom'
import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'
import { useChats } from '@shared/hooks/useChats'
import { cn } from '@shared/lib/utils'

/** Количество чатов, загружаемых при первом рендере страницы */
const INITIAL_CHATS_COUNT = 15

/**
 * Главная страница чатов.
 *
 * Адаптивный макет с двумя колонками:
 * - Мобильные устройства: отображается либо список чатов, либо открытый чат (на весь экран).
 * - Десктоп (md+): обе колонки видны одновременно.
 */
export default function ChatsPage() {
    const {
        chats,
        selectedChatId,
        loadChats,
        selectChat,
        createChat,
    } = useChats()
    const searchParams = useSearchParams()

    /** Загрузка начального списка чатов при монтировании компонента */
    useEffect(() => {
        loadChats(INITIAL_CHATS_COUNT)
    }, [loadChats])

    /** Обработка query-параметра contactId для создания/выбора чата */
    useEffect(() => {
        const contactId = searchParams.get('contactId')
        if (contactId) {
            const existingChat = chats.find(
                (chat) => chat.chat.uid === contactId,
            )
            if (existingChat) {
                selectChat(existingChat.id)
            } else {
                // Создаем новый личный чат локально
                createChat(contactId)
                    .then((newChat) => {
                        selectChat(newChat.chat.id)
                    })
                    .catch((error) => {
                        console.error(
                            'Ошибка создания чата:',
                            error,
                        )
                        // Можно добавить toast: toast.error('Не удалось создать чат')
                    })
            }
        }
    }, [searchParams, chats, selectChat, createChat])

    /** Текущий выбранный чат (undefined - ни один чат не открыт) */
    const selectedChat = chats.find(
        (chat) => chat.id === selectedChatId,
    )

    /**
     * Флаг отображения чата на мобильных устройствах.
     * Когда чат выбран - на мобильном скрывается список и показывается комната чата.
     * На десктопе оба блока видны всегда, поэтому флаг влияет только на mobile-классы.
     */
    const isChatSelected = !!selectedChat

    /** Общие стили для обеих колонок макета */
    const panelStyles =
        'rounded-md border border-app-divider bg-gray-main'

    /**
     * Контент правой колонки:
     * - если чат выбран - отображаем комнату чата с кнопкой «Назад»;
     * - иначе - показываем заглушку с предложением выбрать собеседника.
     */
    const chatContent = selectedChat ? (
        <ChatRoom
            chat={selectedChat}
            onBack={() => selectChat(null)}
        />
    ) : (
        <EmptyChatState />
    )

    return (
        <div
            className={`
              flex h-full w-full gap-2
              md:gap-6
            `}
        >
            {/* Левая колонка - список чатов и формы создания групп/каналов */}
            <div
                className={cn(
                    panelStyles,
                    `
                      w-full
                      md:w-80
                      lg:w-96
                    `,
                    isChatSelected
                        ? `
                          hidden
                          md:block
                        `
                        : 'block',
                )}
            >
                <ChatsListWrapper />
            </div>

            {/* Правая колонка - комната чата или пустое состояние */}
            <div
                className={cn(
                    panelStyles,
                    'flex-1',
                    isChatSelected
                        ? 'block'
                        : `
                          hidden
                          md:block
                        `,
                )}
            >
                {chatContent}
            </div>
        </div>
    )
}
