import { useCallback } from 'react'
import {
    useAppDispatch,
    useAppSelector,
} from '../../redux/store'
import {
    fetchChats,
    hydrateLocalChats,
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
    createChat as createChatAction,
} from '../../redux/slices/chatsSlice'
import { ChatItem, ChatSettings } from '../types/chat'
import { Contact } from '../types/contact'
import { onNextProps } from '../types/createGroup'

// Кастомный хук для работы с чатами
// Абстрагирует взаимодействие с Redux store, предоставляя простой API для компонентов
export const useChats = () => {
    const dispatch = useAppDispatch()

    // Селекторы для получения данных из состояния чатов
    const {
        items,
        loading,
        error,
        selectedChatId,
        chatSettings,
    } = useAppSelector((state) => state.chats)

    // Загрузка списка чатов

    const loadChats = useCallback(
        (search: string = '', count: number = 20) => {
            dispatch(fetchChats({ search, count }))
        },
        [dispatch],
    )

    // Выбор чата по ID
    const selectChat = useCallback(
        (chatId: number | null) => {
            dispatch(setSelectedChat(chatId))
        },
        [dispatch],
    )

    // Гидрация локально сохранённых чатов
    const hydrateChats = useCallback(
        (
            chats: Array<
                ChatItem & { settings?: ChatSettings }
            >,
        ) => {
            dispatch(hydrateLocalChats(chats))
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

    // Переключение статуса "Избранное"
    const toggleFavoriteChat = useCallback(
        (chatId: number) => {
            dispatch(toggleFavorite(chatId))
        },
        [dispatch],
    )

    // Переключение настроек уведомлений
    const toggleChatNotifications = useCallback(
        (chatId: number) => {
            dispatch(toggleNotifications(chatId))
        },
        [dispatch],
    )

    // Пометка чата как прочитанного
    const markChatAsRead = useCallback(
        (chatId: number) => {
            dispatch(markAsRead(chatId))
        },
        [dispatch],
    )

    // Пометка чата как непрочитанного
    const markChatAsUnread = useCallback(
        (chatId: number) => {
            dispatch(markAsUnread(chatId))
        },
        [dispatch],
    )

    // Мягкое удаление чата (помечаем как удаленный)
    const deleteChat = useCallback(
        (chatId: number) => {
            dispatch(markAsDeleted(chatId))
        },
        [dispatch],
    )

    // Добавление чата в список контактов
    const addChatToContacts = useCallback(
        (chatId: number) => {
            dispatch(addToContacts(chatId))
        },
        [dispatch],
    )

    // Сброс всех настроек чатов
    const resetAllChatSettings = useCallback(() => {
        dispatch(resetChatSettings())
    }, [dispatch])

    // Получение настроек конкретного чата
    const getChatSettings = useCallback(
        (chatId: number): ChatSettings | undefined => {
            // Исправил: добавьте undefined, если не найдено
            return chatSettings[chatId]
        },
        [chatSettings],
    )

    // Получение полной информации о чате с его настройками
    const getChatWithSettings = useCallback(
        (chatId: number) => {
            const chat = items.find((c) => c.id === chatId)
            const settings = chatSettings[chatId]

            if (!chat) return null

            return {
                ...chat,
                settings: settings || {
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
        [items, chatSettings],
    )

    // Создание нового личного чата
    const createChat = useCallback(
        (toUserId: string) => {
            return dispatch(
                createChatAction(toUserId),
            ).unwrap()
        },
        [dispatch],
    )

    // Создание новой группы
    const createGroup = useCallback(
        (groupData: onNextProps, members: Contact[]) => {
            return dispatch(
                createGroupAction({ groupData, members }),
            )
        },
        [dispatch],
    )

    // Создание нового канала
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

    // Возвращаемый объект с методами и данными
    return {
        chats: items,
        loading,
        error,
        selectedChatId,
        chatSettings,
        loadChats,
        hydrateChats,
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
        createChat,
        createGroup,
        createChannel,
    }
}
