import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react'
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
    pageSize: number = 50,
) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fetchData = useApiFetcher()

    // Предыдущее значение isLocalChat — при переходе local→API
    // пропускаем спиннер, т.к. WS-сообщения уже видны.
    const prevIsLocalRef = useRef(isLocalChat)

    const loadMessages = useCallback(async () => {
        if (!userUid || isLocalChat) {
            setMessages([])
            setLoading(false)
            prevIsLocalRef.current = isLocalChat
            return
        }

        const isTransitionFromLocal =
            prevIsLocalRef.current === true
        prevIsLocalRef.current = isLocalChat

        if (!isTransitionFromLocal) {
            setLoading(true)
        }
        setError(null)
        try {
            // page_size увеличен, чтобы не получать только 5 сообщений по умолчанию (лимит Django).
            const url = `/api/v1/chat/message/text/${userUid}/?page_size=${pageSize}`
            const data = await fetchData(url, {
                method: 'GET',
            })
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
                            : item.created_at,
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
                        toUserId: item.to_user?.uid,
                        status: 'publish',
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
    }, [userUid, isLocalChat, pageSize, fetchData])

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    return { messages, loading, error }
}
