// Redux extraReducers для обработки асинхронной загрузки чатов
import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformChatListFromApi } from '@shared/lib/transformChatData'
import { ChatItem, ChatsState } from '@shared/types/chat'

// Асинхронный thunk для загрузки чатов
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (count: number = 15, { rejectWithValue }) => {
        try {
            // Получаем моковые данные (в реальном приложении здесь был бы API-запрос)
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

            // Возвращаем трансформированные данные
            return transformChatListFromApi(validData)
        } catch {
            // Обработка ошибок
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
        // Обработка начала загрузки
        .addCase(fetchChats.pending, (state) => {
            state.loading = true
            state.error = null
        })
        // Обработка успешной загрузки
        .addCase(
            fetchChats.fulfilled,
            (state, action: PayloadAction<ChatItem[]>) => {
                state.loading = false
                state.items = action.payload // Сохраняем загруженные чаты
                // Инициализируем настройки для каждого загруженного чата
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
        // Обработка ошибки загрузки
        .addCase(fetchChats.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
            state.chatSettings = initialState.chatSettings // Сбрасываем настройки
        })
}
