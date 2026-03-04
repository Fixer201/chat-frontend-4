import Cookies from 'js-cookie'
import { useCallback, useMemo } from 'react'
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
import { wsChatService } from '../lib/webSocketChatService'

// Кастомный хук для работы с чатами
// Абстрагирует взаимодействие с Redux store, предоставляя простой API для компонентов
export const useChats = () => {
    const dispatch = useAppDispatch()
    const fetchData = useApiFetcher()

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
                    `/api/v1/chat/list/${chatId}/`,
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

    // Мягкое удаление чата (WebSocket -> Redux fallback)
    const deleteChat = useCallback(
        async (chatId: number) => {
            console.log(
                '\n=========================================',
            )
            console.log(
                '[useChats] 🗑️ Starting delete chat process',
            )
            console.log('[useChats] 📝 Chat ID:', chatId)

            // Find chat to get chatKey
            const chat = items.find((c) => c.id === chatId)
            console.log('[useChats] 📊 Found chat:', chat)

            if (!chat) {
                console.error(
                    '[useChats] ❌ Chat not found, using Redux fallback',
                )
                dispatch(markAsDeleted(chatId))
                return
            }

            const accessToken = Cookies.get('access_token')

            // ========== STEP 1: Try WebSocket first ==========
            if (accessToken && chat.chatKey) {
                console.log(
                    '[useChats] 📡 STEP 1: Trying WebSocket...',
                )
                console.log(
                    '[useChats] 🔑 Chat key:',
                    chat.chatKey,
                )

                try {
                    const result =
                        await wsChatService.deleteChat({
                            chat_key: chat.chatKey,
                        })

                    console.log(
                        '[useChats] 📥 WebSocket result:',
                        result,
                    )

                    if (result.success) {
                        console.log(
                            '[useChats] ✅ WebSocket delete success',
                        )
                    } else {
                        console.warn(
                            '[useChats] ⚠️ WebSocket delete failed:',
                            result.error,
                        )
                    }
                } catch (error) {
                    console.error(
                        '[useChats] ❌ WebSocket error:',
                        error,
                    )
                }
            } else {
                console.log(
                    '[useChats] ⏳ No token or chatKey, skipping WebSocket',
                )
            }

            // ========== STEP 2: Always mark as deleted in Redux ==========
            console.log(
                '[useChats] 💾 STEP 2: Marking as deleted in Redux...',
            )
            dispatch(markAsDeleted(chatId))
            console.log('[useChats] ✅ Redux updated')

            console.log(
                '[useChats] 🔐 Delete process finished',
            )
            console.log(
                '=========================================\n',
            )
        },
        [dispatch, items],
    )

    // Leave chat (for groups/channels)
    const leaveChat = useCallback(
        async (chatId: number) => {
            console.log(
                '\n=========================================',
            )
            console.log(
                '[useChats] 🚪 Starting leave chat process',
            )
            console.log('[useChats] 📝 Chat ID:', chatId)

            // Find chat to get chatKey
            const chat = items.find((c) => c.id === chatId)
            console.log('[useChats] 📊 Found chat:', chat)

            if (!chat) {
                console.error(
                    '[useChats] ❌ Chat not found, using Redux fallback',
                )
                dispatch(markAsDeleted(chatId))
                return
            }

            const accessToken = Cookies.get('access_token')

            // ========== STEP 1: Try WebSocket first ==========
            if (accessToken && chat.chatKey) {
                console.log(
                    '[useChats] 📡 STEP 1: Trying WebSocket...',
                )
                console.log(
                    '[useChats] 🔑 Chat key:',
                    chat.chatKey,
                )
                console.log(
                    '[useChats] 👤 Chat name:',
                    chat.name,
                )
                console.log(
                    '[useChats] 📋 Chat type:',
                    chat.chatType,
                )

                try {
                    const result =
                        await wsChatService.leaveChat({
                            chatKey: chat.chatKey,
                        })

                    console.log(
                        '[useChats] 📥 WebSocket result:',
                        result,
                    )

                    if (result.success) {
                        console.log(
                            '[useChats] ✅ WebSocket leave success',
                        )
                    } else {
                        console.warn(
                            '[useChats] ⚠️ WebSocket leave failed:',
                            result.error,
                        )
                        // If error is "not a member", we should still remove from UI
                        if (
                            result.error?.includes(
                                'не состоите',
                            )
                        ) {
                            console.log(
                                '[useChats] ℹ️ User not a member on server, removing from UI anyway',
                            )
                        }
                    }
                } catch (error) {
                    console.error(
                        '[useChats] ❌ WebSocket error:',
                        error,
                    )
                }
            } else {
                console.log(
                    '[useChats] ⏳ No token or chatKey, skipping WebSocket',
                )
            }

            // ========== STEP 2: Always mark as deleted in Redux ==========
            console.log(
                '[useChats] 💾 STEP 2: Marking as deleted in Redux...',
            )
            dispatch(markAsDeleted(chatId))
            console.log('[useChats] ✅ Redux updated')

            console.log(
                '[useChats] 🔐 Leave process finished',
            )
            console.log(
                '=========================================\n',
            )
        },
        [dispatch, items],
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

    // Мемоизация возвращаемого объекта — предотвращает пересоздание
    // на каждый рендер, стабилизирует ссылку для потребителей хука
    return useMemo(
        () => ({
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
            leaveChat,
            addToContacts: addChatToContacts,
            resetChatSettings: resetAllChatSettings,
            getChatSettings,
            getChatWithSettings,
            createChat,
            createGroup,
            createChannel,
        }),
        [
            items,
            loading,
            error,
            selectedChatId,
            chatSettings,
            loadChats,
            hydrateChats,
            selectChat,
            updateChatData,
            updateChatSettingsData,
            toggleFavoriteChat,
            toggleChatNotifications,
            markChatAsRead,
            markChatAsReadOnServer,
            markChatAsUnread,
            deleteChat,
            leaveChat,
            addChatToContacts,
            resetAllChatSettings,
            getChatSettings,
            getChatWithSettings,
            createChat,
            createGroup,
            createChannel,
        ],
    )
}
