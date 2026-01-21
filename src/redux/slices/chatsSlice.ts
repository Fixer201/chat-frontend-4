// Redux slice для управления состоянием чатов
import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    ChatItem,
    ChatsState,
    ChatSettings,
} from '@shared/types/chat'
import {
    handleFetchChats,
    fetchChats,
} from '@redux/extraReducers/chat-extraReducers/fetchChatsExtraRed'

// Начальное состояние для чатов
// Определяет структуру состояния и начальные значения
const initialState: ChatsState = {
    items: [], // Массив чатов - инициализируем пустым массивом
    loading: false, // Флаг загрузки - false по умолчанию
    error: null, // Ошибка загрузки - null по умолчанию
    selectedChatId: null, // ID выбранного чата - null если ни один не выбран
    chatSettings: {}, // Настройки для каждого чата (ключ - ID чата) - пустой объект
}

// Создание slice для чатов с помощью Redux Toolkit
// Slice включает редьюсеры и action creators
const chatsSlice = createSlice({
    name: 'chats', // Имя slice, используется в DevTools и для создания action types
    initialState,
    reducers: {
        // Установка выбранного чата
        // Принимает number | null - позволяет как выбрать чат, так и снять выбор
        setSelectedChat: (
            state,
            action: PayloadAction<number | null>,
        ) => {
            state.selectedChatId = action.payload // Просто заменяем значение
        },

        // Обновление данных конкретного чата
        // Находит чат по ID и заменяет его новыми данными
        updateChat: (
            state,
            action: PayloadAction<ChatItem>,
        ) => {
            const index = state.items.findIndex(
                (chat) => chat.id === action.payload.id,
            )
            if (index !== -1) {
                state.items[index] = action.payload // Заменяем весь объект чата
            }
        },

        // Обновление настроек конкретного чата
        // Принимает chatId и partial объект настроек для мерджа
        updateChatSettings: (
            state,
            action: PayloadAction<{
                chatId: number
                settings: Partial<ChatSettings>
            }>,
        ) => {
            const { chatId, settings } = action.payload

            // Если настройки для этого чата еще не существуют, создаем их
            // Это ленивая инициализация - создаем объект настроек только когда он нужен
            if (!state.chatSettings[chatId]) {
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: chat?.isFavorite || false, // Берем значение из чата или false
                    isChatRead: chat?.newMessageCount === 0, // Чат прочитан если нет новых сообщений
                    notificationsEnabled:
                        chat?.notifications ?? true, // nullish coalescing - true если null/undefined
                    isDeleted: false,
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
            }

            // Обновляем настройки мерджем существующих с новыми
            // Используем spread оператор для поверхностного копирования
            state.chatSettings[chatId] = {
                ...state.chatSettings[chatId],
                ...settings, // Новые настройки перезаписывают старые
            }

            // Обновляем также в items для совместимости со старым кодом
            // Это дублирование данных нужно для компонентов, которые работают с items напрямую
            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )
            if (
                chatIndex !== -1 &&
                state.items[chatIndex].settings
            ) {
                state.items[chatIndex].settings = {
                    ...state.items[chatIndex].settings!,
                    ...settings,
                }
            }
        },

        // Переключение избранного статуса чата
        // Инвертирует текущее значение isFavorite
        toggleFavorite: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                // Если настройки уже существуют - просто инвертируем isFavorite
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isFavorite: !currentSettings.isFavorite,
                }
            } else {
                // Если настроек нет - создаем их с isFavorite: true
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: true, // При первом добавлении в избранное ставим true
                    isChatRead: chat?.newMessageCount === 0,
                    notificationsEnabled:
                        chat?.notifications ?? true,
                    isDeleted: false,
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
            }
        },

        // Переключение состояния уведомлений
        // Инвертирует notificationsEnabled
        toggleNotifications: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    notificationsEnabled:
                        !currentSettings.notificationsEnabled,
                }
            }
            // Если настроек нет - ничего не делаем, так как нечего инвертировать
        },

        // Пометка чата как прочитанного
        // Устанавливает isChatRead: true и сохраняет originalUnreadCount
        markAsRead: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isChatRead: true,
                    originalUnreadCount:
                        currentSettings.originalUnreadCount >
                        0
                            ? currentSettings.originalUnreadCount
                            : 0, // Сохраняем оригинальное значение если > 0
                }
            }
        },

        // Пометка чата как непрочитанного
        // Устанавливает isChatRead: false и сбрасывает счетчик
        markAsUnread: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isChatRead: false,
                    originalUnreadCount: 0, // Сбрасываем счетчик при пометке как непрочитанного
                }
            }
        },

        // Пометка чата как удаленного
        // Не удаляет чат из items, а только помечает isDeleted: true
        // Это "soft delete" - данные сохраняются, но не отображаются
        markAsDeleted: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const currentSettings =
                state.chatSettings[chatId]

            if (currentSettings) {
                state.chatSettings[chatId] = {
                    ...currentSettings,
                    isDeleted: true,
                }
            } else {
                // Если настроек нет - создаем их с isDeleted: true
                const chat = state.items.find(
                    (c) => c.id === chatId,
                )
                state.chatSettings[chatId] = {
                    isFavorite: false, // Удаленный чат не может быть избранным
                    isChatRead: chat?.newMessageCount === 0,
                    notificationsEnabled:
                        chat?.notifications ?? true,
                    isDeleted: true, // Основной флаг удаления
                    originalUnreadCount:
                        chat?.newMessageCount || 0,
                }
            }
        },

        // Добавление чата в контакты
        // Обновляет isInContacts в основном объекте чата
        addToContacts: (
            state,
            action: PayloadAction<number>,
        ) => {
            const chatId = action.payload
            const chatIndex = state.items.findIndex(
                (c) => c.id === chatId,
            )

            if (chatIndex !== -1) {
                state.items[chatIndex].chat.isInContacts =
                    true // Прямое обновление вложенного свойства
            }
        },

        // Сброс всех настроек чатов
        // Очищает весь объект chatSettings
        resetChatSettings: (state) => {
            state.chatSettings = {} // Присваиваем пустой объект
        },
    },
    // Обработчики для асинхронных действий (загрузка чатов)
    // extraReducers позволяет обрабатывать actions из других slice или thunk actions
    extraReducers: (builder) => {
        handleFetchChats(builder, initialState) // Выносим логику в отдельную функцию для чистоты кода
    },
})
// Экспорт асинхронного thunk для загрузки чатов
export { fetchChats }
// Экспорт всех action creators
// Redux Toolkit автоматически создает action creators для каждого reducer
export const {
    setSelectedChat,
    updateChat,
    updateChatSettings,
    toggleFavorite,
    toggleNotifications,
    markAsRead,
    markAsUnread,
    markAsDeleted,
    addToContacts,
    resetChatSettings,
} = chatsSlice.actions
// Экспорт reducer
export default chatsSlice.reducer
