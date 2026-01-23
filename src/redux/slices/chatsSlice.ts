// @redux/slices/chatsSlice.ts - добавим логирование в обработчики
import {
    createSlice,
    PayloadAction,
    ActionReducerMapBuilder,
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

// Обработчики для createGroup и createChannel
const handleCreateChat = (
    builder: ActionReducerMapBuilder<ChatsState>,
) => {
    builder
        .addCase(createGroup.pending, (state) => {
            state.loading = true
            state.error = null
            console.log('🔄 Redux: createGroup.pending')
        })
        .addCase(createGroup.fulfilled, (state, action) => {
            state.loading = false
            state.error = null

            console.log('✅ Redux: createGroup.fulfilled', {
                chatId: action.payload.chat.id,
                name: action.payload.chat.name,
                type: action.payload.chat.chatType,
                currentItemsCount: state.items.length,
                settings: action.payload.settings,
            })

            // Проверяем, нет ли уже чата с таким ID
            const existingIndex = state.items.findIndex(
                (chat) =>
                    chat.id === action.payload.chat.id,
            )

            if (existingIndex === -1) {
                // Добавляем созданную группу в начало списка
                state.items.unshift(action.payload.chat)
                console.log('📥 Группа добавлена в items')
            } else {
                // Если уже есть, обновляем
                state.items[existingIndex] =
                    action.payload.chat
                console.log(
                    '⚠️ Группа уже существует, обновлена',
                )
            }

            // Добавляем настройки для группы
            if (
                !state.chatSettings[action.payload.chat.id]
            ) {
                state.chatSettings[action.payload.chat.id] =
                    action.payload.settings
                console.log(
                    '⚙️ Настройки группы добавлены в chatSettings',
                )
            } else {
                console.log(
                    '⚙️ Настройки группы уже существуют',
                )
            }

            // Обновляем настройки в объекте чата для совместимости
            const chatIndex = state.items.findIndex(
                (chat) =>
                    chat.id === action.payload.chat.id,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    action.payload.settings
                console.log(
                    '📝 Настройки добавлены в объект чата',
                )
            }

            // Автоматически выбираем созданную группу
            state.selectedChatId = action.payload.chat.id
            console.log(
                '🎯 Группа выбрана, ID:',
                action.payload.chat.id,
            )

            console.log('📊 Итоговое состояние:', {
                itemsCount: state.items.length,
                chatSettingsCount: Object.keys(
                    state.chatSettings,
                ).length,
                selectedChatId: state.selectedChatId,
            })
        })
        .addCase(createGroup.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
            console.error(
                '❌ Redux: createGroup.rejected:',
                action.payload,
            )
        })

    builder
        .addCase(createChannel.pending, (state) => {
            state.loading = true
            state.error = null
            console.log('🔄 Redux: createChannel.pending')
        })
        .addCase(
            createChannel.fulfilled,
            (state, action) => {
                state.loading = false
                state.error = null

                console.log(
                    '✅ Redux: createChannel.fulfilled',
                    {
                        chatId: action.payload.chat.id,
                        name: action.payload.chat.name,
                        type: action.payload.chat.chatType,
                        currentItemsCount:
                            state.items.length,
                        settings: action.payload.settings,
                    },
                )

                const existingIndex = state.items.findIndex(
                    (chat) =>
                        chat.id === action.payload.chat.id,
                )

                if (existingIndex === -1) {
                    state.items.unshift(action.payload.chat)
                    console.log('📥 Канал добавлен в items')
                } else {
                    state.items[existingIndex] =
                        action.payload.chat
                    console.log(
                        '⚠️ Канал уже существует, обновлен',
                    )
                }

                if (
                    !state.chatSettings[
                        action.payload.chat.id
                    ]
                ) {
                    state.chatSettings[
                        action.payload.chat.id
                    ] = action.payload.settings
                    console.log(
                        '⚙️ Настройки канала добавлены в chatSettings',
                    )
                } else {
                    console.log(
                        '⚙️ Настройки канала уже существуют',
                    )
                }

                const chatIndex = state.items.findIndex(
                    (chat) =>
                        chat.id === action.payload.chat.id,
                )
                if (chatIndex !== -1) {
                    state.items[chatIndex].settings =
                        action.payload.settings
                    console.log(
                        '📝 Настройки добавлены в объект чата',
                    )
                }

                state.selectedChatId =
                    action.payload.chat.id
                console.log(
                    '🎯 Канал выбран, ID:',
                    action.payload.chat.id,
                )

                console.log('📊 Итоговое состояние:', {
                    itemsCount: state.items.length,
                    chatSettingsCount: Object.keys(
                        state.chatSettings,
                    ).length,
                    selectedChatId: state.selectedChatId,
                })
            },
        )
        .addCase(
            createChannel.rejected,
            (state, action) => {
                state.loading = false
                state.error = action.payload as string
                console.error(
                    '❌ Redux: createChannel.rejected:',
                    action.payload,
                )
            },
        )
}

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

        // Добавим reducer для отладки - вывод состояния
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
    debugState, // Экспортируем новый action
} = chatsSlice.actions
export default chatsSlice.reducer
