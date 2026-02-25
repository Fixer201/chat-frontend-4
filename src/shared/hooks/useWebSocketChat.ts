'use client'

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import Cookies from 'js-cookie'

import {
    Message,
    MessageFile,
    normalizeFileItem,
} from '@shared/types/message'
import { ConnectionStatus } from '@shared/types/webSocket'
import { MOCK_MESSAGES } from '@shared/mocks/messages'
import {
    useAppDispatch,
    useAppSelector,
} from '@redux/store'
import {
    updateChat,
    fetchChats,
    addChat,
} from '@redux/slices/chatsSlice'
import { ApiChatItem } from '@shared/types/chat'
import { transformFromApi } from '@shared/lib/transformChatData'

const MAX_RECONNECT_ATTEMPTS = 3

// TODO: Временный флаг для переключения между моковыми и реальными данными
// Удалить после реализации контактов на бэкенде
const USE_MOCK = false

export function useWebSocketChat() {
    const dispatch = useAppDispatch()
    const chats = useAppSelector(
        (state) => state.chats.items,
    )
    // Ссылка на websocket подключение
    const wsRef = useRef<WebSocket | null>(null)
    // ссылка для переподключения, чтобы не плодить кучу подключений
    const reconnectRef = useRef<() => void>(() => {})
    // кол-во попыток переподключения, чтобы не делать это бесконечно
    const reconnectCountRef = useRef<number>(0)

    // Refs для стабильного доступа к актуальным значениям из WS-обработчиков
    const chatsRef = useRef(chats)
    chatsRef.current = chats
    const dispatchRef = useRef(dispatch)
    dispatchRef.current = dispatch

    // UID текущего пользователя из JWT-токена.
    const currentUserIdRef = useRef<string | null>(null)
    if (!currentUserIdRef.current) {
        const t = Cookies.get('access_token')
        if (t) {
            try {
                currentUserIdRef.current =
                    (
                        JSON.parse(
                            atob(t.split('.')[1]),
                        ) as {
                            user_id?: string
                        }
                    ).user_id ?? null
            } catch {
                /* ignore */
            }
        }
    }

    // Статус websocket подключения
    const [status, setStatus] =
        useState<ConnectionStatus>('CLOSED')

    // сообщения для отправки на сервер от клиента
    const [messages, setMessages] = useState<Message[]>([])

    // сообщение об ошибке
    const [error, setError] = useState<string | null>(null)

    const normalizeIncomingMessage = useCallback(
        (payload: unknown): Message | null => {
            if (!payload || typeof payload !== 'object') {
                return null
            }

            const data = payload as Record<string, unknown>
            const messageData =
                (data.message as
                    | Record<string, unknown>
                    | undefined) ??
                (data.object as
                    | Record<string, unknown>
                    | undefined) ??
                data

            const chatKey = messageData.chat_key
            const content = messageData.content

            if (
                typeof chatKey !== 'string' ||
                typeof content !== 'string'
            ) {
                return null
            }

            const normalized: Message = {
                uid: messageData.uid as string | undefined,
                chatKey,
                content,
                status: 'publish',
                from_user:
                    (
                        messageData.from_user as
                            | { uid?: string }
                            | undefined
                    )?.uid ??
                    (messageData.from_user as
                        | string
                        | undefined),
                toUserId:
                    (
                        messageData.to_user as
                            | { uid?: string }
                            | undefined
                    )?.uid ??
                    (messageData.to_user_uid as
                        | string
                        | undefined),
                created_at: messageData.created_at as
                    | number
                    | undefined,
                updated_at: messageData.updated_at as
                    | number
                    | undefined,
                delivered_at: messageData.created_at as
                    | number
                    | undefined,
                read_at:
                    messageData.new === true
                        ? undefined
                        : (messageData.created_at as
                              | number
                              | undefined),
                files: (
                    (messageData.files_list as
                        | Record<string, unknown>[]
                        | undefined) ??
                    (messageData.files as
                        | Record<string, unknown>[]
                        | undefined) ??
                    []
                ).map((f) =>
                    (f as MessageFile).filename
                        ? (f as MessageFile)
                        : normalizeFileItem(
                              f as MessageFile,
                          ),
                ),
                repliedMessages:
                    (messageData.replied_messages as Message['repliedMessages']) ??
                    (messageData.repliedMessages as Message['repliedMessages']) ??
                    [],
                forwardedMessages:
                    (messageData.forwarded_messages as Message['forwardedMessages']) ??
                    (messageData.forwardedMessages as Message['forwardedMessages']) ??
                    [],
            }

            console.debug(
                '[WebSocket] normalized message',
                normalized,
            )

            return normalized
        },
        [],
    )

    // при монтировании компонента открываем ws соединение или загружаем моки
    useEffect(() => {
        if (USE_MOCK) {
            setMessages(MOCK_MESSAGES)
            setStatus('OPEN')
            return
        }

        const token = Cookies.get('access_token')
        if (!token) {
            setError('No auth token found')
            return
        }

        const url = `wss://api.test.chat.ktsf.ru/ws/chat?authorization=${encodeURIComponent(token)}`

        function connect() {
            const socket = new WebSocket(url)

            socket.onopen = () => {
                console.log('WebSocket opened')
                reconnectCountRef.current = 0
                setStatus('OPEN')
            }

            socket.onclose = () => {
                console.log('WebSocket closed')
                setStatus('CLOSED')
            }

            socket.onerror = (ev: Event) => {
                setStatus('ERROR')
                setError(`${ev}`)
                console.log('WebSocket Error: ', ev)

                if (
                    reconnectCountRef.current <
                    MAX_RECONNECT_ATTEMPTS
                ) {
                    reconnectCountRef.current += 1
                    setTimeout(() => {
                        reconnectRef.current()
                    }, 3000)
                }
            }

            socket.onmessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data)

                // Статусные события (онлайн/офлайн пользователей) — пропускаем
                if (data.action === 'new_status_user')
                    return

                if (
                    data.action === 'update_message' &&
                    data.status === 'OK'
                ) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.uid === data.object.uid
                                ? data.object
                                : msg,
                        ),
                    )
                    return
                }

                if (
                    data.action === 'delete_message' &&
                    data.status === 'OK'
                ) {
                    setMessages((prev) =>
                        prev.filter(
                            (msg) =>
                                msg.uid !== data.object.uid,
                        ),
                    )
                    return
                }

                // ========== Обработка создания чата (группы/канала) ==========
                if (data.action === 'create_chat') {
                    if (
                        data.status === 'OK' &&
                        data.object
                    ) {
                        const obj = data.object as {
                            created_by: string
                            owner_full_name: string
                            chat_key: string
                            chat_id: string
                            name: string
                            description?: string
                            chat_type: string
                            avatar?: {
                                filename: string
                                url: string
                            }
                            added_users?: Array<{
                                uid: string
                                full_name: string
                            }>
                        }

                        // Формируем объект, похожий на ApiChatItem, из ответа
                        const apiChatItem: ApiChatItem = {
                            id: parseInt(obj.chat_id),
                            chat: {
                                uid: obj.created_by,
                                username: '',
                                nickname:
                                    obj.owner_full_name ||
                                    '',
                                first_name:
                                    obj.owner_full_name ||
                                    '',
                                last_name: '',
                                avatar:
                                    obj.avatar?.url || '',
                                avatar_url:
                                    obj.avatar?.url || '',
                                avatar_webp: '',
                                avatar_webp_url: '',
                                is_blocked: false,
                                is_online: true,
                                was_online_at: Math.floor(
                                    Date.now() / 1000,
                                ),
                                is_in_contacts: false,
                            },
                            is_active: true,
                            is_favorite: false,
                            notifications: true,
                            index:
                                parseInt(obj.chat_id) ||
                                Date.now(),
                            message_count: 0,
                            file_count: 0,
                            new_file_count: 0,
                            new_message_count: 0,
                            last_message: {
                                id: 0,
                                uid: '',
                                from_user: '',
                                content: '',
                                files_summary: {
                                    types: [],
                                    count: 0,
                                },
                                has_replied_message: false,
                                has_forwarded_message: false,
                                new: false,
                                created_at: Math.floor(
                                    Date.now() / 1000,
                                ),
                                updated_at: Math.floor(
                                    Date.now() / 1000,
                                ),
                            },
                            last_seen_message: {
                                id: 0,
                                uid: '',
                            },
                            first_new_message: {
                                id: 0,
                                uid: '',
                            },
                            name: obj.name,
                            chat_type: obj.chat_type,
                            chat_key: obj.chat_key,
                            description:
                                obj.description || '',
                            created_by: obj.created_by,
                            owner_full_name:
                                obj.owner_full_name,
                            participants: (
                                obj.added_users || []
                            ).map((u) => ({
                                uid: u.uid,
                                full_name: u.full_name,
                            })),
                            created_at:
                                new Date().toISOString(),
                            updated_at:
                                new Date().toISOString(),
                            last_activity_at: Math.floor(
                                Date.now() / 1000,
                            ),
                        }

                        // Добавляем создателя в participants, если его нет
                        if (
                            obj.created_by &&
                            !apiChatItem.participants.some(
                                (p) =>
                                    p.uid ===
                                    obj.created_by,
                            )
                        ) {
                            apiChatItem.participants.push({
                                uid: obj.created_by,
                                full_name:
                                    obj.owner_full_name ||
                                    '',
                            })
                        }

                        // Трансформируем в ChatItem для Redux
                        const transformedChat =
                            transformFromApi<ApiChatItem>(
                                apiChatItem,
                            )
                        dispatchRef.current(
                            addChat(transformedChat),
                        )

                        console.log(
                            '[WebSocket] create_chat success',
                            transformedChat,
                        )
                    } else {
                        setError(
                            data.error ||
                                'Failed to create chat',
                        )
                    }
                    return
                }

                // ========== Обработка обычных сообщений ==========
                const normalized =
                    normalizeIncomingMessage(data)
                if (!normalized) return

                const reqUid = data.request_uid as
                    | string
                    | undefined

                setMessages((prev) => {
                    let filtered = prev
                    let optimistic: Message | undefined
                    if (reqUid) {
                        const sendingUid = `_sending_${reqUid}`
                        optimistic = prev.find(
                            (m) => m.uid === sendingUid,
                        )
                        filtered = prev.filter(
                            (m) => m.uid !== sendingUid,
                        )
                    }

                    if (
                        optimistic?.files?.length &&
                        normalized.files?.length
                    ) {
                        normalized.files =
                            normalized.files.map(
                                (f, i) => ({
                                    ...f,
                                    file_size:
                                        f.file_size ??
                                        optimistic!.files![
                                            i
                                        ]?.file_size,
                                }),
                            )
                    }

                    if (
                        normalized.uid &&
                        filtered.some(
                            (m) => m.uid === normalized.uid,
                        )
                    ) {
                        return filtered
                    }
                    return [...filtered, normalized]
                })

                // Синхронизация списка чатов в Redux при получении нового сообщения.
                if (normalized.chatKey) {
                    const currentChats = chatsRef.current

                    const tempChat = currentChats.find(
                        (chat) =>
                            chat.isTemporary &&
                            (chat.tempContactUid ===
                                normalized.toUserId ||
                                chat.tempContactUid ===
                                    normalized.from_user),
                    )

                    if (
                        tempChat &&
                        tempChat.chatKey !==
                            normalized.chatKey
                    ) {
                        dispatchRef.current(
                            updateChat({
                                ...tempChat,
                                isTemporary: false,
                                tempContactUid: undefined,
                                chatKey: normalized.chatKey,
                            }),
                        )
                        dispatchRef.current(fetchChats({}))
                    } else if (
                        !currentChats.some(
                            (chat) =>
                                chat.chatKey ===
                                normalized.chatKey,
                        )
                    ) {
                        dispatchRef.current(fetchChats({}))
                    }
                }
            }

            wsRef.current = socket
        }

        reconnectRef.current = connect
        connect()

        return () => {
            wsRef.current?.close()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Функция отправки сообщения
    const sendMessage = useCallback(
        ({
            chatKey,
            toUserId,
            content,
            status,
            files,
            repliedMessages,
            forwardedMessages,
        }: Message) => {
            const requestUid = crypto.randomUUID()

            const messageObj = {
                action: 'create_text_message',
                request_uid: requestUid,
                object: {
                    ...(() => {
                        const realChat =
                            chatsRef.current.find(
                                (c) =>
                                    c.chatKey === chatKey &&
                                    !c.isTemporary,
                            )
                        if (realChat)
                            return { chat_key: chatKey }
                        if (toUserId)
                            return {
                                to_user_uid: toUserId,
                            }
                        const tempChat =
                            chatsRef.current.find(
                                (c) =>
                                    c.chatKey === chatKey,
                            )
                        if (tempChat)
                            return {
                                to_user_uid:
                                    tempChat.tempContactUid ||
                                    tempChat.chat.uid,
                            }
                        return {}
                    })(),
                    content: content,
                    status: status,
                    files: files,
                    replied_messages: repliedMessages
                        ?.map((m) => m.uid)
                        .filter(Boolean),
                    forwarded_messages: forwardedMessages
                        ?.map((m) => m.uid)
                        .filter(Boolean),
                },
            }

            console.log('Отправили на сервер: ', messageObj)

            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current?.send(
                    JSON.stringify(messageObj),
                )
            }

            if (files && files.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    {
                        uid: `_sending_${requestUid}`,
                        chatKey,
                        content,
                        status: 'sending',
                        from_user:
                            currentUserIdRef.current ??
                            undefined,
                        toUserId,
                        created_at: Math.floor(
                            Date.now() / 1000,
                        ),
                        files: files.map((f) => ({
                            ...f,
                            file_size:
                                f.file_size ??
                                (f.data &&
                                !f.data.startsWith(
                                    'http',
                                ) &&
                                !f.data.startsWith('data:')
                                    ? Math.round(
                                          f.data.length *
                                              0.75,
                                      )
                                    : undefined),
                        })),
                    },
                ])
            }
        },
        [],
    )

    // Функция редактирования сообщения
    const updateMessage = useCallback(
        ({
            uid,
            chatKey,
            content,
            status,
            files,
        }: {
            uid: string
            chatKey: string
            content: string
            status: string
            files?: MessageFile[]
        }) => {
            const messageObj = {
                action: 'update_message',
                request_uid: crypto.randomUUID(),
                object: {
                    chat_key: chatKey,
                    uid: uid,
                    content: content,
                    status: status,
                    files: files,
                },
            }

            console.log(
                'Обновление сообщения на сервере: ',
                messageObj,
            )

            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current?.send(
                    JSON.stringify(messageObj),
                )
            }
        },
        [],
    )

    // Отмена отправки файла
    const cancelSending = useCallback(
        (requestUid: string) => {
            setMessages((prev) =>
                prev.filter(
                    (m) =>
                        m.uid !== `_sending_${requestUid}`,
                ),
            )
        },
        [],
    )

    // Функция удаления сообщения
    const deleteMessage = useCallback(
        ({
            uid,
            chatKey,
            forAll,
        }: {
            uid: string
            chatKey: string
            forAll: boolean
        }) => {
            const messageObj = {
                action: 'delete_message',
                request_uid: crypto.randomUUID(),
                object: {
                    uid: uid,
                    for_all: forAll,
                    chat_key: chatKey,
                },
            }

            console.log(
                'Удаление сообщения на сервере: ',
                messageObj,
            )

            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current?.send(
                    JSON.stringify(messageObj),
                )
            }
        },
        [],
    )

    // ========== Функция создания чата (группы/канала) ==========
    const createChat = useCallback(
        ({
            name,
            description,
            avatar,
            chatType,
            uidUsersList,
        }: {
            name: string
            description?: string
            avatar?: {
                filename: string
                data: string
            } | null
            chatType:
                | 'public-group'
                | 'private-group'
                | 'public-channel'
                | 'private-channel'
            uidUsersList: string[]
        }) => {
            const requestUid = crypto.randomUUID()
            const messageObj = {
                action: 'create_chat',
                request_uid: requestUid,
                object: {
                    name,
                    description: description || '',
                    chat_type: chatType,
                    uid_users_list: uidUsersList,
                    ...(avatar && { avatar }),
                },
            }

            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current.send(
                    JSON.stringify(messageObj),
                )
                console.log(
                    '[WebSocket] createChat sent',
                    messageObj,
                )
            } else {
                setError('WebSocket is not connected')
            }
        },
        [],
    )

    return useMemo(
        () => ({
            sendMessage,
            updateMessage,
            deleteMessage,
            cancelSending,
            createChat,
            messages,
            status,
            error,
        }),
        [
            sendMessage,
            updateMessage,
            deleteMessage,
            cancelSending,
            createChat,
            messages,
            status,
            error,
        ],
    )
}
