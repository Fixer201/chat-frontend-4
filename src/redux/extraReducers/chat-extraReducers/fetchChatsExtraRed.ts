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

// Асинхронный thunk для загрузки чатов с сервера (обновлён для поиска и ошибок)
export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async (
        {
            search = '',
            count = 15,
        }: { search?: string; count?: number },
        { rejectWithValue },
    ) => {
        try {
            const accessToken = Cookies.get('access_token')
            if (!accessToken) {
                throw new Error('AccessTokenNotFound')
            }

            const url = new URL(
                'https://api.test.chat.ktsf.ru/api/v1/chat/list/',
            )
            if (search)
                url.searchParams.append('search', search)
            url.searchParams.append(
                'limit',
                count.toString(),
            ) // Используем limit вместо page_size

            let response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            if (response.status === 401) {
                // Попытка refresh token
                const refreshToken =
                    Cookies.get('refresh_token')
                if (refreshToken) {
                    const refreshResponse = await fetch(
                        '/api/auth/refresh',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                            },
                            body: JSON.stringify({
                                refresh: refreshToken,
                            }),
                        },
                    )
                    if (refreshResponse.ok) {
                        const data =
                            await refreshResponse.json()
                        Cookies.set(
                            'access_token',
                            data.access,
                            { expires: 7 },
                        )
                        // Повторный запрос с новым токеном
                        response = await fetch(
                            url.toString(),
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type':
                                        'application/json',
                                    Authorization: `Bearer ${data.access}`,
                                },
                            },
                        )
                    } else {
                        throw new Error(
                            'RefreshTokenExpired',
                        )
                    }
                } else {
                    throw new Error('RefreshTokenNotFound')
                }
            }

            if (!response.ok) {
                if (response.status === 414) {
                    throw new Error(
                        'Размер query-параметра превышает установленный лимит.',
                    )
                }
                throw new Error(
                    `Ошибка API: ${response.status} ${response.statusText}`,
                )
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

// Обработчики состояний для thunk'а загрузки чатов (без изменений)
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
                const fetchedItems = action.payload.map(
                    // Деструктуризация для исключения settings из данных чата
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ({ settings, ...chatData }) => chatData,
                )

                // Сохраняем локально созданные чаты, которых нет в ответе API
                const fetchedIds = new Set(
                    fetchedItems.map((chat) => chat.id),
                )
                const fetchedContactUids = new Set(
                    fetchedItems.map(
                        (chat) => chat.chat.uid,
                    ),
                )
                const localOnlyItems = state.items.filter(
                    (chat) => {
                        if (fetchedIds.has(chat.id))
                            return false
                        if (
                            chat.isTemporary &&
                            chat.tempContactUid &&
                            fetchedContactUids.has(
                                chat.tempContactUid,
                            )
                        ) {
                            return false
                        }
                        return true
                    },
                )

                state.items = [
                    ...localOnlyItems,
                    ...fetchedItems,
                ]

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
