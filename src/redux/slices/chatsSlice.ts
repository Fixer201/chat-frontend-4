// @redux/slices/chatsSlice.ts
import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    ChatItem,
    ChatsState,
    ChatSettings,
} from '@shared/types/chat'
import {
    handleFetchChats,
    fetchChats,
} from '@redux/extraReducers/chat-extraReducers/fetchChatsExtraRed'
import {
    createGroup,
    createChannel,
    handleCreateChat,
} from '@redux/extraReducers/chat-extraReducers/createChatExtraRed'

// Начальное состояние slice чатов
const initialState: ChatsState = {
    items: [], // Список чатов
    loading: false, // Флаг загрузки
    error: null, // Ошибки
    selectedChatId: null, // ID выбранного чата
    chatSettings: {}, // Настройки для каждого чата
}

// Функция для получения настроек по умолчанию для чата
const getDefaultSettings = (
    chat?: ChatItem,
): ChatSettings => ({
    isFavorite: chat?.isFavorite || false,
    isChatRead: chat?.newMessageCount === 0,
    notificationsEnabled: chat?.notifications ?? true,
    isDeleted: false,
    originalUnreadCount: chat?.newMessageCount || 0,
})

// Создание slice для управления состоянием чатов
const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        // Установка выбранного чата
        setSelectedChat: (
            state,
            action: PayloadAction<number | null>,
        ) => {
            state.selectedChatId = action.payload
        },
        // Обновление данных чата
        updateChat: (
            state,
            action: PayloadAction<ChatItem>,
        ) => {
            const index = state.items.findIndex(
                (chat) => chat.id === action.payload.id,
            )
            if (index !== -1) {
                state.items[index] = action.payload
            }
        },
        // Обновление настроек конкретного чата
        updateChatSettings: (
            state,
            action: PayloadAction<{
                chatId: number
                settings: Partial<ChatSettings>
            }>,
        ) => {
            const { chatId, settings } = action.payload

            // Получение текущих настроек или создание настроек по умолчанию
            const currentChatSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(
                      state.items.find(
                          (c) => c.id === chatId,
                      ),
                  )

            // Объединение текущих настроек с новыми
            const updatedSettings: ChatSettings = {
                ...currentChatSettings,
                ...settings,
            }

            state.chatSettings[chatId] = updatedSettings

            // Обновление настроек в основном массиве чатов для обратной совместимости
            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Переключение статуса "Избранное" для чата
        toggleFavorite: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chat = state.items.find(
                (c) => c.id === chatId,
            )

            const currentSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(chat)

            const updatedSettings: ChatSettings = {
                ...currentSettings,
                isFavorite: !currentSettings.isFavorite,
            }

            state.chatSettings[chatId] = updatedSettings

            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Переключение уведомлений для чата
        toggleNotifications: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chat = state.items.find(
                (c) => c.id === chatId,
            )

            const currentSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(chat)

            const updatedSettings: ChatSettings = {
                ...currentSettings,
                notificationsEnabled:
                    !currentSettings.notificationsEnabled,
            }

            state.chatSettings[chatId] = updatedSettings

            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Пометка чата как прочитанного
        markAsRead: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chat = state.items.find(
                (c) => c.id === chatId,
            )

            const currentSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(chat)

            const updatedSettings: ChatSettings = {
                ...currentSettings,
                isChatRead: true,
                originalUnreadCount:
                    currentSettings.originalUnreadCount > 0
                        ? currentSettings.originalUnreadCount
                        : 0,
            }

            state.chatSettings[chatId] = updatedSettings

            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Пометка чата как непрочитанного
        markAsUnread: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chat = state.items.find(
                (c) => c.id === chatId,
            )

            const currentSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(chat)

            const updatedSettings: ChatSettings = {
                ...currentSettings,
                isChatRead: false,
                originalUnreadCount: 0,
            }

            state.chatSettings[chatId] = updatedSettings

            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Пометка чата как удаленного (soft delete)
        markAsDeleted: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chat = state.items.find(
                (c) => c.id === chatId,
            )

            const currentSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(chat)

            const updatedSettings: ChatSettings = {
                ...currentSettings,
                isDeleted: true,
            }

            state.chatSettings[chatId] = updatedSettings

            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    updatedSettings
            }
        },
        // Добавление чата в контакты
        addToContacts: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )

            if (chatIndex !== -1) {
                state.items[chatIndex].chat.isInContacts =
                    true
            }
        },
        // Сброс всех настроек чатов
        resetChatSettings: (state) => {
            state.chatSettings = {}
        },
        // Добавление нового чата в список
        addChat: (
            state,
            action: PayloadAction<ChatItem>,
        ) => {
            const existingIndex = state.items.findIndex(
                (chat) => chat.id === action.payload.id,
            )

            if (existingIndex === -1) {
                state.items.unshift(action.payload)
            } else {
                state.items[existingIndex] = action.payload
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        debugState: (state) => {
            // Отладочная информация о состоянии
        },
    },
    // Подключение обработчиков для асинхронных thunk'ов
    extraReducers: (builder) => {
        handleFetchChats(builder, initialState)
        handleCreateChat(builder)
    },
})

// Экспорт thunk'ов и actions
export { fetchChats, createGroup, createChannel }
export const {
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
    addChat,
    debugState,
} = chatsSlice.actions
export default chatsSlice.reducer
