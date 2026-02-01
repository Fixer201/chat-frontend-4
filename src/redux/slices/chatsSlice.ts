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

// Thunk для создания личного чата (с моковыми данными, заготовка для API)
export const createChat = createAsyncThunk(
    'chats/createChat',
    async (toUserId: string, { rejectWithValue }) => {
        try {
            // Заготовка для реального API (раскомментируйте и замените на реальный endpoint, когда будет)
            // const response = await fetch(
            //     'https://api.test.chat.ktsf.ru/api/v1/chat/create', // Пример endpoint
            //     {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             Authorization: `Bearer ${accessToken}`, // Добавьте токен
            //         },
            //         body: JSON.stringify({ toUserId }),
            //     },
            // )
            // if (!response.ok) throw new Error('Failed to create chat')
            // const data: ApiChatItem = await response.json()
            // return data

            // Пока что — моковые данные для личного чата
            const now = Math.floor(Date.now() / 1000)
            const uniqueId =
                Math.floor(Date.now() / 1000) * 1000 +
                Math.floor(Math.random() * 1000)

            const mockApiChat: ApiChatItem = {
                id: uniqueId,
                chat: {
                    uid: toUserId,
                    username: '',
                    nickname: '',
                    first_name: '',
                    last_name: '',
                    avatar: '',
                    avatar_url:
                        '/images/chatHeader/userAvatar.svg',
                    avatar_webp: '',
                    avatar_webp_url:
                        '/images/chatHeader/userAvatar.svg',
                    is_blocked: false,
                    is_online: true,
                    was_online_at: now,
                    is_in_contacts: true,
                },
                is_active: true,
                is_favorite: false,
                notifications: true,
                index: uniqueId,
                message_count: 0,
                file_count: 0,
                new_message_count: 0,
                new_file_count: 0,
                name: '',
                chat_type: 'chat',
                chat_key: `chat_${uniqueId}`,
                description: '',
                created_by: '',
                owner_full_name: '',
                participants: [],
                created_at: Date.now().toString(),
                updated_at: Date.now().toString(),
                last_activity_at: now,
                last_seen_message: { id: 0, uid: '' },
                first_new_message: { id: 0, uid: '' },
                last_message: {
                    id: 0,
                    uid: '',
                    from_user: '',
                    content: '',
                    files_list: [],
                    files_summary: { types: [], count: 0 },
                    has_replied_message: false,
                    has_forwarded_message: false,
                    replied_messages: [],
                    forwarded_messages: [],
                    new: false,
                    created_at: now,
                    updated_at: now,
                },
            }

            return mockApiChat
        } catch (error: unknown) {
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
        // Action для отладки состояния (в продакшене следует удалить)
        debugState: (state) => {
            // Отладочная информация о состоянии
        },
    },
    // Подключение обработчиков для асинхронных thunk'ов
    extraReducers: (builder) => {
        handleFetchChats(builder, initialState)
        handleCreateChat(builder) // Обрабатывает createGroup и createChannel

        // Добавлены обработчики для createChat (личный чат)
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
