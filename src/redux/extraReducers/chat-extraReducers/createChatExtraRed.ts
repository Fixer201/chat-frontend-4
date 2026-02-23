import {
    createAsyncThunk,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ApiChatItem,
    ChatItem,
    ChatsState,
} from '@shared/types/chat'
import {
    Contact,
    GroupParticipant,
} from '@shared/types/contact'
import { onNextProps } from '@shared/types/createGroup'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { addChatToStorage } from '@shared/lib/localStorageChats'
import { saveGroupParticipants } from '@shared/lib/localStorageGroupParticipants'
import { contactToGroupParticipant } from '@shared/lib/participantUtils'
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
            'localChats',
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

    const uniqueId =
        Math.floor(Date.now() / 1000) * 1000 +
        Math.floor(Math.random() * 1000)

    const participants: Participant[] = members.map(
        contactToParticipant,
    )

    let avatarUrl = photoUrl
    if (!avatarUrl) {
        if (chatType.includes('group')) {
            avatarUrl = '/images/chatHeader/groupAvatar.svg' // убедитесь, что файл существует
        } else if (chatType.includes('channel')) {
            avatarUrl =
                '/images/chatHeader/channelAvatar.svg'
        } else {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
        }
    }
    const avatarWebpUrl = avatarUrl

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
            last_seen_message: { id: 0, uid: '' },
            first_new_message: { id: 0, uid: '' },
            last_message: {
                id: 0,
                uid: '',
                from_user: 'Вы',
                content:
                    participants.length > 0
                        ? `Создана ${chatType.includes('group') ? 'группа' : 'канал'}. Участников: ${participants.length}`
                        : `Создана ${chatType.includes('group') ? 'группа' : 'канал'}`,
                files_summary: { types: [], count: 0 },
                has_replied_message: false,
                has_forwarded_message: false,
                new: false,
                created_at: now,
                updated_at: now,
            },
        }
    }

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

// Thunk для создания группы (API + fallback на моки)
export const createGroup = createAsyncThunk<
    ChatWithSettings,
    CreateGroupPayload,
    { rejectValue: string; state: RootState }
>(
    'chats/createGroup',
    async (
        { groupData, members },
        { rejectWithValue, getState },
    ) => {
        try {
            const accessToken = Cookies.get('access_token')
            let apiChat: ApiChatItem | null = null
            let apiError = false

            if (accessToken) {
                try {
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
                    }

                    const response = await fetch(
                        'https://api.test.chat.ktsf.ru/api/v1/chat/create-group',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify(body),
                        },
                    )
                    if (response.ok) {
                        apiChat = await response.json()
                    } else {
                        apiError = true
                    }
                } catch {
                    apiError = true
                }
            }

            let finalApiChat: ApiChatItem
            if (!apiError && apiChat) {
                finalApiChat = apiChat
            } else {
                // Fallback на мок
                const photoUrl = createPhotoUrl(
                    groupData.photo,
                )
                const chatType =
                    groupData.type === 'open'
                        ? 'public-group'
                        : 'private-group'
                finalApiChat = createMockChatFromResponse(
                    groupData.name,
                    groupData.description,
                    chatType,
                    photoUrl,
                    members,
                )
            }

            // Сохраняем в localStorage
            addChatToStorage(finalApiChat)

            // Сохраняем детальных участников (для групп/каналов)
            const detailedParticipants: GroupParticipant[] =
                members.map((contact, index) =>
                    contactToGroupParticipant(
                        contact,
                        index === 0,
                    ),
                )
            const currentUser: GroupParticipant = {
                uid: 'current-user-uid', // TODO: заменить на реальный uid
                firstName: 'Я',
                lastName: '',
                avatarUrl:
                    '/images/chatHeader/userAvatar.svg',
                avatarWebpUrl:
                    '/images/chatHeader/userAvatar.svg',
                isOwner: true,
                isBlocked: false,
                isOnline: true,
                wasOnlineAt: Date.now(),
                isInContacts: true,
            }
            if (
                !detailedParticipants.some(
                    (p) => p.uid === currentUser.uid,
                )
            ) {
                detailedParticipants.unshift(currentUser)
            }
            saveGroupParticipants(
                finalApiChat.chat_key,
                detailedParticipants,
            )

            const transformedData =
                transformFromApi<ApiChatItem>(finalApiChat)
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
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Ошибка при создании группы'
            return rejectWithValue(errorMessage)
        }
    },
)

// Thunk для создания канала (API + fallback на моки)
export const createChannel = createAsyncThunk<
    ChatWithSettings,
    CreateChannelPayload,
    { rejectValue: string; state: RootState }
>(
    'chats/createChannel',
    async (
        { channelData, members },
        { rejectWithValue, getState },
    ) => {
        try {
            const accessToken = Cookies.get('access_token')
            let apiChat: ApiChatItem | null = null
            let apiError = false

            if (accessToken) {
                try {
                    const chatType =
                        channelData.type === 'public'
                            ? 'public-channel'
                            : 'private-channel'
                    const body = {
                        name: channelData.name,
                        description:
                            channelData.description,
                        type: chatType,
                        members: members.map((m) => ({
                            uid: m.uid,
                        })),
                    }

                    const response = await fetch(
                        'https://api.test.chat.ktsf.ru/api/v1/chat/create-channel',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify(body),
                        },
                    )
                    if (response.ok) {
                        apiChat = await response.json()
                    } else {
                        apiError = true
                    }
                } catch {
                    apiError = true
                }
            }

            let finalApiChat: ApiChatItem
            if (!apiError && apiChat) {
                finalApiChat = apiChat
            } else {
                const photoUrl = createPhotoUrl(
                    channelData.photo,
                )
                const chatType =
                    channelData.type === 'public'
                        ? 'public-channel'
                        : 'private-channel'
                finalApiChat = createMockChatFromResponse(
                    channelData.name,
                    channelData.description,
                    chatType,
                    photoUrl,
                    members,
                )
            }

            addChatToStorage(finalApiChat)

            // Сохраняем участников для канала (как GroupParticipant)
            const detailedParticipants: GroupParticipant[] =
                members.map((contact, index) =>
                    contactToGroupParticipant(
                        contact,
                        index === 0,
                    ),
                )
            const currentUser: GroupParticipant = {
                uid: 'current-user-uid',
                firstName: 'Я',
                lastName: '',
                avatarUrl:
                    '/images/chatHeader/userAvatar.svg',
                avatarWebpUrl:
                    '/images/chatHeader/userAvatar.svg',
                isOwner: true,
                isBlocked: false,
                isOnline: true,
                wasOnlineAt: Date.now(),
                isInContacts: true,
            }
            if (
                !detailedParticipants.some(
                    (p) => p.uid === currentUser.uid,
                )
            ) {
                detailedParticipants.unshift(currentUser)
            }
            saveGroupParticipants(
                finalApiChat.chat_key,
                detailedParticipants,
            )

            const transformedData =
                transformFromApi<ApiChatItem>(finalApiChat)
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
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Ошибка при создании канала'
            return rejectWithValue(errorMessage)
        }
    },
)

// Thunk для создания личного чата (оставляем как в dev — мок)
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

            // Создаём локальный моковый чат для личного общения
            const mockChatData = createMockChatFromResponse(
                'Личный чат',
                '',
                'chat',
                null,
                [],
            )

            const transformedData =
                transformFromApi(mockChatData)
            const enhancedChat: ChatItem = {
                ...transformedData,
                isTemporary: true,
                tempContactUid: toUserId,
                chat: {
                    ...transformedData.chat,
                    uid: toUserId,
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
        } catch (error) {
            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : 'Ошибка создания чата',
            )
        }
    },
)

// Обработчики состояний для thunk'ов создания чатов
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
            persistLocalChats(state)
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
                persistLocalChats(state)
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
