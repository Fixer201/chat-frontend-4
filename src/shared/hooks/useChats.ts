// Кастомный хук useChats для удобной работы с состоянием чатов
import { useCallback } from 'react'
import {
    useAppDispatch,
    useAppSelector,
} from '../../redux/store'
import {
    fetchChats,
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
} from '../../redux/slices/chatsSlice'
import { ChatItem, ChatSettings } from '../types/chat'

// Хук для работы с чатами, предоставляет удобные методы и доступ к состоянию
export const useChats = () => {
    const dispatch = useAppDispatch()
    // Селекторы для получения данных из Redux store
    const {
        items, // Массив чатов
        loading, // Флаг загрузки
        error, // Ошибка
        selectedChatId, // ID выбранного чата
        chatSettings, // Настройки чатов
    } = useAppSelector((state) => state.chats)

    // Загрузка чатов
    const loadChats = useCallback(
        (count: number = 20) => {
            dispatch(fetchChats(count))
        },
        [dispatch],
    )

    // Выбор чата
    const selectChat = useCallback(
        (chatId: number | null) => {
            dispatch(setSelectedChat(chatId))
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

    // Переключение избранного статуса
    const toggleFavoriteChat = useCallback(
        (chatId: number) => {
            dispatch(toggleFavorite(chatId))
        },
        [dispatch],
    )

    // Переключение уведомлений
    const toggleChatNotifications = useCallback(
        (chatId: number) => {
            dispatch(toggleNotifications(chatId))
        },
        [dispatch],
    )

    // Пометка как прочитанного
    const markChatAsRead = useCallback(
        (chatId: number) => {
            dispatch(markAsRead(chatId))
        },
        [dispatch],
    )

    // Пометка как непрочитанного
    const markChatAsUnread = useCallback(
        (chatId: number) => {
            dispatch(markAsUnread(chatId))
        },
        [dispatch],
    )

    // Удаление чата (помечаем как удаленный)
    const deleteChat = useCallback(
        (chatId: number) => {
            dispatch(markAsDeleted(chatId))
        },
        [dispatch],
    )

    // Добавление в контакты
    const addChatToContacts = useCallback(
        (chatId: number) => {
            dispatch(addToContacts(chatId))
        },
        [dispatch],
    )

    // Сброс всех настроек
    const resetAllChatSettings = useCallback(() => {
        dispatch(resetChatSettings())
    }, [dispatch])

    // Получение настроек конкретного чата
    const getChatSettings = useCallback(
        (chatId: number): ChatSettings | undefined => {
            return chatSettings[chatId]
        },
        [chatSettings],
    )

    // Получение чата с его настройками
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

    // Возвращаемые методы и данные
    return {
        chats: items,
        loading,
        error,
        selectedChatId,
        chatSettings,
        loadChats,
        selectChat,
        updateChat: updateChatData,
        updateChatSettings: updateChatSettingsData,
        toggleFavorite: toggleFavoriteChat,
        toggleNotifications: toggleChatNotifications,
        markAsRead: markChatAsRead,
        markAsUnread: markChatAsUnread,
        deleteChat,
        addToContacts: addChatToContacts,
        resetChatSettings: resetAllChatSettings,
        getChatSettings,
        getChatWithSettings,
    }
}
