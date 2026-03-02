import { ChatItem, ChatSettings } from '@shared/types/chat'
import { Message } from '@shared/types/message'
import {
    LOCAL_CHAT_ID_THRESHOLD,
    LOCAL_CHATS_STORAGE_KEY,
} from './constants'

/**
 * Строит объект lastMessage и updatedAt для превью чата.
 * Чистая функция — dispatch(updateChat()) остаётся в вызывающем коде.
 *
 * Возвращает null, если чат не найден.
 */
export function buildLastMessagePreview(
    message: Message,
    chats: ChatItem[],
): {
    chat: ChatItem
    lastMessage: ChatItem['lastMessage']
    updatedAt: string
} | null {
    const chat = chats.find(
        (item) =>
            item.chatKey === message.chatKey ||
            (message.toUserId &&
                (item.chat.uid === message.toUserId ||
                    item.tempContactUid ===
                        message.toUserId)),
    )

    if (!chat) return null

    const timestamp =
        message.created_at ||
        message.updated_at ||
        Math.floor(Date.now() / 1000)

    const lastMessage = {
        ...chat.lastMessage,
        uid: message.uid || chat.lastMessage.uid,
        fromUser:
            message.from_user?.toString() ||
            chat.lastMessage.fromUser,
        content: message.content || '',
        filesSummary: {
            types:
                chat.lastMessage.filesSummary?.types || [],
            count:
                message.files?.length ||
                chat.lastMessage.filesSummary?.count ||
                0,
        },
        hasRepliedMessage:
            (message.repliedMessages?.length ?? 0) > 0,
        hasForwardedMessage:
            (message.forwardedMessages?.length ?? 0) > 0,
        new: true,
        createdAt: timestamp,
        updatedAt: timestamp,
    }

    const updatedAt = new Date(
        timestamp * 1000,
    ).toISOString()

    return { chat, lastMessage, updatedAt }
}

/**
 * Сохраняет снимок локальных чатов в localStorage.
 * localStorage.setItem() выполняется здесь (side-effect).
 */
export function persistLocalChatsSnapshot(
    items: ChatItem[],
    chatSettings: Record<string, ChatSettings>,
): void {
    if (typeof window === 'undefined') return

    try {
        const localChats = items
            .filter(
                (chat) => chat.id > LOCAL_CHAT_ID_THRESHOLD,
            )
            .map((chat) => ({
                ...chat,
                settings: chatSettings[chat.id],
            }))
        window.localStorage.setItem(
            LOCAL_CHATS_STORAGE_KEY,
            JSON.stringify(localChats),
        )
    } catch (error) {
        console.warn(
            'Не удалось сохранить localChats:',
            error,
        )
    }
}
