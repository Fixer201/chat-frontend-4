// Redux extraReducers для обработки асинхронной загрузки чатов
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
// createAsyncThunk автоматически создает action types: chats/fetchChats/pending, /fulfilled, /rejected
export const fetchChats = createAsyncThunk(
    'chats/fetchChats', // Префикс для action types
    async (count: number = 15, { rejectWithValue }) => {
        try {
            // Получаем моковые данные (в реальном приложении здесь был бы API-запрос)
            // generateLocalMockChatItems создает массив тестовых данных для разработки
            const mockData =
                generateLocalMockChatItems(count)

            // Фильтруем валидные данные - убираем null/undefined значения
            const validData = mockData.filter(
                (item): item is ApiChatItem =>
                    item !== null &&
                    item !== undefined &&
                    item.id !== undefined &&
                    item.chat !== undefined,
            )

            // Трансформируем данные и добавляем настройки
            const transformedChats = validData.map(
                (item) => {
                    // Используем универсальную функцию трансформации
                    const transformedItem =
                        transformFromApi<ApiChatItem>(item)

                    // Добавляем настройки чата
                    return {
                        ...transformedItem,
                        settings: createChatSettings(item),
                    } as ChatItemWithSettings
                },
            )

            // Возвращаем трансформированные данные с настройками
            return transformedChats
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
            (
                state,
                action: PayloadAction<
                    ChatItemWithSettings[]
                >,
            ) => {
                state.loading = false

                // Сохраняем загруженные чаты
                state.items = action.payload.map((chat) => {
                    // Извлекаем только данные чата без настроек
                    const { settings, ...chatData } = chat
                    return chatData
                })

                // Инициализируем настройки для каждого загруженного чата
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
        // Обработка ошибки загрузки
        .addCase(fetchChats.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string // Сохраняем сообщение об ошибке
            state.chatSettings = initialState.chatSettings // Сбрасываем настройки к начальному состоянию
        })
}
