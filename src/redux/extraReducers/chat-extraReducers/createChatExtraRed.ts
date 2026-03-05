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
import { wsChatService } from '@shared/lib/webSocketChatService'

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
        // Не сохраняем "chat_key_0" — это временные чаты без сообщений.
        const localChats = state.items
            .filter((chat) => {
                const chatKey =
                    (
                        chat as {
                            chatKey?: string
                            chat_key?: string
                        }
                    ).chatKey ||
                    (chat as { chat_key?: string }).chat_key
                return (
                    chat.id > LOCAL_CHAT_ID_THRESHOLD &&
                    chatKey !== 'chat_key_0'
                )
            })
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
            avatarUrl = '/images/chatHeader/groupAvatar.svg'
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
                    chatType === 'chat'
                        ? ''
                        : participants.length > 0
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
        description: description,
        participants: participants,
        last_message: {
            ...baseMockChat.last_message,
            content:
                chatType === 'chat'
                    ? ''
                    : participants.length > 0
                      ? `Создана ${chatType.includes('group') ? 'группа' : 'канал'}. Участников: ${participants.length}`
                      : `Создана ${chatType.includes('group') ? 'группа' : 'канал'}`,
        },
    }
    return modifiedMockChat
}

// Helper function to convert File to base64 for WebSocket
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            // Remove data:image/...;base64, prefix
            const base64 = result.split(',')[1]
            if (!base64) {
                reject(
                    new Error(
                        'Failed to extract base64 data from file',
                    ),
                )
                return
            }
            resolve(base64)
        }
        reader.onerror = () =>
            reject(new Error('FileReader error'))
        reader.readAsDataURL(file)
    })
}

// Helper to get correct file extension from MIME type
const getExtensionFromMimeType = (
    mimeType: string,
): string => {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/bmp': '.bmp',
        'image/webp': '.webp',
    }
    return mimeToExt[mimeType] || '.png'
}

// Helper to get correct filename with proper extension
const getAvatarFilename = (file: File): string => {
    const ext = getExtensionFromMimeType(file.type)
    // Remove existing extension and add correct one
    const baseName =
        file.name.replace(/\.[^/.]+$/, '') || 'avatar'
    return `${baseName}${ext}`
}

// Validate avatar file before sending
const validateAvatarFile = (
    file: File,
): { valid: boolean; error?: string } => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        }
    }

    // Check MIME type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/bmp',
    ]
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, BMP`,
        }
    }

    return { valid: true }
}

// Helper function to transform WebSocket response to ApiChatItem
const transformWsResponseToApiChatItem = (
    obj: Record<string, unknown>,
    chatType: string,
    members: Contact[],
    photoUrl: string | null,
): ApiChatItem => {
    const now = Math.floor(Date.now() / 1000)
    const participants = members.map((m) => ({
        uid: m.uid,
        full_name:
            `${m.firstName || ''} ${m.lastName || ''}`.trim() ||
            m.nickname ||
            m.username ||
            'Участник',
    }))

    // Add creator if not in participants
    const createdBy =
        (obj.created_by as string) || 'current-user-uid'
    const ownerFullName =
        (obj.owner_full_name as string) || 'Создатель'

    if (!participants.some((p) => p.uid === createdBy)) {
        participants.unshift({
            uid: createdBy,
            full_name: ownerFullName,
        })
    }

    const avatarUrl =
        (obj.avatar as { url?: string })?.url ||
        photoUrl ||
        '/images/chatHeader/groupAvatar.svg'

    // Safe ID parsing - ensure we never get NaN
    const generateUniqueId = () =>
        Math.floor(Date.now() / 1000) * 1000 +
        Math.floor(Math.random() * 1000)

    const rawChatId = obj.chat_id
    let chatId: number
    if (
        typeof rawChatId === 'number' &&
        !isNaN(rawChatId)
    ) {
        chatId = rawChatId
    } else if (
        typeof rawChatId === 'string' &&
        rawChatId.trim() !== ''
    ) {
        const parsed = parseInt(rawChatId, 10)
        chatId = isNaN(parsed) ? generateUniqueId() : parsed
    } else {
        chatId = generateUniqueId()
    }

    return {
        id: chatId,
        chat: {
            uid: createdBy,
            username: '',
            nickname: ownerFullName,
            first_name: ownerFullName,
            last_name: '',
            avatar: avatarUrl.replace(
                '/images/chatHeader/',
                '',
            ),
            avatar_url: avatarUrl,
            avatar_webp: avatarUrl
                .replace('/images/chatHeader/', '')
                .replace('.svg', '.webp'),
            avatar_webp_url: avatarUrl,
            is_blocked: false,
            is_online: true,
            was_online_at: now,
            is_in_contacts: true,
        },
        is_active: true,
        is_favorite: false,
        notifications: true,
        index: chatId,
        message_count: 0,
        file_count: 0,
        new_message_count: 0,
        new_file_count: 0,
        name: (obj.name as string) || 'Группа',
        chat_type: chatType as
            | 'chat'
            | 'public-group'
            | 'private-group'
            | 'public-channel'
            | 'private-channel',
        chat_key:
            (obj.chat_key as string) ||
            `chat_${Date.now()}`,
        description: (obj.description as string) || '',
        created_by: createdBy,
        owner_full_name: ownerFullName,
        participants: participants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: now,
        last_seen_message: { id: 0, uid: '' },
        first_new_message: { id: 0, uid: '' },
        last_message: {
            id: 0,
            uid: '',
            from_user: 'Вы',
            content:
                participants.length > 0
                    ? `Создана группа. Участников: ${participants.length}`
                    : 'Создана группа',
            files_summary: { types: [], count: 0 },
            has_replied_message: false,
            has_forwarded_message: false,
            new: false,
            created_at: now,
            updated_at: now,
        },
    }
}

// Thunk для создания группы (WebSocket -> HTTP API -> Mock fallback)
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
        console.log(
            '\n=========================================',
        )
        console.log(
            '[createGroup] 🚀 Starting group creation',
        )
        console.log('[createGroup] 📝 Group data:', {
            name: groupData.name,
            description: groupData.description,
            type: groupData.type,
            hasPhoto: !!groupData.photo,
            photoName: groupData.photo?.name,
            photoType: groupData.photo?.type,
            photoSize: groupData.photo?.size,
        })
        console.log(
            '[createGroup] 👥 Members:',
            members.map((m) => ({
                uid: m.uid,
                name: m.firstName,
            })),
        )
        console.log(
            '=========================================',
        )

        try {
            const accessToken = Cookies.get('access_token')
            console.log(
                '[createGroup] 🔑 Has access token:',
                !!accessToken,
            )

            const chatType =
                groupData.type === 'open'
                    ? 'public-group'
                    : 'private-group'
            console.log(
                '[createGroup] 🏠 Chat type:',
                chatType,
            )

            let apiChat: ApiChatItem | null = null
            let wsError = false
            let httpError = false

            // ========== STEP 1: Try WebSocket first ==========
            if (accessToken) {
                console.log(
                    '[createGroup] 📡 STEP 1: Trying WebSocket...',
                )
                try {
                    // Prepare avatar if exists
                    let avatar: {
                        filename: string
                        data: string
                    } | null = null
                    if (groupData.photo) {
                        // Validate avatar file
                        const validation =
                            validateAvatarFile(
                                groupData.photo,
                            )
                        if (!validation.valid) {
                            console.warn(
                                '[createGroup] Avatar validation failed:',
                                validation.error,
                            )
                        } else {
                            try {
                                const base64Data =
                                    await fileToBase64(
                                        groupData.photo,
                                    )
                                const filename =
                                    getAvatarFilename(
                                        groupData.photo,
                                    )
                                avatar = {
                                    filename: filename,
                                    data: base64Data,
                                }
                                console.log(
                                    '[createGroup] Avatar prepared:',
                                    {
                                        filename: filename,
                                        type: groupData
                                            .photo.type,
                                        size: `${(groupData.photo.size / 1024).toFixed(2)}KB`,
                                        base64Length:
                                            base64Data.length,
                                    },
                                )
                            } catch (e) {
                                console.warn(
                                    '[createGroup] Failed to convert avatar to base64:',
                                    e,
                                )
                            }
                        }
                    }

                    // Call WebSocket service
                    const wsResult =
                        await wsChatService.createChat({
                            name: groupData.name,
                            description:
                                groupData.description,
                            chatType: chatType,
                            uidUsersList: members.map(
                                (m) => m.uid,
                            ),
                            avatar: avatar,
                        })

                    if (wsResult.success && wsResult.chat) {
                        // Transform WebSocket response to ApiChatItem
                        const photoUrl = createPhotoUrl(
                            groupData.photo,
                        )
                        apiChat =
                            transformWsResponseToApiChatItem(
                                wsResult.chat as Record<
                                    string,
                                    unknown
                                >,
                                chatType,
                                members,
                                photoUrl,
                            )
                        console.log(
                            '[createGroup] WebSocket success:',
                            apiChat,
                        )
                    } else {
                        console.warn(
                            '[createGroup] WebSocket failed:',
                            wsResult.error,
                        )
                        wsError = true
                    }
                } catch (error) {
                    console.warn(
                        '[createGroup] WebSocket error:',
                        error,
                    )
                    wsError = true
                }
            }

            // ========== STEP 2: Fallback to HTTP API ==========
            if (wsError && accessToken) {
                try {
                    const body = {
                        name: groupData.name,
                        description: groupData.description,
                        type: chatType,
                        members: members.map((m) => ({
                            uid: m.uid,
                        })),
                    }

                    const response = await fetch(
                        '/api/v1/chat/create-group',
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
                        console.log(
                            '[createGroup] HTTP API success:',
                            apiChat,
                        )
                    } else {
                        console.warn(
                            '[createGroup] HTTP API failed:',
                            response.status,
                        )
                        httpError = true
                    }
                } catch (error) {
                    console.warn(
                        '[createGroup] HTTP API error:',
                        error,
                    )
                    httpError = true
                }
            }

            // ========== STEP 3: Fallback to Mock ==========
            let finalApiChat: ApiChatItem
            if (apiChat) {
                finalApiChat = apiChat
            } else {
                const photoUrl = createPhotoUrl(
                    groupData.photo,
                )
                finalApiChat = createMockChatFromResponse(
                    groupData.name,
                    groupData.description,
                    chatType,
                    photoUrl,
                    members,
                )
                console.log(
                    '[createGroup] Using mock fallback:',
                    finalApiChat,
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

// Thunk для создания канала (WebSocket -> HTTP API -> Mock fallback)
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
            const chatType =
                channelData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'

            let apiChat: ApiChatItem | null = null
            let wsError = false
            let httpError = false

            // ========== STEP 1: Try WebSocket first ==========
            if (accessToken) {
                try {
                    // Prepare avatar if exists
                    let avatar: {
                        filename: string
                        data: string
                    } | null = null
                    if (channelData.photo) {
                        // Validate avatar file
                        const validation =
                            validateAvatarFile(
                                channelData.photo,
                            )
                        if (!validation.valid) {
                            console.warn(
                                '[createChannel] Avatar validation failed:',
                                validation.error,
                            )
                        } else {
                            try {
                                const base64Data =
                                    await fileToBase64(
                                        channelData.photo,
                                    )
                                const filename =
                                    getAvatarFilename(
                                        channelData.photo,
                                    )
                                avatar = {
                                    filename: filename,
                                    data: base64Data,
                                }
                                console.log(
                                    '[createChannel] Avatar prepared:',
                                    {
                                        filename: filename,
                                        type: channelData
                                            .photo.type,
                                        size: `${(channelData.photo.size / 1024).toFixed(2)}KB`,
                                        base64Length:
                                            base64Data.length,
                                    },
                                )
                            } catch (e) {
                                console.warn(
                                    '[createChannel] Failed to convert avatar to base64:',
                                    e,
                                )
                            }
                        }
                    }

                    // Call WebSocket service
                    const wsResult =
                        await wsChatService.createChat({
                            name: channelData.name,
                            description:
                                channelData.description,
                            chatType: chatType,
                            uidUsersList: members.map(
                                (m) => m.uid,
                            ),
                            avatar: avatar,
                        })

                    if (wsResult.success && wsResult.chat) {
                        // Transform WebSocket response to ApiChatItem
                        const photoUrl = createPhotoUrl(
                            channelData.photo,
                        )
                        apiChat =
                            transformWsResponseToApiChatItem(
                                wsResult.chat as Record<
                                    string,
                                    unknown
                                >,
                                chatType,
                                members,
                                photoUrl,
                            )
                        // Override name for channel
                        apiChat.name = (
                            wsResult.chat as Record<
                                string,
                                unknown
                            >
                        ).name as string
                        console.log(
                            '[createChannel] WebSocket success:',
                            apiChat,
                        )
                    } else {
                        console.warn(
                            '[createChannel] WebSocket failed:',
                            wsResult.error,
                        )
                        wsError = true
                    }
                } catch (error) {
                    console.warn(
                        '[createChannel] WebSocket error:',
                        error,
                    )
                    wsError = true
                }
            }

            // ========== STEP 2: Fallback to HTTP API ==========
            if (wsError && accessToken) {
                try {
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
                        '/api/v1/chat/create-channel',
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
                        console.log(
                            '[createChannel] HTTP API success:',
                            apiChat,
                        )
                    } else {
                        console.warn(
                            '[createChannel] HTTP API failed:',
                            response.status,
                        )
                        httpError = true
                    }
                } catch (error) {
                    console.warn(
                        '[createChannel] HTTP API error:',
                        error,
                    )
                    httpError = true
                }
            }

            // ========== STEP 3: Fallback to Mock ==========
            let finalApiChat: ApiChatItem
            if (apiChat) {
                finalApiChat = apiChat
            } else {
                const photoUrl = createPhotoUrl(
                    channelData.photo,
                )
                finalApiChat = createMockChatFromResponse(
                    channelData.name,
                    channelData.description,
                    chatType,
                    photoUrl,
                    members,
                )
                // Override last message for channel
                finalApiChat.last_message.content =
                    members.length > 0
                        ? `Создан канал. Участников: ${members.length}`
                        : 'Создан канал'
                console.log(
                    '[createChannel] Using mock fallback:',
                    finalApiChat,
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

// Thunk для создания личного чата
export const createChat = createAsyncThunk<
    ChatWithSettings,
    string,
    { rejectValue: string; state: RootState }
>(
    'chats/createChat',
    async (toUserId, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            // Берём контакт из store, чтобы для локального чата сохранить имя/аватар
            const contactFromContacts =
                state.contacts.list.find(
                    (item) =>
                        item.userUid === toUserId ||
                        item.uid === toUserId,
                )
            const contactFromTemp =
                state.contactsTemp.list.find(
                    (item) =>
                        item.userUid === toUserId ||
                        item.uid === toUserId,
                )
            const contact =
                contactFromContacts || contactFromTemp
            const contactDisplayName =
                `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim() ||
                contact?.nickname ||
                contact?.phone ||
                'Личный чат'
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

            // Локальный мок для личного чата (используется до появления реального чата с сервера)
            const mockChatData = createMockChatFromResponse(
                contactDisplayName,
                '',
                'chat',
                contact?.avatarUrl ||
                    contact?.avatarWebpUrl ||
                    contact?.avatar ||
                    null,
                [],
            )

            const transformedData =
                transformFromApi(mockChatData)

            // Прокидываем данные контакта, чтобы в списке чатов сразу было имя и аватар
            const enhancedChat: ChatItem = {
                ...transformedData,
                isTemporary: true,
                tempContactUid: toUserId,
                name: contactDisplayName,
                chat: {
                    ...transformedData.chat,
                    uid: toUserId,
                    username:
                        contact?.username ||
                        transformedData.chat.username,
                    nickname:
                        contact?.nickname ||
                        transformedData.chat.nickname,
                    firstName:
                        contact?.firstName ||
                        transformedData.chat.firstName,
                    lastName:
                        contact?.lastName ||
                        transformedData.chat.lastName,
                    avatar:
                        contact?.avatar ||
                        transformedData.chat.avatar,
                    avatarUrl:
                        contact?.avatarUrl ||
                        transformedData.chat.avatarUrl,
                    avatarWebp:
                        contact?.avatarWebp ||
                        transformedData.chat.avatarWebp,
                    avatarWebpUrl:
                        contact?.avatarWebpUrl ||
                        transformedData.chat.avatarWebpUrl,
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
