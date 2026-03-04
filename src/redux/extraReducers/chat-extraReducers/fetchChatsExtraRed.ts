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
import { loadChatsFromStorage } from '@shared/lib/localStorageChats'

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

// Асинхронный thunk для загрузки чатов с сервера (с fallback на localStorage)
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
            let apiData: ApiChatItem[] | null = null
            let apiError: string | null = null

            if (accessToken) {
                try {
                    // Относительный URL — запрос проксируется через catch-all route handler
                    // (src/app/api/v1/[...path]/route.ts), который пробрасывает его на Django-бэкенд.
                    // page_size вместо limit — так требует Django REST Framework pagination.
                    let url = `/api/v1/chat/list/?page_size=${count}`
                    if (search)
                        url += `&search=${encodeURIComponent(search)}`

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type':
                                'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                    })

                    if (response.status === 401) {
                        // Попытка refresh token
                        const refreshToken =
                            Cookies.get('refresh_token')
                        if (refreshToken) {
                            const refreshResponse =
                                await fetch(
                                    '/api/auth/refresh',
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type':
                                                'application/json',
                                        },
                                        body: JSON.stringify(
                                            {
                                                refresh:
                                                    refreshToken,
                                            },
                                        ),
                                    },
                                )
                            if (refreshResponse.ok) {
                                const data =
                                    await refreshResponse.json()
                                Cookies.set(
                                    'access_token',
                                    data.access,
                                    {
                                        expires: 7,
                                    },
                                )
                                // Повторный запрос с новым токеном
                                const retryResponse =
                                    await fetch(url, {
                                        method: 'GET',
                                        headers: {
                                            'Content-Type':
                                                'application/json',
                                            Authorization: `Bearer ${data.access}`,
                                        },
                                    })
                                if (retryResponse.ok) {
                                    const retryData: {
                                        results: ApiChatItem[]
                                    } =
                                        await retryResponse.json()
                                    apiData =
                                        retryData.results
                                } else {
                                    apiError = `Ошибка API после рефреша: ${retryResponse.status}`
                                }
                            } else {
                                apiError =
                                    'RefreshTokenExpired'
                            }
                        } else {
                            apiError =
                                'RefreshTokenNotFound'
                        }
                    } else if (response.ok) {
                        const data: {
                            results: ApiChatItem[]
                        } = await response.json()
                        apiData = data.results
                    } else {
                        if (response.status === 414) {
                            apiError =
                                'Размер query-параметра превышает лимит.'
                        } else {
                            apiError = `Ошибка API: ${response.status} ${response.statusText}`
                        }
                    }
                } catch (err) {
                    apiError =
                        err instanceof Error
                            ? err.message
                            : 'Сетевая ошибка'
                }
            }

            // Если API успешно вернул данные, используем их
            if (apiData && apiData.length > 0) {
                const validData = apiData.filter(
                    (item): item is ApiChatItem =>
                        item !== null &&
                        item !== undefined &&
                        item.id !== undefined &&
                        item.chat !== undefined,
                )

                const transformedChats = validData.map(
                    (item) => {
                        const transformedItem =
                            transformFromApi<ApiChatItem>(
                                item,
                            )
                        return {
                            ...transformedItem,
                            settings:
                                createChatSettings(item),
                        } as ChatItemWithSettings
                    },
                )

                return transformedChats
            }

            // Если API не сработал (нет токена или ошибка), загружаем из localStorage
            const storedChats = loadChatsFromStorage()
            if (storedChats && storedChats.length > 0) {
                const transformedStored = storedChats.map(
                    (item) => {
                        const transformedItem =
                            transformFromApi<ApiChatItem>(
                                item,
                            )
                        return {
                            ...transformedItem,
                            settings:
                                createChatSettings(item),
                        } as ChatItemWithSettings
                    },
                )
                return transformedStored
            }

            // Если ничего нет, возвращаем пустой массив
            return []
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

                const selectedChat =
                    state.selectedChatId != null
                        ? state.items.find(
                              (chat) =>
                                  chat.id ===
                                  state.selectedChatId,
                          )
                        : undefined
                const selectedTempContactUid =
                    selectedChat?.isTemporary
                        ? selectedChat.tempContactUid
                        : undefined

                const fetchedItems = action.payload.map(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ({ settings, ...chatData }) => chatData,
                )

                // Сохраняем локально созданные чаты, которых нет в ответе
                const fetchedIds = new Set(
                    fetchedItems.map((chat) => chat.id),
                )
                const fetchedContactUids = new Set(
                    fetchedItems.map(
                        (chat) => chat.chat.uid,
                    ),
                )
                // Сохраняем локальные чаты, которых ещё нет на сервере
                const localOnlyItems = state.items.filter(
                    (chat) => {
                        if (fetchedIds.has(chat.id))
                            return false
                        if (
                            chat.isTemporary &&
                            fetchedContactUids.has(
                                chat.tempContactUid ??
                                    chat.chat.uid,
                            )
                        ) {
                            return false
                        }
                        // Удаляем локальный чат, если сервер уже вернул чат с тем же пользователем
                        if (
                            chat.id > 1000000000000 &&
                            fetchedContactUids.has(
                                chat.chat.uid,
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

                if (selectedTempContactUid) {
                    const realChat = fetchedItems.find(
                        (chat) =>
                            chat.chat.uid ===
                            selectedTempContactUid,
                    )
                    if (realChat) {
                        state.selectedChatId = realChat.id
                    }
                }

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
        .addCase(fetchChats.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
            state.chatSettings = initialState.chatSettings
        })
}
