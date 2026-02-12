import {
    createAsyncThunk,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import Cookies from 'js-cookie' // импорт для токенов
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ApiChatItem,
    ChatItem,
    ChatsState,
} from '@shared/types/chat'
import { Contact } from '@shared/types/contact'
import { onNextProps } from '@shared/types/createGroup'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { RootState } from '@redux/store'

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

// Тип участника чата
interface Participant {
    uid: string
    full_name: string
}

const LOCAL_CHATS_STORAGE_KEY = 'localChats'
const LOCAL_CHAT_ID_THRESHOLD = 1000000000000

const persistLocalChats = (state: ChatsState) => {
    if (typeof window === 'undefined') return
    try {
        const localChats = state.items
            .filter(
                (chat) => chat.id > LOCAL_CHAT_ID_THRESHOLD,
            )
            .map((chat) => ({
                ...chat,
                settings: state.chatSettings[chat.id],
            }))
        window.localStorage.setItem(
            LOCAL_CHATS_STORAGE_KEY,
            JSON.stringify(localChats),
        )
    } catch (error) {
        console.warn(
            'Не удалось сохранить localChats:',
            error,
        )
    }
}

// Преобразование объекта Contact в Participant для API
const contactToParticipant = (
    contact: Contact,
): Participant => ({
    uid: contact.uid,
    full_name:
        `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
        contact.nickname ||
        contact.username ||
        'Участник',
})

// Создание временного URL для файла с изображением
const createPhotoUrl = (
    photo: File | null,
): string | null => {
    if (!photo) return null

    try {
        return URL.createObjectURL(photo)
    } catch {
        return null
    }
}

// Создание моковых данных чата на основе переданных параметров
const createMockChatFromResponse = (
    name: string,
    description: string,
    chatType:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel',
    photoUrl: string | null,
    members: Contact[],
): ApiChatItem => {
    const mockChats = generateLocalMockChatItems(1)
    const baseMockChat = mockChats[0]

    // Генерация уникального ID для нового чата
    const uniqueId =
        Math.floor(Date.now() / 1000) * 1000 +
        Math.floor(Math.random() * 1000)

    // Преобразование контактов в участников чата
    const participants: Participant[] = members.map(
        contactToParticipant,
    )

    // Определение URL аватарки с fallback на стандартные иконки
    let avatarUrl = photoUrl
    if (!avatarUrl) {
        if (chatType.includes('group')) {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
        } else if (chatType.includes('channel')) {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
        } else {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
        }
    }
    const avatarWebpUrl = avatarUrl

    // Создание базового объекта чата, если нет моковых данных
    if (!baseMockChat) {
        const now = Math.floor(Date.now() / 1000)

        return {
            id: uniqueId,
            chat: {
                uid: `chat_${uniqueId}`,
                username: '',
                nickname: 'Создатель',
                first_name: '',
                last_name: '',
                avatar: '',
                avatar_url: avatarUrl || '',
                avatar_webp: '',
                avatar_webp_url: avatarWebpUrl || '',
                is_blocked: false,
                is_online: false,
                was_online_at: now,
                is_in_contacts: true,
            },
            is_active: false,
            is_favorite: false,
            notifications: true,
            index: uniqueId,
            message_count: 0,
            file_count: 0,
            new_message_count: 0,
            new_file_count: 0,
            name: name,
            chat_type: chatType,
            chat_key: `chat_${uniqueId}`,
            description: description,
            created_by: 'Создатель',
            owner_full_name: 'Создатель',
            participants: participants,
            created_at: Date.now().toString(),
            updated_at: Date.now().toString(),
            last_activity_at: now,
            last_seen_message: {
                id: 0,
                uid: '',
            },
            first_new_message: {
                id: 0,
                uid: '',
            },
            last_message: {
                id: 0,
                uid: '',
                from_user: 'Вы',
                content:
                    participants.length > 0
                        ? `Создана ${chatType.includes('group') ? 'группа' : 'канал'}. Участников: ${participants.length}`
                        : `Создана ${chatType.includes('group') ? 'группа' : 'канал'}`,
                files_summary: {
                    types: [],
                    count: 0,
                },
                has_replied_message: false,
                has_forwarded_message: false,
                new: false,
                created_at: now,
                updated_at: now,
            },
        }
    }

    // Модификация существующих моковых данных
    const modifiedMockChat: ApiChatItem = {
        ...baseMockChat,
        id: uniqueId,
        name: name,
        chat_type: chatType,
        chat: {
            ...baseMockChat.chat,
            avatar_url:
                avatarUrl || baseMockChat.chat.avatar_url,
            avatar_webp_url:
                avatarWebpUrl ||
                baseMockChat.chat.avatar_webp_url,
        },
        description: description,
        participants: participants,
        last_message: {
            ...baseMockChat.last_message,
            content:
                participants.length > 0
                    ? `Создана ${chatType.includes('group') ? 'группа' : 'канал'}. Участников: ${participants.length}`
                    : `Создана ${chatType.includes('group') ? 'группа' : 'канал'}`,
        },
    }

    return modifiedMockChat
}

// Thunk для создания группы с обработкой ошибок через rejectWithValue
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

// Thunk для создания чата
// export const createChat = createAsyncThunk<
//     ChatWithSettings,
//     string,
//     { rejectValue: string }
// >(
//     'chats/createChat',
//     async (toUserId, { rejectWithValue }) => {
//         try {
//             const accessToken = Cookies.get('access_token')
//             if (!accessToken)
//                 throw new Error('AccessTokenNotFound')
//             const response = await fetch(
//                 'https://api.test.chat.ktsf.ru/api/v1/chat/create-chat/',
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${accessToken}`,
//                     },
//                     body: JSON.stringify({
//                         to_user_id: toUserId,
//                     }),
//                 },
//             )
//             if (!response.ok)
//                 throw new Error('Failed to create chat')
//             const data: ApiChatItem = await response.json()
//             const transformedData = transformFromApi(data)
//             return {
//                 chat: transformedData,
//                 settings: {
//                     isFavorite: false,
//                     isChatRead: true,
//                     notificationsEnabled: true,
//                     isDeleted: false,
//                     originalUnreadCount: 0,
//                 },
//             }
//         } catch (error) {
//             return rejectWithValue(
//                 error instanceof Error
//                     ? error.message
//                     : 'Ошибка создания чата',
//             )
//         }
//     },
// )

export const createChat = createAsyncThunk<
    ChatWithSettings,
    string,
    { rejectValue: string; state: RootState }
>(
    'chats/createChat',
    async (toUserId, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const existingChat = state.chats.items.find(
                (chat: ChatItem) =>
                    chat.chat.uid === toUserId ||
                    chat.tempContactUid === toUserId,
            )

            if (existingChat) {
                return {
                    chat: existingChat,
                    settings: state.chats.chatSettings[
                        existingChat.id
                    ] || {
                        isFavorite:
                            existingChat.isFavorite ||
                            false,
                        isChatRead:
                            existingChat.newMessageCount ===
                            0,
                        notificationsEnabled:
                            existingChat.notifications ??
                            true,
                        isDeleted: false,
                        originalUnreadCount:
                            existingChat.newMessageCount ||
                            0,
                    },
                }
            }
            // Создаем локальный моковый чат для личного общения
            const mockChatData = createMockChatFromResponse(
                'Личный чат', // Имя чата
                '', // Описание (пустое)
                'chat', // Тип для личного чата
                null, // Фото (нет)
                [], // Участники (пусто для личного)
            )

            // Трансформация в ChatItem
            const transformedData =
                transformFromApi(mockChatData)

            // Адаптация для личного чата: установите chat.chat.uid = toUserId (UID собеседника)
            const enhancedChat: ChatItem = {
                ...transformedData,
                isTemporary: true,
                tempContactUid: toUserId,
                chat: {
                    ...transformedData.chat,
                    uid: toUserId, // UID пользователя
                    isInContacts: true, // Предполагаем, что контакт добавлен
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
        } catch (error) {
            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : 'Ошибка создания чата',
            )
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

        .addCase(createChat.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(createChat.fulfilled, (state, action) => {
            // чат добавляется в начало списка для немедленного отображения
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

            persistLocalChats(state)
        })
        .addCase(createChat.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
}
