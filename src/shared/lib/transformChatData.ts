// Утилиты для трансформации данных чатов между API форматом и UI форматом
import {
    ApiChatItem,
    ChatItem,
    ChatSettings,
} from '../types/chat'

/**
 * Преобразует ChatItem из API формата (snake_case) в UI формат (camelCase)
 * для дальнейшего его использовние в ui
 * Эта функция выполняет трансформацию "один к одному", конвертируя snake_case поля API
 * в camelCase поля UI, что соответствует соглашениям об именовании в JavaScript/TypeScript
 */
export const transformChatItemFromApi = (
    apiChatItem: ApiChatItem,
): ChatItem => ({
    id: apiChatItem.id, // ID остается без изменений (числовой идентификатор)
    chat: {
        uid: apiChatItem.chat.uid, // UUID строковый идентификатор - без изменений
        username: apiChatItem.chat.username,
        nickname: apiChatItem.chat.nickname,
        firstName: apiChatItem.chat.first_name, // snake_case → camelCase: first_name → firstName
        lastName: apiChatItem.chat.last_name, // last_name → lastName
        avatar: apiChatItem.chat.avatar, // Название файла аватарки
        avatarUrl: apiChatItem.chat.avatar_url, // avatar_url → avatarUrl
        avatarWebp: apiChatItem.chat.avatar_webp, // avatar_webp → avatarWebp
        avatarWebpUrl: apiChatItem.chat.avatar_webp_url, // avatar_webp_url → avatarWebpUrl
        isBlocked: apiChatItem.chat.is_blocked, // is_blocked → isBlocked
        isOnline: apiChatItem.chat.is_online, // is_online → isOnline
        wasOnlineAt: apiChatItem.chat.was_online_at, // was_online_at → wasOnlineAt
        isInContacts: apiChatItem.chat.is_in_contacts, // is_in_contacts → isInContacts
    },
    isFavorite: apiChatItem.is_favorite, // is_favorite → isFavorite
    notifications: apiChatItem.notifications, // Без изменений (уже в camelCase)
    newMessageCount: apiChatItem.new_message_count, // new_message_count → newMessageCount
    newFileCount: apiChatItem.new_file_count, // new_file_count → newFileCount
    name: apiChatItem.name, // Без изменений
    chatType: apiChatItem.chat_type, // chat_type → chatType
    chatKey: apiChatItem.chat_key, // chat_key → chatKey
    lastActivityAt: apiChatItem.last_activity_at, // last_activity_at → lastActivityAt
    lastSeenMessage: apiChatItem.last_seen_message, // last_seen_message → lastSeenMessage (объект без изменений внутри)
    firstNewMessage: apiChatItem.first_new_message, // first_new_message → firstNewMessage
    lastMessage: {
        id: apiChatItem.last_message.id,
        uid: apiChatItem.last_message.uid,
        fromUser: apiChatItem.last_message.from_user, // from_user → fromUser
        content: apiChatItem.last_message.content,
        filesSummary:
            apiChatItem.last_message.files_summary, // files_summary → filesSummary
        hasRepliedMessage:
            apiChatItem.last_message.has_replied_message, // has_replied_message → hasRepliedMessage
        hasForwardedMessage:
            apiChatItem.last_message.has_forwarded_message, // has_forwarded_message → hasForwardedMessage
        new: apiChatItem.last_message.new,
        createdAt: apiChatItem.last_message.created_at, // created_at → createdAt
        updatedAt: apiChatItem.last_message.updated_at, // updated_at → updatedAt
    },
})

/**
 * Преобразует массив ChatItem из API формата в UI формат
 * Использует map для трансформации каждого элемента массива
 * Также инициализирует ChatSettings для каждого чата на основе API данных
 */
export const transformChatListFromApi = (
    apiChats: ApiChatItem[],
): ChatItem[] => {
    return apiChats.map((item) => {
        // Инициализация настроек чата на основе API данных
        // ChatSettings хранят UI-специфичное состояние, которое не приходит с API
        const chatSettings: ChatSettings = {
            isFavorite: item.is_favorite || false, // Преобразуем undefined/null в false
            isChatRead: item.new_message_count === 0, // Чат считается прочитанным если нет новых сообщений
            notificationsEnabled:
                item.notifications ?? true, // nullish coalescing: если null/undefined → true
            isDeleted: false, // По умолчанию чат не удален (это UI состояние)
            originalUnreadCount:
                item.new_message_count || 0, // Сохраняем оригинальное количество непрочитанных
        }
        // Трансформация данных из API формата в UI формат
        // Используем функцию transformChatItemFromApi для преобразования структуры
        const chatItemFromApi =
            transformChatItemFromApi(item)
        // Добавление настроек в объект чата
        // Настройки добавляются как дополнительное свойство settings
        chatItemFromApi.settings = chatSettings
        return {
            ...chatItemFromApi, // Возвращаем трансформированный объект с настройками
        }
    })
}

/**
 * Преобразует UI данные обратно в API формат (для отправки данных на сервер)
 * Обратная операция к transformChatItemFromApi - конвертирует camelCase в snake_case
 * Используется перед отправкой данных на сервер, который ожидает snake_case формат
 */
export const transformChatItemToApi = (
    chatItem: ChatItem,
): ApiChatItem => ({
    id: chatItem.id,
    chat: {
        uid: chatItem.chat.uid,
        username: chatItem.chat.username,
        nickname: chatItem.chat.nickname,
        first_name: chatItem.chat.firstName, // camelCase → snake_case: firstName → first_name
        last_name: chatItem.chat.lastName, // lastName → last_name
        avatar: chatItem.chat.avatar,
        avatar_url: chatItem.chat.avatarUrl, // avatarUrl → avatar_url
        avatar_webp: chatItem.chat.avatarWebp, // avatarWebp → avatar_webp
        avatar_webp_url: chatItem.chat.avatarWebpUrl, // avatarWebpUrl → avatar_webp_url
        is_blocked: chatItem.chat.isBlocked, // isBlocked → is_blocked
        is_online: chatItem.chat.isOnline, // isOnline → is_online
        was_online_at: chatItem.chat.wasOnlineAt, // wasOnlineAt → was_online_at
        is_in_contacts: chatItem.chat.isInContacts, // isInContacts → is_in_contacts
    },
    is_favorite: chatItem.isFavorite, // isFavorite → is_favorite
    notifications: chatItem.notifications,
    new_message_count: chatItem.newMessageCount, // newMessageCount → new_message_count
    new_file_count: chatItem.newFileCount, // newFileCount → new_file_count
    name: chatItem.name,
    chat_type: chatItem.chatType, // chatType → chat_type
    chat_key: chatItem.chatKey, // chatKey → chat_key
    last_activity_at: chatItem.lastActivityAt, // lastActivityAt → last_activity_at
    last_seen_message: chatItem.lastSeenMessage, // lastSeenMessage → last_seen_message
    first_new_message: chatItem.firstNewMessage, // firstNewMessage → first_new_message
    last_message: {
        id: chatItem.lastMessage.id,
        uid: chatItem.lastMessage.uid,
        from_user: chatItem.lastMessage.fromUser, // fromUser → from_user
        content: chatItem.lastMessage.content,
        files_summary: chatItem.lastMessage.filesSummary, // filesSummary → files_summary
        has_replied_message:
            chatItem.lastMessage.hasRepliedMessage, // hasRepliedMessage → has_replied_message
        has_forwarded_message:
            chatItem.lastMessage.hasForwardedMessage, // hasForwardedMessage → has_forwarded_message
        new: chatItem.lastMessage.new,
        created_at: chatItem.lastMessage.createdAt, // createdAt → created_at
        updated_at: chatItem.lastMessage.updatedAt, // updatedAt → updated_at
    },
})
