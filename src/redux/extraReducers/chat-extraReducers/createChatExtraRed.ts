import {
    createAsyncThunk,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import { addChatToStorage } from '@shared/lib/localStorageChats'
import { saveGroupParticipants } from '@shared/lib/localStorageGroupParticipants'
import { contactToGroupParticipant } from '@shared/lib/participantUtils'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ApiChatItem,
    ChatItem,
    ChatsState,
} from '@shared/types/chat'
import { Contact, GroupParticipant } from '@shared/types/contact'
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

// Тип участника чата
interface Participant {
    uid: string
    full_name: string
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
    } catch (error) {
        return null
    }
}

// Создание моковых данных чата на основе переданных параметров
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
// export const createGroup = createAsyncThunk<
//     ChatWithSettings,
//     CreateGroupPayload,
//     { rejectValue: string }
// >(
//     'chats/createGroup',
//     async ({ groupData, members }, { rejectWithValue }) => {
//         try {
//             // Определение типа чата на основе выбранного типа группы
//             const chatType =
//                 groupData.type === 'open'
//                     ? 'public-group'
//                     : 'private-group'

//             const photoUrl = createPhotoUrl(groupData.photo)

//             // Создание моковых данных для нового чата
//             const mockData = createMockChatFromResponse(
//                 groupData.name,
//                 groupData.description,
//                 chatType,
//                 photoUrl,
//                 members,
//             )
//             // Сохраняем в localStorage
//             addChatToStorage(mockData)
//             // Трансформация API данных в формат приложения
//             const transformedData =
//                 transformFromApi<ApiChatItem>(mockData)

//             // Дополнение данных чата
//             const enhancedChat: ChatItem = {
//                 ...transformedData,
//                 chat: {
//                     ...transformedData.chat,
//                     isInContacts: true,
//                 },
//             }

//             return {
//                 chat: enhancedChat,
//                 settings: {
//                     isFavorite: false,
//                     isChatRead: true,
//                     notificationsEnabled: true,
//                     isDeleted: false,
//                     originalUnreadCount: 0,
//                 },
//             }
//         } catch (error) {
//             const errorMessage =
//                 error instanceof Error
//                     ? error.message
//                     : 'Ошибка при создании группы'
//             return rejectWithValue(errorMessage)
//         }
//     },
// )

export const createGroup = createAsyncThunk<
  ChatWithSettings,
  CreateGroupPayload,
  { rejectValue: string }
>(
  'chats/createGroup',
  async ({ groupData, members }, { rejectWithValue }) => {
    try {
      const chatType =
        groupData.type === 'open' ? 'public-group' : 'private-group'

      const photoUrl = createPhotoUrl(groupData.photo)

      const mockData = createMockChatFromResponse(
        groupData.name,
        groupData.description,
        chatType,
        photoUrl,
        members,
      )

      // Сохраняем сам чат в localStorage
      addChatToStorage(mockData)
        
      // --- НОВЫЙ КОД ---
      // Преобразуем members в детальных участников
      const detailedParticipants: GroupParticipant[] = members.map(
        (contact, index) => contactToGroupParticipant(contact, index === 0)
      )

      // Добавляем текущего пользователя как владельца, если его нет
      const currentUser: GroupParticipant = {
        uid: 'current-user-uid', // TODO: заменить на реальный uid
        firstName: 'Я',
        lastName: '',
        avatarUrl: '/images/chatHeader/userAvatar.svg',
        avatarWebpUrl: '/images/chatHeader/userAvatar.svg',
        isOwner: true,
        isBlocked: false,
        isOnline: true,
        wasOnlineAt: Date.now(),
        isInContacts: true,
      }

      if (!detailedParticipants.some(p => p.uid === currentUser.uid)) {
        detailedParticipants.unshift(currentUser)
      }

      // Сохраняем детальных участников
     saveGroupParticipants(mockData.chat_key, detailedParticipants)
      // --- КОНЕЦ НОВОГО КОДА ---

      const transformedData = transformFromApi<ApiChatItem>(mockData)

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
        error instanceof Error ? error.message : 'Ошибка при создании группы'
      return rejectWithValue(errorMessage)
    }
  }
)

// Thunk для создания канала с обработкой ошибок через rejectWithValue
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
            // Определение типа чата на основе выбранного типа канала
            const chatType =
                channelData.type === 'public'
                    ? 'public-channel'
                    : 'private-channel'

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

// Обработчики состояний для thunk'ов создания чатов
export const handleCreateChat = (
    builder: ActionReducerMapBuilder<ChatsState>,
) => {
    builder
        // Обработка состояния загрузки при создании группы
        .addCase(createGroup.pending, (state) => {
            state.loading = true
            state.error = null
        })
        // Обработка успешного создания группы
        .addCase(createGroup.fulfilled, (state, action) => {
            state.loading = false
            state.error = null

            // Проверка на существование чата с таким ID
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

            // Добавление настроек для нового чата
            if (
                !state.chatSettings[action.payload.chat.id]
            ) {
                state.chatSettings[action.payload.chat.id] =
                    action.payload.settings
            }

            // Обновление настроек в объекте чата для обратной совместимости
            const chatIndex = state.items.findIndex(
                (chat) =>
                    chat.id === action.payload.chat.id,
            )
            if (chatIndex !== -1) {
                state.items[chatIndex].settings =
                    action.payload.settings
            }

            // Автоматический выбор созданного чата
            state.selectedChatId = action.payload.chat.id
        })
        // Обработка ошибки при создании группы
        .addCase(createGroup.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
        // Обработка состояния загрузки при создании канала
        .addCase(createChannel.pending, (state) => {
            state.loading = true
            state.error = null
        })
        // Обработка успешного создания канала
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
        // Обработка ошибки при создании канала
        .addCase(
            createChannel.rejected,
            (state, action) => {
                state.loading = false
                state.error = action.payload as string
            },
        )
}
