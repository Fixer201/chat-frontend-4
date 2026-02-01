// @redux/slices/chatsSlice.ts
import {
    createSlice,
    PayloadAction,
    createAsyncThunk,
} from '@reduxjs/toolkit'
import {
    ApiChatItem,
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
import { transformFromApi } from '@shared/lib/transformChatData' // Добавлен импорт для маппинга

// Начальное состояние slice чатов
const initialState: ChatsState = {
    items: [], // Список чатов
    loading: false, // Флаг загрузки
    error: null, // Ошибки
    selectedChatId: null, // ID выбранного чата
    chatSettings: {}, // Настройки для каждого чата
}

// Thunk для создания личного чата (переименовал в createPersonalChat, чтобы избежать конфликта экспорта)
export const createChat = createAsyncThunk(
    'chats/createPersonalChat',
    async (toUserId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(
                '/api/chat/create', // Замените на реальный endpoint, если отличается (например, 'https://api.test.chat.ktsf.ru/api/v1/chat/create')
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Добавьте авторизацию, если нужно (например, Bearer token из useApiFetcher)
                    },
                    body: JSON.stringify({ toUserId }),
                },
            )
            if (!response.ok)
                throw new Error('Failed to create chat')
            const data: ApiChatItem = await response.json()
            return data
        } catch (error: unknown) {
            // Заменил any на unknown
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error'
            return rejectWithValue(errorMessage)
        }
    },
)

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
        // ... (все reducers остаются без изменений, как в вашем коде)
        setSelectedChat: (
            state,
            action: PayloadAction<number | null>,
        ) => {
            state.selectedChatId = action.payload
        },
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
        updateChatSettings: (
            state,
            action: PayloadAction<{
                chatId: number
                settings: Partial<ChatSettings>
            }>,
        ) => {
            const { chatId, settings } = action.payload
            const currentChatSettings = state.chatSettings[
                chatId
            ]
                ? { ...state.chatSettings[chatId] }
                : getDefaultSettings(
                      state.items.find(
                          (c) => c.id === chatId,
                      ),
                  )
            const updatedSettings: ChatSettings = {
                ...currentChatSettings,
                ...settings,
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
        resetChatSettings: (state) => {
            state.chatSettings = {}
        },
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
        debugState: (state) => {
            // Отладочная информация о состоянии
        },
    },
    // Подключение обработчиков для асинхронных thunk'ов
    extraReducers: (builder) => {
        handleFetchChats(builder, initialState)
        handleCreateChat(builder) // Обрабатывает createGroup и createChannel

        // Добавлены обработчики для createPersonalChat (личный чат)
        builder
            .addCase(createChat.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(
                createChat.fulfilled,
                (state, action) => {
                    state.loading = false
                    // Маппинг API-данных в ChatItem с помощью transformFromApi
                    const transformedData =
                        transformFromApi<ApiChatItem>(
                            action.payload,
                        )
                    const newChat: ChatItem = {
                        ...transformedData,
                        chat: {
                            ...transformedData.chat,
                            isInContacts: true, // Личный чат автоматически добавляется в контакты
                        },
                    }
                    // Добавляем новый чат в начало списка
                    state.items.unshift(newChat)
                    // Автоматически выбираем созданный чат
                    state.selectedChatId = newChat.id
                },
            )
            .addCase(
                createChat.rejected,
                (state, action) => {
                    state.loading = false
                    state.error = action.payload as string
                },
            )
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
