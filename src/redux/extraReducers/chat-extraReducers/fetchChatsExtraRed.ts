import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import {
    generateAndCacheChats,
    loadChatsFromStorage,
} from '@shared/lib/localStorageChats'
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data'
import { transformFromApi } from '@shared/lib/transformChatData'
import {
    ChatItem,
    ChatsState,
    ApiChatItem,
} from '@shared/types/chat'

// Расширенный тип чата с настройками
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

// Создание настроек чата на основе данных из API
const createChatSettings = (apiChatItem: ApiChatItem) => ({
    isFavorite: apiChatItem.is_favorite || false,
    isChatRead: apiChatItem.new_message_count === 0,
    notificationsEnabled: apiChatItem.notifications ?? true,
    isDeleted: false,
    originalUnreadCount: apiChatItem.new_message_count || 0,
})

// Асинхронный thunk для загрузки чатов с сервера
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (count: number = 15, { rejectWithValue }) => {
        try {
            // Генерация моковых данных (в реальном приложении здесь был бы API запрос)
            // const mockData =
            //     generateLocalMockChatItems(count)
            // Пытаемся загрузить из localStorage
            let apiChats = loadChatsFromStorage()

            if (!apiChats) {
                // Если нет, генерируем и кэшируем
                apiChats = generateAndCacheChats(count)
            } else {
                // Можно опционально обрезать/дополнить до нужного количества,
                // но для простоты используем как есть
            }
            // Фильтрация валидных данных
            const validData = apiChats.filter(
                (item): item is ApiChatItem =>
                    item !== null &&
                    item !== undefined &&
                    item.id !== undefined &&
                    item.chat !== undefined,
            )

            // Трансформация API данных в формат приложения с добавлением настроек
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

// Обработчики состояний для thunk'а загрузки чатов
export const handleFetchChats = (
    builder: ActionReducerMapBuilder<ChatsState>,
    initialState: ChatsState,
) => {
    builder
        // Обработка состояния загрузки
        .addCase(fetchChats.pending, (state) => {
            state.loading = true
            state.error = null
        })
        // Обработка успешной загрузки чатов
        .addCase(
            fetchChats.fulfilled,
            (
                state,
                action: PayloadAction<
                    ChatItemWithSettings[]
                >,
            ) => {
                state.loading = false

                // Разделение данных чата и настроек для хранения в разных структурах
                state.items = action.payload.map((chat) => {
                    const { settings, ...chatData } = chat
                    return chatData
                })

                // Сохранение настроек для каждого чата
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
            state.error = action.payload as string
            state.chatSettings = initialState.chatSettings
        })
}
