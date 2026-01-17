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
// createAsyncThunk автоматически создает action types: chats/fetchChats/pending, /fulfilled, /rejected
export const fetchChats = createAsyncThunk(
    'chats/fetchChats', // Префикс для action types
    async (count: number = 15, { rejectWithValue }) => {
        try {
            // Получаем моковые данные (в реальном приложении здесь был бы API-запрос)
            // generateLocalMockChatItems создает массив тестовых данных для разработки
            const mockData =
                generateLocalMockChatItems(count)

            // Преобразуем в camelCase для UI
            // Фильтруем валидные данные - убираем null/undefined значения
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
            // transformChatListFromApi конвертирует snake_case API формата в camelCase UI формата
            return transformChatListFromApi(validData)
        } catch {
            // Обработка ошибок
            // rejectWithValue позволяет передать кастомное значение при rejection
            return rejectWithValue(
                'Не удалось загрузить чаты',
            )
        }
    },
)

// Обработчики для этого thunk (extraReducers)
// Вынесены в отдельную функцию для лучшей организации кода и переиспользования
export const handleFetchChats = (
    builder: ActionReducerMapBuilder<ChatsState>, // Типизированный builder от Redux Toolkit
    initialState: ChatsState, // Начальное состояние для сброса при ошибке
) => {
    builder
        // Обработка начала загрузки
        // Устанавливаем loading: true и сбрасываем ошибку
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
                // Проходим по всем чатам и создаем объект настроек если его нет
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
            state.error = action.payload as string // Сохраняем сообщение об ошибке
            state.chatSettings = initialState.chatSettings // Сбрасываем настройки к начальному состоянию
        })
}
