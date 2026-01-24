// @redux/extraReducers/chat-extraReducers/fetchChatsExtraRed.ts
import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ChatItem,
    ChatsState,
    ApiChatItem,
} from '@shared/types/chat'

// Тип для настроек чата, которые добавляются после трансформации
interface ChatItemWithSettings extends Omit<
    ChatItem,
    'settings'
> {
    settings: {
        isFavorite: boolean
        isChatRead: boolean
        notificationsEnabled: boolean
        isDeleted: boolean
        originalUnreadCount: number
    }
}

// Вспомогательная функция для создания настроек чата на основе API данных
const createChatSettings = (apiChatItem: ApiChatItem) => ({
    isFavorite: apiChatItem.is_favorite || false,
    isChatRead: apiChatItem.new_message_count === 0,
    notificationsEnabled: apiChatItem.notifications ?? true,
    isDeleted: false,
    originalUnreadCount: apiChatItem.new_message_count || 0,
})

// Асинхронный thunk для загрузки чатов
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (count: number = 15, { rejectWithValue }) => {
        try {
            const mockData =
                generateLocalMockChatItems(count)

            const validData = mockData.filter(
                (item): item is ApiChatItem =>
                    item !== null &&
                    item !== undefined &&
                    item.id !== undefined &&
                    item.chat !== undefined,
            )

            const transformedChats = validData.map(
                (item) => {
                    const transformedItem =
                        transformFromApi<ApiChatItem>(item)

                    return {
                        ...transformedItem,
                        settings: createChatSettings(item),
                    } as ChatItemWithSettings
                },
            )

            return transformedChats
        } catch {
            return rejectWithValue(
                'Не удалось загрузить чаты',
            )
        }
    },
)

// Обработчики для этого thunk (extraReducers)
export const handleFetchChats = (
    builder: ActionReducerMapBuilder<ChatsState>,
    initialState: ChatsState,
) => {
    builder
        .addCase(fetchChats.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(
            fetchChats.fulfilled,
            (
                state,
                action: PayloadAction<
                    ChatItemWithSettings[]
                >,
            ) => {
                state.loading = false

                state.items = action.payload.map((chat) => {
                    const { settings, ...chatData } = chat
                    return chatData
                })

                action.payload.forEach((chat) => {
                    if (
                        chat.settings &&
                        !state.chatSettings[chat.id]
                    ) {
                        state.chatSettings[chat.id] =
                            chat.settings
                    }
                })
            },
        )
        .addCase(fetchChats.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
            state.chatSettings = initialState.chatSettings
        })
}
