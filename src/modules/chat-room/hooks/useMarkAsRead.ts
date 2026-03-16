import { useEffect, useRef, useState } from 'react'
import { ChatItem } from '@shared/types/chat'
import { Message } from '@shared/types/message'

interface UseMarkAsReadParams {
    chat: ChatItem
    apiMessages: Message[]
    messagesLoading: boolean
    currentUserId: string
    markAsRead: (chatId: number) => void
    markAsReadOnServer: (
        chatId: number,
        lastMessageId: number,
    ) => void
}

/**
 * Хук первичной обработки при открытии чата.
 *
 * Решает три задачи:
 * 1. Вычисляет uid первого непрочитанного сообщения (один раз при загрузке),
 *    чтобы UnreadDivider и useScrollToUnread знали позицию прокрутки.
 * 2. Обновляет локальный Redux-стейт чата (markAsRead) — убирает бейдж непрочитанных.
 * 3. Отправляет на сервер last_seen_message (markAsReadOnServer) — серверный курсор
 *    для восстановления позиции после перезагрузки.
 *
 * WS read receipts (change_status_read_message) НЕ отправляются здесь —
 * они обрабатываются хуком useViewportReadReceipts, который помечает сообщения
 * прочитанными только когда они реально видны в viewport пользователя.
 *
 * Важно: firstUnreadUid вычисляется один раз и фиксируется в state,
 * чтобы mark-as-read не стирал разделитель непрочитанных до того,
 * как пользователь его увидит.
 */
export function useMarkAsRead({
    chat,
    apiMessages,
    messagesLoading,
    currentUserId,
    markAsRead,
    markAsReadOnServer,
}: UseMarkAsReadParams) {
    // Дедупликация серверных вызовов markAsReadOnServer:
    // запоминаем ключ "chatId:lastMessageId" последнего вызова
    const lastSeenRef = useRef<string | null>(null)

    // uid первого непрочитанного — вычисляется один раз при загрузке,
    // чтобы mark-as-read не стёр разделитель и цель скролла.
    // undefined = ещё не вычислено, null = вычислено, непрочитанных нет.
    const [prevChatKey, setPrevChatKey] = useState(
        chat.chatKey,
    )
    const [firstUnreadState, setFirstUnreadState] =
        useState<string | null | undefined>(undefined)

    // Сброс при переключении чата (setState during render)
    if (chat.chatKey !== prevChatKey) {
        setPrevChatKey(chat.chatKey)
        setFirstUnreadState(undefined)
    }

    // Вычисляем один раз после загрузки сообщений (setState during render)
    if (
        firstUnreadState === undefined &&
        !messagesLoading &&
        apiMessages.length > 0
    ) {
        if (
            chat.newMessageCount > 0 &&
            chat.firstNewMessage?.uid
        ) {
            setFirstUnreadState(chat.firstNewMessage.uid)
        } else {
            const firstUnread = apiMessages.find(
                (msg) =>
                    !msg.read_at &&
                    msg.from_user &&
                    msg.from_user !== currentUserId,
            )
            // null = вычислено, непрочитанных нет
            setFirstUnreadState(firstUnread?.uid ?? null)
        }
    }

    const firstUnreadUid = firstUnreadState ?? undefined
    const messagesReady = firstUnreadState !== undefined

    // Эффект: обновляет Redux badge + серверный курсор last_seen_message
    useEffect(() => {
        if (!chat?.id) return
        if (apiMessages.length === 0) return

        // Обновляем локальный state чатов, чтобы в списке не было непрочитанных
        markAsRead(chat.id)

        // Для локальных/временных чатов (id > 10^12) серверного чата ещё нет —
        // пропускаем API-вызов, иначе получим 404
        const isLocalChatById =
            chat.isTemporary || chat.id > 1000000000000
        if (chat.lastMessage?.id && !isLocalChatById) {
            const lastSeenKey = `${chat.id}:${chat.lastMessage.id}`
            if (lastSeenRef.current !== lastSeenKey) {
                lastSeenRef.current = lastSeenKey
                markAsReadOnServer(
                    chat.id,
                    chat.lastMessage.id,
                )
            }
        }
    }, [
        apiMessages,
        chat.id,
        chat.isTemporary,
        chat.lastMessage?.id,
        markAsRead,
        markAsReadOnServer,
    ])

    return { firstUnreadUid, messagesReady }
}
