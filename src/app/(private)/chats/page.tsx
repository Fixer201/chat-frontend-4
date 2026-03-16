'use client'

import {
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatRoom from '@modules/chat-room/components/ChatRoom'
import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'
import ChatInfoSidebar from '@modules/groupInfo/ChatInfoSidebar'
import { useChats } from '@shared/hooks/useChats'
import { cn } from '@shared/lib/utils'

/** Количество чатов, загружаемых при первом рендере страницы */
const INITIAL_CHATS_COUNT = 15

/**
 * Главная страница чатов.
 *
 * Адаптивный макет с тремя колонками:
 * - Мобильные устройства: отображается либо список чатов, либо открытый чат (на весь экран).
 * - Десктоп (md+): все три колонки видны в зависимости от состояния (список, чат/заглушка, информация о чате).
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
    const router = useRouter()
    const processedContactIdRef = useRef<string | null>(
        null,
    )
    const chatsRef = useRef(chats)
    const hasRequestedChatsRef = useRef(false)
    // Трекаем переход loading: true → false (запрос ушёл и вернулся)
    const wasLoadingRef = useRef(false)
    const hasChatsLoadedRef = useRef(false)

    // Состояние для боковой панели информации о чате
    const [infoPanelChatId, setInfoPanelChatId] = useState<
        number | null
    >(null)

    const handleOpenInfoPanel = useCallback(
        (chatId: number) => {
            selectChat(chatId) // выделяем чат в списке
            setInfoPanelChatId(chatId) // открываем панель
        },
        [selectChat],
    )

    const handleCloseInfoPanel = useCallback(() => {
        setInfoPanelChatId(null)
    }, [])

    // Обновлять ref при изменении chats
    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    useEffect(() => {
        if (loading) {
            wasLoadingRef.current = true
        }
        if (!loading && wasLoadingRef.current) {
            hasChatsLoadedRef.current = true
        }
    }, [loading])

    /** Загрузка начального списка чатов при монтировании компонента */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedChats =
                window.localStorage.getItem('localChats')
            if (storedChats) {
                try {
                    const parsedChats =
                        JSON.parse(storedChats)
                    if (Array.isArray(parsedChats)) {
                        // Убираем временные чаты (chat_key_0), чтобы не восстанавливать их после reload.
                        const cleanedChats =
                            parsedChats.filter((chat) => {
                                const chatKey =
                                    chat?.chatKey ||
                                    chat?.chat_key
                                return (
                                    chatKey !== 'chat_key_0'
                                )
                            })
                        if (
                            cleanedChats.length !==
                            parsedChats.length
                        ) {
                            window.localStorage.setItem(
                                'localChats',
                                JSON.stringify(
                                    cleanedChats,
                                ),
                            )
                        }
                        hydrateChats(cleanedChats)
                    }
                } catch (error) {
                    console.warn(
                        'Не удалось прочитать localChats:',
                        error,
                    )
                }
            }
        }
        loadChats('', INITIAL_CHATS_COUNT)
        hasRequestedChatsRef.current = true
    }, [loadChats, hydrateChats])

    /** Обработка query-параметра contactId для создания/выбора чата */
    useEffect(() => {
        const contactId = searchParams.get('contactId')
        if (!contactId || loading) return
        if (!hasChatsLoadedRef.current) return

        if (contactId === processedContactIdRef.current)
            return

        processedContactIdRef.current = contactId

        const existingChat = chats.find(
            (chat) =>
                chat.chat.uid === contactId ||
                chat.tempContactUid === contactId,
        )
        if (existingChat) {
            selectChat(existingChat.id)
            // Убираем contactId из URL, чтобы reload не пересоздавал временный чат.
            router.replace('/chats')
            return
        }

        createChat(contactId)
            .then((newChat) => {
                selectChat(newChat.chat.id)
                // Сразу чистим URL после создания.
                router.replace('/chats')
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
        router,
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

    /** Общие стили для колонок макета */
    const panelStyles =
        'rounded-md border border-app-divider bg-gray-main'

    /**
     * Контент средней колонки:
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
        <div className="flex h-full w-full gap-6">
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
                <ChatsListWrapper
                    onOpenInfoPanel={handleOpenInfoPanel}
                />
            </div>

            {/* Средняя колонка - комната чата или пустое состояние */}
            <div
                className={cn(
                    //  panelStyles,
                    'min-w-0 flex-1', // min-w-0 позволяет flex-элементу корректно занимать всю ширину
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

            {/* Правая колонка - информация о выбранном чате (только на десктопе) */}
            {infoPanelChatId !== null && (
                <div
                    className={cn(
                        panelStyles,
                        `
                          hidden shrink-0
                          md:block md:w-80
                          lg:w-96
                        `,
                    )}
                >
                    <ChatInfoSidebar
                        onClose={handleCloseInfoPanel}
                    />
                </div>
            )}
        </div>
    )
}
