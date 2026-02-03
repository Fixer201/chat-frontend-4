// @redux/extraReducers/chat-extraReducers/fetchChatsExtraRed.ts
import {
    createAsyncThunk,
    PayloadAction,
    ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
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
            const accessToken = Cookies.get('access_token')
            if (!accessToken) {
                throw new Error('AccessTokenNotFound')
            }

            const response = await fetch(
                `https://api.test.chat.ktsf.ru/api/v1/chat/list/?page_size=${count}`, // Реальный endpoint с параметром page_size
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            )
            if (!response.ok) {
                throw new Error('Failed to fetch chats')
            }

            const data: { results: ApiChatItem[] } =
                await response.json()
            const validData = data.results.filter(
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
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Не удалось загрузить чаты'
            return rejectWithValue(errorMessage)
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
                state.items = action.payload.map(
                    // Деструктуризация для исключения settings из данных чата
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ({ settings, ...chatData }) => chatData,
                )

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
