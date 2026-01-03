import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformChatListFromApi } from '@shared/lib/transformChatData'
import { ChatItem, ChatsState } from '@shared/types/chat'
// Async thunk для загрузки чатов
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
            },
        )
        .addCase(fetchChats.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
}
