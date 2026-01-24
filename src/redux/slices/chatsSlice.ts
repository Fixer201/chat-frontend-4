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

const initialState: ChatsState = {
    items: [],
    loading: false,
    error: null,
    selectedChatId: null,
    chatSettings: {},
}

const getDefaultSettings = (
    chat?: ChatItem,
): ChatSettings => ({
    isFavorite: chat?.isFavorite || false,
    isChatRead: chat?.newMessageCount === 0,
    notificationsEnabled: chat?.notifications ?? true,
    isDeleted: false,
    originalUnreadCount: chat?.newMessageCount || 0,
})

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
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
            console.log('🐛 Redux Debug State:', {
                itemsCount: state.items.length,
                items: state.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    type: item.chatType,
                })),
                chatSettingsCount: Object.keys(
                    state.chatSettings,
                ).length,
                chatSettings: state.chatSettings,
                selectedChatId: state.selectedChatId,
            })
        },
    },
    extraReducers: (builder) => {
        // Используем вынесенные обработчики
        handleFetchChats(builder, initialState)
        handleCreateChat(builder)
    },
})

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
