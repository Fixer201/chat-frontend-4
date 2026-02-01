// @redux/extraReducers/chat-extraReducers/createChatExtraRed.ts
import {
    createAsyncThunk,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import Cookies from 'js-cookie' // Добавлен импорт для токенов
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ApiChatItem,
    ChatItem,
    ChatsState,
} from '@shared/types/chat'
import { Contact } from '@shared/types/contact'
import { onNextProps } from '@shared/types/createGroup'

// Типы для payload при создании группы и канала
interface CreateGroupPayload {
    groupData: onNextProps
    members: Contact[]
}

interface CreateChannelPayload {
    channelData: onNextProps
    members: Contact[]
}

// Тип для возвращаемого значения thunk'ов создания чата
interface ChatWithSettings {
    chat: ChatItem
    settings: {
        isFavorite: boolean
        isChatRead: boolean
        notificationsEnabled: boolean
        isDeleted: boolean
        originalUnreadCount: number
    }
}

// Thunk для создания группы с реальным API
export const createGroup = createAsyncThunk<
    ChatWithSettings,
    CreateGroupPayload,
    { rejectValue: string }
>(
    'chats/createGroup',
    async ({ groupData, members }, { rejectWithValue }) => {
        try {
            const accessToken = Cookies.get('access_token')
            if (!accessToken)
                throw new Error('AccessTokenNotFound')

            const chatType =
                groupData.type === 'open'
                    ? 'public-group'
                    : 'private-group'
            const body = {
                name: groupData.name,
                description: groupData.description,
                type: chatType,
                members: members.map((m) => ({
                    uid: m.uid,
                })),
                // photo: groupData.photo (если API поддерживает файл, добавьте FormData)
            }

            const response = await fetch(
                'https://api.test.chat.ktsf.ru/api/v1/chat/create-group', // Предполагаемый endpoint — замените на реальный, если отличается
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(body),
                },
            )
            if (!response.ok)
                throw new Error('Failed to create group')

            const data: ApiChatItem = await response.json()
            const transformedData =
                transformFromApi<ApiChatItem>(data)
            const enhancedChat: ChatItem = {
                ...transformedData,
                chat: {
                    ...transformedData.chat,
                    isInContacts: true,
                },
            }

            return {
                chat: enhancedChat,
                settings: {
                    isFavorite: false,
                    isChatRead: true,
                    notificationsEnabled: true,
                    isDeleted: false,
                    originalUnreadCount: 0,
                },
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Ошибка при создании группы'
            return rejectWithValue(errorMessage)
        }
    },
)

// Thunk для создания канала с реальным API
export const createChannel = createAsyncThunk<
    ChatWithSettings,
    CreateChannelPayload,
    { rejectValue: string }
>(
    'chats/createChannel',
    async (
        { channelData, members },
        { rejectWithValue },
    ) => {
        try {
            const accessToken = Cookies.get('access_token')
            if (!accessToken)
                throw new Error('AccessTokenNotFound')

            const chatType =
                channelData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'
            const body = {
                name: channelData.name,
                description: channelData.description,
                type: chatType,
                members: members.map((m) => ({
                    uid: m.uid,
                })),
                // photo: channelData.photo
            }

            const response = await fetch(
                'https://api.test.chat.ktsf.ru/api/v1/chat/create-channel', // Предполагаемый endpoint — замените на реальный, если отличается
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(body),
                },
            )
            if (!response.ok)
                throw new Error('Failed to create channel')

            const data: ApiChatItem = await response.json()
            const transformedData =
                transformFromApi<ApiChatItem>(data)
            const enhancedChat: ChatItem = {
                ...transformedData,
                chat: {
                    ...transformedData.chat,
                    isInContacts: true,
                },
            }

            return {
                chat: enhancedChat,
                settings: {
                    isFavorite: false,
                    isChatRead: true,
                    notificationsEnabled: true,
                    isDeleted: false,
                    originalUnreadCount: 0,
                },
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Ошибка при создании канала'
            return rejectWithValue(errorMessage)
        }
    },
)

// Обработчики состояний для thunk'ов создания чатов (без изменений)
export const handleCreateChat = (
    builder: ActionReducerMapBuilder<ChatsState>,
) => {
    builder
        .addCase(createGroup.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(createGroup.fulfilled, (state, action) => {
            state.loading = false
            state.error = null

            const existingIndex = state.items.findIndex(
                (chat) =>
                    chat.id === action.payload.chat.id,
            )

            if (existingIndex === -1) {
                state.items.unshift(action.payload.chat)
            } else {
                state.items[existingIndex] =
                    action.payload.chat
            }

            if (
                !state.chatSettings[action.payload.chat.id]
            ) {
                state.chatSettings[action.payload.chat.id] =
                    action.payload.settings
            }

            const chatIndex = state.items.findIndex(
                (chat) =>
                    chat.id === action.payload.chat.id,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    action.payload.settings
            }

            state.selectedChatId = action.payload.chat.id
        })
        .addCase(createGroup.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
        .addCase(createChannel.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(
            createChannel.fulfilled,
            (state, action) => {
                state.loading = false
                state.error = null

                const existingIndex = state.items.findIndex(
                    (chat) =>
                        chat.id === action.payload.chat.id,
                )

                if (existingIndex === -1) {
                    state.items.unshift(action.payload.chat)
                } else {
                    state.items[existingIndex] =
                        action.payload.chat
                }

                if (
                    !state.chatSettings[
                        action.payload.chat.id
                    ]
                ) {
                    state.chatSettings[
                        action.payload.chat.id
                    ] = action.payload.settings
                }

                const chatIndex = state.items.findIndex(
                    (chat) =>
                        chat.id === action.payload.chat.id,
                )
                if (chatIndex !== -1) {
                    state.items[chatIndex].settings =
                        action.payload.settings
                }

                state.selectedChatId =
                    action.payload.chat.id
            },
        )
        .addCase(
            createChannel.rejected,
            (state, action) => {
                state.loading = false
                state.error = action.payload as string
            },
        )
}
