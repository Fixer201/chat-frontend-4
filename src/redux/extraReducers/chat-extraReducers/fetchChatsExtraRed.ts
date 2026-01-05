import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformChatListFromApi } from '@shared/lib/transformChatData'
import { ChatItem, ChatsState } from '@shared/types/chat'

export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (count: number = 15, { rejectWithValue }) => {
        try {
            // Получаем моковые данные
            const mockData =
                generateLocalMockChatItems(count)

            // Преобразуем в camelCase для UI
            // Фильтруем валидные данные
            const validData = mockData.filter(
                (item): item is Required<typeof item> =>
                    item !== null &&
                    item !== undefined &&
                    item.id !== undefined &&
                    item.chat !== undefined,
            ) as unknown as Parameters<
                typeof transformChatListFromApi
            >[0]

            return transformChatListFromApi(validData)
        } catch {
            return rejectWithValue(
                'Не удалось загрузить чаты',
            )
        }
    },
)

// Обработчики для этого thunk
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
            (state, action: PayloadAction<ChatItem[]>) => {
                state.loading = false
                state.items = action.payload
                action.payload.forEach((chat) => {
                    if (!state.chatSettings[chat.id]) {
                        state.chatSettings[chat.id] = {
                            isFavorite:
                                chat.isFavorite || false,
                            isChatRead:
                                chat.newMessageCount === 0,
                            notificationsEnabled:
                                chat.notifications ?? true,
                            isDeleted: false,
                            originalUnreadCount:
                                chat.newMessageCount || 0,
                        }
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
