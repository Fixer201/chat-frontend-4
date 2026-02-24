import { useCallback } from 'react'
import {
    useAppDispatch,
    useAppSelector,
} from '../../redux/store'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import {
    fetchChats,
    hydrateLocalChats,
    setSelectedChat,
    updateChat,
    updateChatSettings,
    toggleFavorite,
    toggleNotifications,
    markAsRead,
    markAsUnread,
    markAsDeleted,
    addToContacts,
    resetChatSettings,
    createGroup as createGroupAction,
    createChannel as createChannelAction,
    createChat as createChatAction,
} from '../../redux/slices/chatsSlice'
import { ChatItem, ChatSettings } from '../types/chat'
import { Contact } from '../types/contact'
import { onNextProps } from '../types/createGroup'

// Кастомный хук для работы с чатами
// Абстрагирует взаимодействие с Redux store, предоставляя простой API для компонентов
export const useChats = () => {
    const dispatch = useAppDispatch()
    const fetchData = useApiFetcher()
    const LOCAL_CHATS_STORAGE_KEY = 'localChats'
    const LOCAL_CHAT_ID_THRESHOLD = 1000000000000

    // Селекторы для получения данных из состояния чатов
    const {
        items,
        loading,
        error,
        selectedChatId,
        chatSettings,
    } = useAppSelector((state) => state.chats)

    // Загрузка списка чатов

    const loadChats = useCallback(
        (search: string = '', count: number = 20) => {
            dispatch(fetchChats({ search, count }))
        },
        [dispatch],
    )

    // Выбор чата по ID
    const selectChat = useCallback(
        (chatId: number | null) => {
            dispatch(setSelectedChat(chatId))
        },
        [dispatch],
    )

    // Гидрация локально сохранённых чатов
    const hydrateChats = useCallback(
        (
            chats: Array<
                ChatItem & { settings?: ChatSettings }
            >,
        ) => {
            dispatch(hydrateLocalChats(chats))
        },
        [dispatch],
    )

    // Обновление данных чата
    const updateChatData = useCallback(
        (chat: ChatItem) => {
            dispatch(updateChat(chat))
        },
        [dispatch],
    )

    // Обновление настроек чата
    const updateChatSettingsData = useCallback(
        (
            chatId: number,
            settings: Partial<ChatSettings>,
        ) => {
            dispatch(
                updateChatSettings({ chatId, settings }),
            )
        },
        [dispatch],
    )

    // Переключение статуса "Избранное"
    const toggleFavoriteChat = useCallback(
        (chatId: number) => {
            dispatch(toggleFavorite(chatId))
        },
        [dispatch],
    )

    // Переключение настроек уведомлений
    const toggleChatNotifications = useCallback(
        (chatId: number) => {
            dispatch(toggleNotifications(chatId))
        },
        [dispatch],
    )

    // Пометка чата как прочитанного
    const markChatAsRead = useCallback(
        (chatId: number) => {
            dispatch(markAsRead(chatId))
        },
        [dispatch],
    )

    const markChatAsReadOnServer = useCallback(
        async (
            chatId: number,
            lastSeenMessageId?: number,
        ) => {
            if (!lastSeenMessageId) return

            try {
                await fetchData(
                    `https://api.test.chat.ktsf.ru/api/v1/chat/list/${chatId}/`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            last_seen_message:
                                lastSeenMessageId,
                        }),
                    },
                )
            } catch (error) {
                console.warn(
                    'Не удалось обновить статус прочитанного:',
                    error,
                )
            }
        },
        [fetchData],
    )

    // Пометка чата как непрочитанного
    const markChatAsUnread = useCallback(
        (chatId: number) => {
            dispatch(markAsUnread(chatId))
        },
        [dispatch],
    )

    // Мягкое удаление чата (помечаем как удаленный)
    // Удаляем чат на сервере и помечаем локально удалённым (для локальных чатов — чистим localStorage)
    const deleteChat = useCallback(
        async (chatId: number) => {
            const chat = items.find(
                (item) => item.id === chatId,
            )

            if (!chat) {
                return
            }

            if (
                chat.id > LOCAL_CHAT_ID_THRESHOLD ||
                chat.isTemporary
            ) {
                if (typeof window !== 'undefined') {
                    try {
                        const storedChats =
                            window.localStorage.getItem(
                                LOCAL_CHATS_STORAGE_KEY,
                            )
                        const parsedChats = storedChats
                            ? (JSON.parse(
                                  storedChats,
                              ) as ChatItem[])
                            : []
                        const filtered = parsedChats.filter(
                            (item) => item.id !== chatId,
                        )
                        window.localStorage.setItem(
                            LOCAL_CHATS_STORAGE_KEY,
                            JSON.stringify(filtered),
                        )
                    } catch (error) {
                        console.warn(
                            'Не удалось обновить localChats:',
                            error,
                        )
                    }
                }
                dispatch(markAsDeleted(chatId))
                return
            }

            await fetchData(
                `https://api.test.chat.ktsf.ru/api/v1/chat/list/${chatId}/`,
                { method: 'DELETE' },
            )
            dispatch(markAsDeleted(chatId))
        },
        [dispatch, fetchData, items],
    )

    // Добавление чата в список контактов
    const addChatToContacts = useCallback(
        (chatId: number) => {
            dispatch(addToContacts(chatId))
        },
        [dispatch],
    )

    // Сброс всех настроек чатов
    const resetAllChatSettings = useCallback(() => {
        dispatch(resetChatSettings())
    }, [dispatch])

    // Получение настроек конкретного чата
    const getChatSettings = useCallback(
        (chatId: number): ChatSettings | undefined => {
            // Исправил: добавьте undefined, если не найдено
            return chatSettings[chatId]
        },
        [chatSettings],
    )

    // Получение полной информации о чате с его настройками
    const getChatWithSettings = useCallback(
        (chatId: number) => {
            const chat = items.find((c) => c.id === chatId)
            const settings = chatSettings[chatId]

            if (!chat) return null

            return {
                ...chat,
                settings: settings || {
                    isFavorite: chat.isFavorite || false,
                    isChatRead: chat.newMessageCount === 0,
                    notificationsEnabled:
                        chat.notifications ?? true,
                    isDeleted: false,
                    originalUnreadCount:
                        chat.newMessageCount || 0,
                },
            }
        },
        [items, chatSettings],
    )

    // Создание нового личного чата
    const createChat = useCallback(
        (toUserId: string) => {
            return dispatch(
                createChatAction(toUserId),
            ).unwrap()
        },
        [dispatch],
    )

    // Создание новой группы
    const createGroup = useCallback(
        (groupData: onNextProps, members: Contact[]) => {
            return dispatch(
                createGroupAction({ groupData, members }),
            )
        },
        [dispatch],
    )

    // Создание нового канала
    const createChannel = useCallback(
        (channelData: onNextProps, members: Contact[]) => {
            return dispatch(
                createChannelAction({
                    channelData,
                    members,
                }),
            )
        },
        [dispatch],
    )

    // Возвращаемый объект с методами и данными
    return {
        chats: items,
        loading,
        error,
        selectedChatId,
        chatSettings,
        loadChats,
        hydrateChats,
        selectChat,
        updateChat: updateChatData,
        updateChatSettings: updateChatSettingsData,
        toggleFavorite: toggleFavoriteChat,
        toggleNotifications: toggleChatNotifications,
        markAsRead: markChatAsRead,
        markAsReadOnServer: markChatAsReadOnServer,
        markAsUnread: markChatAsUnread,
        deleteChat,
        addToContacts: addChatToContacts,
        resetChatSettings: resetAllChatSettings,
        getChatSettings,
        getChatWithSettings,
        createChat,
        createGroup,
        createChannel,
    }
}
