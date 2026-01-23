// @shared/hooks/useChats.ts
import { useCallback } from 'react'
import {
    useAppDispatch,
    useAppSelector,
} from '../../redux/store'
import {
    fetchChats,
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
    createGroup as createGroupAction,
    createChannel as createChannelAction,
} from '../../redux/slices/chatsSlice'
import { ChatItem, ChatSettings } from '../types/chat'
import { Contact } from '../types/contact'
import { onNextProps } from '../types/createGroup'

// Хук для работы с чатами, предоставляет удобные методы и доступ к состоянию
// Абстрагирует работу с Redux, предоставляя простой API для компонентов
export const useChats = () => {
    // useAppDispatch - типизированная версия useDispatch для TypeScript
    const dispatch = useAppDispatch()

    // Селекторы для получения данных из Redux store
    // useAppSelector подписывает хук на изменения в store
    const {
        items, // Массив чатов
        loading, // Флаг загрузки
        error, // Ошибка
        selectedChatId, // ID выбранного чата
        chatSettings, // Настройки чатов
    } = useAppSelector(
        (state) => state.chats, // Селектор всего slice чатов
    )

    // Загрузка чатов
    // useCallback мемоизирует функцию, предотвращая создание новой при каждом рендере
    // [dispatch] в зависимостях - функция изменится только если изменится dispatch (никогда)
    const loadChats = useCallback(
        (count: number = 20) => {
            dispatch(fetchChats(count)) // Диспатчим thunk action
        },
        [dispatch],
    )

    // Выбор чата
    const selectChat = useCallback(
        (chatId: number | null) => {
            dispatch(setSelectedChat(chatId)) // Простой action без асинхронной логики
        },
        [dispatch],
    )

    // Обновление данных чата
    const updateChatData = useCallback(
        (chat: ChatItem) => {
            dispatch(updateChat(chat))
        },
        [dispatch],
    )

    // Обновление настроек чата
    // Принимает chatId и partial объект настроек
    const updateChatSettingsData = useCallback(
        (
            chatId: number,
            settings: Partial<ChatSettings>,
        ) => {
            dispatch(
                updateChatSettings({ chatId, settings }),
            )
        },
        [dispatch],
    )

    // Переключение избранного статуса
    const toggleFavoriteChat = useCallback(
        (chatId: number) => {
            dispatch(toggleFavorite(chatId))
        },
        [dispatch],
    )

    // Переключение уведомлений
    const toggleChatNotifications = useCallback(
        (chatId: number) => {
            dispatch(toggleNotifications(chatId))
        },
        [dispatch],
    )

    // Пометка как прочитанного
    const markChatAsRead = useCallback(
        (chatId: number) => {
            dispatch(markAsRead(chatId))
        },
        [dispatch],
    )

    // Пометка как непрочитанного
    const markChatAsUnread = useCallback(
        (chatId: number) => {
            dispatch(markAsUnread(chatId))
        },
        [dispatch],
    )

    // Удаление чата (помечаем как удаленный)
    const deleteChat = useCallback(
        (chatId: number) => {
            dispatch(markAsDeleted(chatId)) // Soft delete - не удаляет из хранилища
        },
        [dispatch],
    )

    // Добавление в контакты
    const addChatToContacts = useCallback(
        (chatId: number) => {
            dispatch(addToContacts(chatId))
        },
        [dispatch],
    )

    // Сброс всех настроек
    const resetAllChatSettings = useCallback(() => {
        dispatch(resetChatSettings())
    }, [dispatch])

    // Получение настроек конкретного чата
    // useCallback с [chatSettings] - функция пересоздается при изменении chatSettings
    const getChatSettings = useCallback(
        (chatId: number): ChatSettings | undefined => {
            return chatSettings[chatId] // Простое обращение к объекту по ключу
        },
        [chatSettings],
    )

    // Получение чата с его настройками
    // Объединяет данные чата из items и настройки из chatSettings
    const getChatWithSettings = useCallback(
        (chatId: number) => {
            const chat = items.find((c) => c.id === chatId)
            const settings = chatSettings[chatId]

            if (!chat) return null // Если чат не найден - возвращаем null

            return {
                ...chat, // Все данные чата
                settings: settings || {
                    // Настройки или fallback объект
                    isFavorite: chat.isFavorite || false,
                    isChatRead: chat.newMessageCount === 0,
                    notificationsEnabled:
                        chat.notifications ?? true,
                    isDeleted: false,
                    originalUnreadCount:
                        chat.newMessageCount || 0,
                },
            }
        },
        [items, chatSettings], // Зависимости: функция изменится при изменении items или chatSettings
    )

    // НОВЫЕ ФУНКЦИИ ДЛЯ СОЗДАНИЯ ГРУПП И КАНАЛОВ
    const createGroup = useCallback(
        (groupData: onNextProps, members: Contact[]) => {
            return dispatch(
                createGroupAction({ groupData, members }),
            )
        },
        [dispatch],
    )

    const createChannel = useCallback(
        (channelData: onNextProps, members: Contact[]) => {
            return dispatch(
                createChannelAction({
                    channelData,
                    members,
                }),
            )
        },
        [dispatch],
    )

    // Возвращаемые методы и данные
    // Предоставляет компонентам простой API для работы с чатами
    return {
        chats: items, // Переименовываем для лучшей семантики
        loading,
        error,
        selectedChatId,
        chatSettings,
        loadChats,
        selectChat,
        updateChat: updateChatData,
        updateChatSettings: updateChatSettingsData,
        toggleFavorite: toggleFavoriteChat,
        toggleNotifications: toggleChatNotifications,
        markAsRead: markChatAsRead,
        markAsUnread: markChatAsUnread,
        deleteChat,
        addToContacts: addChatToContacts,
        resetChatSettings: resetAllChatSettings,
        getChatSettings,
        getChatWithSettings,
        // Новые методы
        createGroup,
        createChannel,
    }
}
