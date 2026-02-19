// @shared/hooks/useMessages.ts
// import { useState, useEffect, useCallback } from 'react'
// import { Message , ApiMessage} from '@shared/types/message'
// import { useApiFetcher } from '@shared/hooks/useApiFetcher'

// export const useMessages = (userUid: string) => {
//     const [messages, setMessages] = useState<Message[]>([])
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)
//     const fetchData = useApiFetcher()

//     const loadMessages = useCallback(async () => {
//         if (!userUid) return

//         setLoading(true)
//         setError(null)
//         try {
//             const data = await fetchData(
//                 `https://api.test.chat.ktsf.ru/api/v1/chat/message/text/${userUid}/`,
//                 { method: 'GET' }
//             )
//             // Маппинг API-ответа в Message[] (адаптируйте под вашу структуру Message)
//             const mappedMessages: Message[] = data.results.map((item: ApiMessage) => ({
//                 uid: item.uid,
//                 content: item.content,
//                 from_user: item.from_user.uid, // Или item.from_user, в зависимости от API
//                 chatKey: item.chat_key,
//                 created_at: item.created_at,
//                 updated_at: item.updated_at,
//                 read_at: item.new ? null : item.created_at, // Пример для статуса
//                 delivered_at: item.created_at,
//                 // Добавьте другие поля из вашего типа Message
//             }))
//             setMessages(mappedMessages)
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Ошибка загрузки сообщений')
//         } finally {
//             setLoading(false)
//         }
//     }, [userUid, fetchData])

//     useEffect(() => {
//         loadMessages()
//     }, [loadMessages])

//     return { messages, loading, error, reloadMessages: loadMessages }

import { useState, useEffect, useCallback } from 'react'
import {
    Message,
    ApiMessage,
    RepliedMessage,
    ForwardedMessage,
    normalizeFileItem,
} from '@shared/types/message'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'

export const useMessages = (
    userUid: string,
    isLocalChat: boolean = false,
) => {
    // Добавьте isLocalChat
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fetchData = useApiFetcher()

    const loadMessages = useCallback(async () => {
        if (!userUid || isLocalChat) {
            // Если локальный чат, не загружать сообщения
            setMessages([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await fetchData(
                `https://api.test.chat.ktsf.ru/api/v1/chat/message/text/${userUid}/`,
                { method: 'GET' },
            )
            // Маппинг API-ответа в Message[] с использованием ApiMessage и ваших типов
            const mappedMessages: Message[] =
                data.results.map(
                    (item: ApiMessage): Message => ({
                        uid: item.uid,
                        chatKey: item.chat_key,
                        content: item.content,
                        from_user: item.from_user.uid,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        delivered_at: item.created_at,
                        read_at: item.new
                            ? undefined
                            : item.created_at, // Исправьте на undefined
                        // Сервер возвращает файлы в формате ApiFileItem
                        // (file_url, file_type), маппим в MessageFile (filename, file_url)
                        files: item.files_list?.map(
                            normalizeFileItem,
                        ),
                        repliedMessages:
                            item.replied_messages.map(
                                (r): RepliedMessage => ({
                                    uid: r.uid,
                                    content: r.content,
                                    from_user: r.from_user,
                                    first_name:
                                        r.first_name,
                                    last_name: r.last_name,
                                    files_list:
                                        r.files_list?.map(
                                            normalizeFileItem,
                                        ),
                                }),
                            ),
                        forwardedMessages:
                            item.forwarded_messages.map(
                                (f): ForwardedMessage => ({
                                    uid: f.uid,
                                    content: f.content,
                                    from_user: f.from_user,
                                    first_name:
                                        f.first_name,
                                    last_name: f.last_name,
                                    avatar_url:
                                        f.avatar_webp_url,
                                    avatar_webp_url:
                                        f.avatar_webp_url,
                                    files_list:
                                        f.files_list?.map(
                                            normalizeFileItem,
                                        ),
                                }),
                            ),
                        // UID получателя — нужен для фильтрации сообщений
                        // во временных чатах, где chatKey ещё не назначен сервером.
                        // MessagesList использует toUserId для сопоставления
                        // исходящих сообщений с контактом (msg.toUserId === contactUid).
                        toUserId: item.to_user?.uid,
                        status: 'publish', // Или другое значение по умолчанию
                    }),
                )
            setMessages(mappedMessages)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка загрузки сообщений',
            )
        } finally {
            setLoading(false)
        }
    }, [userUid, isLocalChat, fetchData]) // Добавьте isLocalChat в зависимости

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    return {
        messages,
        loading,
        error,
        reloadMessages: loadMessages,
    }
}
