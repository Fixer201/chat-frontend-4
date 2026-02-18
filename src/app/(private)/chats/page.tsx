'use client'

import { useEffect, useRef } from 'react'
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
        loading,
        selectedChatId,
        loadChats,
        selectChat,
        createChat,
        hydrateChats,
    } = useChats()
    const searchParams = useSearchParams()
    const processedContactIdRef = useRef<string | null>(
        null,
    )
    const chatsRef = useRef(chats)
    const hasLoadedChatsRef = useRef(false)
    const hasRequestedChatsRef = useRef(false)

    // Обновлять ref при изменении chats
    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    useEffect(() => {
        if (!loading && hasRequestedChatsRef.current) {
            hasLoadedChatsRef.current = true
        }
    }, [loading])

    /**
     * Загрузка начального списка чатов при монтировании компонента.
     *
     * Важно: передаём пустой search, а count — отдельным параметром,
     * чтобы не интерпретировать число как строку поиска (из-за этого
     * ранее список был пустым до первого WebSocket события).
     */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedChats =
                window.localStorage.getItem('localChats')
            if (storedChats) {
                try {
                    const parsedChats =
                        JSON.parse(storedChats)
                    if (Array.isArray(parsedChats)) {
                        hydrateChats(parsedChats)
                    }
                } catch (error) {
                    console.warn(
                        'Не удалось прочитать localChats:',
                        error,
                    )
                }
            }
        }
        // hydrateChats — локальные временные чаты (созданные оффлайн/через контакты)
        // loadChats — реальный список с сервера
        loadChats('', INITIAL_CHATS_COUNT)
        hasRequestedChatsRef.current = true
    }, [loadChats, hydrateChats])

    /**
     * Обработка query-параметра contactId для создания/выбора чата.
     * Если чат с этим пользователем уже есть — просто выбираем.
     * Иначе создаём временный локальный чат и потом он будет синхронизирован.
     */
    useEffect(() => {
        const contactId = searchParams.get('contactId')
        if (!contactId || loading) return
        if (!hasLoadedChatsRef.current) return

        if (contactId === processedContactIdRef.current)
            return

        console.log('Обработка contactId из URL', contactId)
        processedContactIdRef.current = contactId

        const existingChat = chats.find(
            (chat) => chat.chat.uid === contactId,
        )
        console.log(
            'Найден существующий чат:',
            existingChat,
        )

        if (existingChat) {
            selectChat(existingChat.id)
            console.log(
                'Выбран существующий идентификатор чата:',
                existingChat.id,
            )
            return
        }

        createChat(contactId)
            .then((newChat) => {
                console.log('Новый чат создан:', newChat)
                selectChat(newChat.chat.id)
                console.log(
                    'создание нового chat ID:',
                    newChat.chat.id,
                )
            })
            .catch((error) => {
                console.error(
                    'Ошибка создания чата:',
                    error,
                )
            })
    }, [
        searchParams,
        chats,
        loading,
        selectChat,
        createChat,
    ])

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
