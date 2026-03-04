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
    markMessagesRead: (params: {
        chatKey: string
        messageUids: string[]
    }) => void
}

/**
 * Хук пометки сообщений как прочитанных.
 *
 * Решает три задачи:
 * 1. Вычисляет uid первого непрочитанного сообщения (один раз при загрузке),
 *    чтобы UnreadDivider и useScrollToUnread знали позицию прокрутки.
 * 2. Обновляет локальный Redux-стейт чата (markAsRead) — убирает бейдж непрочитанных.
 * 3. Отправляет на сервер last_seen_message (markAsReadOnServer) и change_status_read_message
 *    через WebSocket (markMessagesRead) — синхронизирует статус прочтения.
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
    markMessagesRead,
}: UseMarkAsReadParams) {
    // Набор uid сообщений, для которых уже отправлен WS change_status_read_message,
    // чтобы не дублировать запросы при ре-рендерах
    const readMessageUidsRef = useRef(new Set<string>())

    // Дедупликация серверных вызовов markAsReadOnServer:
    // запоминаем ключ "chatId:lastMessageId" последнего вызова
    const lastSeenRef = useRef<string | null>(null)

    // uid первого непрочитанного — вычисляется один раз при загрузке,
    // чтобы mark-as-read не стёр разделитель и цель скролла.
    // undefined = ещё не вычислено, null = вычислено, непрочитанных нет.
    //
    // Паттерн «adjusting state during render» (React docs):
    // setState вызывается в теле рендера с проверкой предыдущего значения,
    // React отбрасывает текущий JSX и перерендерит с новым состоянием.
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
    // messagesReady = firstUnreadUid вычислен,
    // чтобы useScrollToUnread не сработал до готовности
    const messagesReady = firstUnreadState !== undefined

    // Эффект mark-as-read: обновляет локальный стейт, сервер и WS
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
                // Фиксируем на сервере last_seen_message, чтобы статус сохранялся после перезагрузки
                markAsReadOnServer(
                    chat.id,
                    chat.lastMessage.id,
                )
            }
        }

        // Отправляем WS change_status_read_message для непрочитанных входящих,
        // чтобы собеседник увидел галочки прочтения
        const unreadIncoming = apiMessages
            .filter(
                (message) =>
                    message.uid &&
                    !message.read_at &&
                    message.from_user &&
                    message.from_user !== currentUserId,
            )
            .map((message) => message.uid!)
            .filter(
                (uid) =>
                    !readMessageUidsRef.current.has(uid),
            )

        if (unreadIncoming.length) {
            unreadIncoming.forEach((uid) =>
                readMessageUidsRef.current.add(uid),
            )
            markMessagesRead({
                chatKey: chat.chatKey,
                messageUids: unreadIncoming,
            })
        }
    }, [
        apiMessages,
        chat.chatKey,
        chat.id,
        chat.isTemporary,
        chat.lastMessage?.id,
        currentUserId,
        markAsRead,
        markAsReadOnServer,
        markMessagesRead,
    ])

    return { firstUnreadUid, messagesReady }
}
