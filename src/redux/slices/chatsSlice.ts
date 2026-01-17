// Redux slice для управления состоянием чатов
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

// Начальное состояние для чатов
const initialState: ChatsState = {
    items: [], // Массив чатов
    loading: false, // Флаг загрузки
    error: null, // Сообщение об ошибке
    selectedChatId: null, // ID выбранного чата
    chatSettings: {}, // Настройки для каждого чата (ключ - ID чата)
}

// Создание slice для чатов
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

            // Если настройки для этого чата еще не существуют, создаем их
            if (!state.chatSettings[chatId]) {
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: chat?.isFavorite || false,
                    isChatRead: chat?.newMessageCount === 0,
                    notificationsEnabled:
                        chat?.notifications ?? true,
                    isDeleted: false,
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
            }

            // Обновляем настройки
            state.chatSettings[chatId] = {
                ...state.chatSettings[chatId],
                ...settings,
            }

            // Обновляем также в items для совместимости со старым кодом
            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (
                chatIndex !== -1 &&
                state.items[chatIndex].settings
            ) {
                state.items[chatIndex].settings = {
                    ...state.items[chatIndex].settings!,
                    ...settings,
                }
            }
        },

        // Переключение избранного статуса чата
        toggleFavorite: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                // Инвертируем статус избранного
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isFavorite: !currentSettings.isFavorite,
                }
            } else {
                // Если настроек нет, создаем их
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: true,
                    isChatRead: chat?.newMessageCount === 0,
                    notificationsEnabled:
                        chat?.notifications ?? true,
                    isDeleted: false,
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
            }
        },

        // Переключение состояния уведомлений
        toggleNotifications: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                // Инвертируем статус уведомлений
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    notificationsEnabled:
                        !currentSettings.notificationsEnabled,
                }
            }
        },

        // Пометка чата как прочитанного
        markAsRead: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isChatRead: true,
                    originalUnreadCount:
                        currentSettings.originalUnreadCount >
                        0
                            ? currentSettings.originalUnreadCount
                            : 0,
                }
            }
        },

        // Пометка чата как непрочитанного
        markAsUnread: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isChatRead: false,
                    originalUnreadCount: 0,
                }
            }
        },

        // Пометка чата как удаленного
        markAsDeleted: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isDeleted: true,
                }
            } else {
                // Если настроек нет, создаем их с флагом удаления
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: false,
                    isChatRead: chat?.newMessageCount === 0,
                    notificationsEnabled:
                        chat?.notifications ?? true,
                    isDeleted: true,
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
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
    },
    // Обработчики для асинхронных действий (загрузка чатов)
    extraReducers: (builder) => {
        handleFetchChats(builder, initialState)
    },
})
// Экспорт асинхронного thunk для загрузки чатов
export { fetchChats }
// Экспорт всех action creators
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
} = chatsSlice.actions
// Экспорт reducer
export default chatsSlice.reducer
