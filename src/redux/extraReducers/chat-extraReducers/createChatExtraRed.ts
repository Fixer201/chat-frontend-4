// @redux/extraReducers/chat-extraReducers/createChatExtraRed.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformFromApi } from '@shared/lib/transformChatData'
import { ApiChatItem, ChatItem } from '@shared/types/chat'
import { Contact } from '@shared/types/contact'
import { onNextProps } from '@shared/types/createGroup'

interface CreateGroupPayload {
    groupData: onNextProps
    members: Contact[]
}

interface CreateChannelPayload {
    channelData: onNextProps
    members: Contact[]
}

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

// 1. Определяем тип Participant
interface Participant {
    uid: string
    full_name: string
}

// 2. Функция преобразования Contact в Participant
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

// Функция для создания URL из File (для предпросмотра)
const createPhotoUrl = (
    photo: File | null,
): string | null => {
    if (!photo) return null

    try {
        // Создаем временный URL для файла
        return URL.createObjectURL(photo)
    } catch (error) {
        console.error(
            'Ошибка создания URL для фото:',
            error,
        )
        return null
    }
}

// Функция преобразования API ответа в ChatItem с использованием generateLocalMockChatItems
const createMockChatFromResponse = (
    name: string,
    description: string,
    chatType:
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel',
    photoUrl: string | null,
    members: Contact[],
): ApiChatItem => {
    const mockChats = generateLocalMockChatItems(1)
    const baseMockChat = mockChats[0]

    // Генерируем уникальный ID на основе текущего времени и случайного числа
    const uniqueId =
        Math.floor(Date.now() / 1000) * 1000 +
        Math.floor(Math.random() * 1000)
    // 3. Простое преобразование members в participants
    const participants: Participant[] = members.map(
        contactToParticipant,
    )

    // Используем фото URL если есть, иначе генерируем аватар на основе имени
    let avatarUrl = photoUrl

    if (!avatarUrl) {
        // Для групп и каналов используем соответствующие локальные иконки
        if (chatType.includes('group')) {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
        } else if (chatType.includes('channel')) {
            avatarUrl = '/images/chatHeader/userAvatar.svg'
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
                    participants.length > 0 // ← ИСПРАВЛЕНО: используем participants вместо members
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
        description: description, // ← ДОБАВЛЕНО: передаем описание
        participants: participants, // ← ДОБАВЛЕНО
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

// Thunk для создания группы с явными типами для rejectWithValue
export const createGroup = createAsyncThunk<
    ChatWithSettings,
    CreateGroupPayload,
    { rejectValue: string }
>(
    'chats/createGroup',
    async ({ groupData, members }, { rejectWithValue }) => {
        try {
            const chatType =
                groupData.type === 'open'
                    ? 'public-group'
                    : 'private-group'

            // Создаем URL для фото
            const photoUrl = createPhotoUrl(groupData.photo)

            const mockData = createMockChatFromResponse(
                groupData.name,
                groupData.description,
                chatType,
                photoUrl,
                members,
            )

            const transformedData =
                transformFromApi<ApiChatItem>(mockData)

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

// Thunk для создания канала с явными типами для rejectWithValue
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
            const chatType =
                channelData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'

            // Создаем URL для фото
            const photoUrl = createPhotoUrl(
                channelData.photo,
            )

            const mockData = createMockChatFromResponse(
                channelData.name,
                channelData.description,
                chatType,
                photoUrl,
                members,
            )

            const transformedData =
                transformFromApi<ApiChatItem>(mockData)

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
