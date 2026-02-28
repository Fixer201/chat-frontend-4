'use client'

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import Cookies from 'js-cookie'

import { ChatItem } from '@shared/types/chat'
import {
    Message,
    MessageFile,
    normalizeFileItem,
    RepliedMessage,
    ForwardedMessage,
} from '@shared/types/message'
import { ConnectionStatus } from '@shared/types/webSocket'
import {
    MOCK_MESSAGES,
    MOCK_CURRENT_USER_ID,
} from '@shared/mocks/messages'
import {
    useAppDispatch,
    useAppSelector,
} from '@redux/store'
import {
    updateChat,
    updateContactStatus,
} from '@redux/slices/chatsSlice'
import { fetchChats } from '@redux/extraReducers/chat-extraReducers/fetchChatsExtraRed'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import { WS_URL } from '@shared/config/env'

const MAX_RECONNECT_ATTEMPTS = 3
const LOCAL_CHATS_STORAGE_KEY = 'localChats'
const LOCAL_CHAT_ID_THRESHOLD = 1000000000000
// Интервал повторного запроса статусов (30 сек)
const STATUS_POLL_INTERVAL_MS = 30_000

// TODO: Временный флаг для переключения между моковыми и реальными данными
// Удалить после реализации контактов на бэкенде
const USE_MOCK = false

export function useWebSocketChat() {
    const dispatch = useAppDispatch()
    const chats = useAppSelector(
        (state) => state.chats.items,
    )
    const chatSettings = useAppSelector(
        (state) => state.chats.chatSettings,
    )
    const chatsRef = useRef(chats)
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null
    const currentUserId =
        currentUser?.id ||
        getUserIdFromToken(
            localStorage.getItem('access_token') ||
                Cookies.get('access_token'),
        ) ||
        MOCK_CURRENT_USER_ID
    // Ссылка на websocket подключение
    const wsRef = useRef<WebSocket | null>(null)
    // ссылка для переподключения, чтобы не плодить кучу подключений
    const reconnectRef = useRef<() => void>(() => {})
    // кол-во попыток переподключения, чтобы не делать это бесконечно
    const reconnectCountRef = useRef<number>(0)

    // Статус websocket подключения
    const [status, setStatus] =
        useState<ConnectionStatus>('CLOSED')

    // сообщения для отправки на сервер от клиента
    const [messages, setMessages] = useState<Message[]>([])

    // Соответствие request_uid -> временный uid сообщения
    const pendingMessageMapRef = useRef(
        new Map<string, string>(),
    )

    const ackSeenRef = useRef(new Set<string>())
    const normalizeSeenRef = useRef(new Set<string>())
    const storedSeenRef = useRef(new Set<string>())

    const lastChatsRefreshRef = useRef(0)
    // Реф для периодического опроса статусов
    const statusIntervalRef = useRef<ReturnType<
        typeof setInterval
    > | null>(null)

    // Обновляем lastMessage чата при отправке/получении сообщений для корректного превью списка
    const updateChatPreview = useCallback(
        (message: Message) => {
            const chat = chatsRef.current.find(
                (item) =>
                    item.chatKey === message.chatKey ||
                    (message.toUserId &&
                        (item.chat.uid ===
                            message.toUserId ||
                            item.tempContactUid ===
                                message.toUserId)),
            )

            if (!chat) return

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
                        chat.lastMessage.filesSummary
                            ?.types || [],
                    count:
                        message.files?.length ||
                        chat.lastMessage.filesSummary
                            ?.count ||
                        0,
                },
                hasRepliedMessage:
                    (message.repliedMessages?.length ?? 0) >
                    0,
                hasForwardedMessage:
                    (message.forwardedMessages?.length ??
                        0) > 0,
                new: true,
                createdAt: timestamp,
                updatedAt: timestamp,
            }

            dispatch(
                updateChat({
                    ...chat,
                    lastMessage,
                    updatedAt: new Date(
                        timestamp * 1000,
                    ).toISOString(),
                }),
            )
        },
        [dispatch],
    )

    const persistLocalChatsSnapshot = useCallback(
        (items: ChatItem[]) => {
            if (typeof window === 'undefined') return

            try {
                const localChats = items
                    .filter(
                        (chat) =>
                            chat.id >
                            LOCAL_CHAT_ID_THRESHOLD,
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
        },
        [chatSettings],
    )

    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    // сообщение об ошибке
    const [error, setError] = useState<string | null>(null)

    // Отправка запроса статусов всех собеседников через WebSocket
    const requestStatusList = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN)
            return
        wsRef.current.send(
            JSON.stringify({
                action: 'get_status_list_chat',
                request_uid: crypto.randomUUID(),
            }),
        )
    }, [])

    function onOpen() {
        console.info('[WebSocket] opened')
        reconnectCountRef.current = 0
        setStatus('OPEN')

        // Запрашиваем актуальные статусы сразу после подключения
        // Используем небольшую задержку, чтобы wsRef.current был гарантированно установлен
        setTimeout(() => {
            requestStatusList()
        }, 100)

        // Периодический опрос статусов
        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current)
        }
        statusIntervalRef.current = setInterval(
            requestStatusList,
            STATUS_POLL_INTERVAL_MS,
        )
    }

    function onClose() {
        console.info('[WebSocket] closed')
        setStatus('CLOSED')
        // Очищаем интервал опроса при закрытии соединения
        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current)
            statusIntervalRef.current = null
        }
    }

    const onError = useCallback((e: Event) => {
        setStatus('ERROR')
        setError(`${e}`)
        console.log('WebSocket Error: ', e)

        // Пытаемся переподключиться через 3 секунды
        if (
            reconnectCountRef.current <
            MAX_RECONNECT_ATTEMPTS
        ) {
            // чтобы бесконечно не переподключаться ограничим кол-во попыток константой
            reconnectCountRef.current += 1

            setTimeout(() => {
                // переподключаемся в случае ошибки
                reconnectRef.current()
            }, 3000)
        }
    }, [])

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
                files:
                    (
                        messageData.files_list as
                            | Record<string, unknown>[]
                            | undefined
                    )?.map((f) =>
                        normalizeFileItem(
                            f as Parameters<
                                typeof normalizeFileItem
                            >[0],
                        ),
                    ) ??
                    (messageData.files as
                        | MessageFile[]
                        | undefined) ??
                    [],
                repliedMessages: (
                    (messageData.replied_messages as Record<
                        string,
                        unknown
                    >[]) ??
                    (messageData.repliedMessages as Record<
                        string,
                        unknown
                    >[]) ??
                    []
                ).map(
                    (
                        r: Record<string, unknown>,
                    ): RepliedMessage => ({
                        uid: r.uid as string | undefined,
                        content:
                            (r.content as string) || '',
                        from_user: r.from_user as
                            | string
                            | undefined,
                        first_name: r.first_name as
                            | string
                            | undefined,
                        last_name: r.last_name as
                            | string
                            | undefined,
                        files_list: (
                            r.files_list as
                                | Record<string, unknown>[]
                                | undefined
                        )?.map((f) =>
                            normalizeFileItem(
                                f as Parameters<
                                    typeof normalizeFileItem
                                >[0],
                            ),
                        ),
                    }),
                ),
                forwardedMessages: (
                    (messageData.forwarded_messages as Record<
                        string,
                        unknown
                    >[]) ??
                    (messageData.forwardedMessages as Record<
                        string,
                        unknown
                    >[]) ??
                    []
                ).map(
                    (
                        f: Record<string, unknown>,
                    ): ForwardedMessage => ({
                        uid: f.uid as string | undefined,
                        content:
                            (f.content as string) || '',
                        from_user: f.from_user as
                            | string
                            | undefined,
                        first_name: f.first_name as
                            | string
                            | undefined,
                        last_name: f.last_name as
                            | string
                            | undefined,
                        avatar_url: f.avatar_url as
                            | string
                            | undefined,
                        avatar_webp_url:
                            f.avatar_webp_url as
                                | string
                                | undefined,
                        files_list: (
                            f.files_list as
                                | Record<string, unknown>[]
                                | undefined
                        )?.map((fi) =>
                            normalizeFileItem(
                                fi as Parameters<
                                    typeof normalizeFileItem
                                >[0],
                            ),
                        ),
                    }),
                ),
            }

            return normalized
        },
        [],
    )

    const onMessage = useCallback(
        (event: MessageEvent) => {
            // получаем ответ сервера и парсим его
            const data = JSON.parse(event.data)

            // Обработка ответа со статусами онлайн
            if (
                data.action === 'get_status_list_chat' &&
                data.status === 'OK'
            ) {
                const entries = Array.isArray(data.object)
                    ? data.object
                    : [data.object]

                entries.forEach(
                    (entry: {
                        is_online?: boolean
                        was_online_at?: number
                        user?: { uid?: string } | string
                    }) => {
                        if (!entry) return
                        const userUid =
                            typeof entry.user === 'string'
                                ? entry.user
                                : entry.user?.uid
                        if (!userUid) return

                        dispatch(
                            updateContactStatus({
                                userUid,
                                isOnline:
                                    entry.is_online ??
                                    false,
                                wasOnlineAt:
                                    entry.was_online_at ??
                                    0,
                            }),
                        )
                    },
                )
                return
            }

            if (
                data.action === 'update_message' &&
                data.status === 'OK'
            ) {
                // Сервер возвращает сырой объект сообщения — сохраняем существующие
                // клиентские поля (chatKey, from_user) и ставим isEdited,
                // чтобы UI показал «(изменено)» только для реально отредактированных.
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.uid === data.object.uid
                            ? {
                                  ...msg,
                                  content:
                                      data.object.content ??
                                      msg.content,
                                  updated_at:
                                      data.object
                                          .updated_at ??
                                      msg.updated_at,
                                  isEdited: true,
                              }
                            : msg,
                    ),
                )
                return
            }

            if (
                data.action === 'create_text_message' &&
                data.status === 'OK'
            ) {
                const messageData =
                    (data.message as
                        | Record<string, unknown>
                        | undefined) ??
                    (data.object as
                        | Record<string, unknown>
                        | undefined)
                const ackKey =
                    (data.request_uid as
                        | string
                        | undefined) ??
                    (messageData?.uid as string | undefined)
                if (
                    ackKey &&
                    ackSeenRef.current.has(ackKey)
                ) {
                    return
                }
                if (ackKey) {
                    ackSeenRef.current.add(ackKey)
                }
                console.info('[WebSocket] message ack', {
                    chatKey: messageData?.chat_key,
                    hasContent:
                        typeof messageData?.content ===
                        'string',
                    objectKeys: messageData
                        ? Object.keys(messageData)
                        : [],
                })
            }

            if (
                data.action === 'create_text_message' &&
                data.status &&
                data.status !== 'OK'
            ) {
                console.error(
                    '[WebSocket] message send failed',
                    {
                        status: data.status,
                        error: data.error,
                        object: data.object,
                    },
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

            if (
                data.action ===
                    'change_status_read_message' &&
                data.status === 'OK'
            ) {
                // Сервер подтвердил прочтение — обновляем read_at для галочек
                const messageUid =
                    data.object?.uid ||
                    data.object?.message_uid
                const readAt =
                    data.object?.updated_at ||
                    data.object?.created_at ||
                    Math.floor(Date.now() / 1000)

                if (messageUid) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.uid === messageUid
                                ? {
                                      ...msg,
                                      read_at: readAt,
                                      delivered_at:
                                          msg.delivered_at ||
                                          readAt,
                                  }
                                : msg,
                        ),
                    )
                }

                return
            }

            const normalized =
                normalizeIncomingMessage(data)
            if (!normalized) {
                if (data.action === 'create_text_message') {
                    console.warn(
                        '[WebSocket] malformed message response',
                        {
                            action: data.action,
                            status: data.status,
                            object: data.object,
                        },
                    )
                }
                return
            }

            if (normalized.uid) {
                if (
                    !normalizeSeenRef.current.has(
                        normalized.uid,
                    )
                ) {
                    normalizeSeenRef.current.add(
                        normalized.uid,
                    )
                    console.info('[WebSocket] normalized', {
                        uid: normalized.uid,
                        chatKey: normalized.chatKey,
                    })
                }
            }

            const requestUid = data.request_uid as
                | string
                | undefined
            const pendingUid = requestUid
                ? pendingMessageMapRef.current.get(
                      requestUid,
                  )
                : undefined

            if (pendingUid && requestUid) {
                pendingMessageMapRef.current.delete(
                    requestUid,
                )
            }

            setMessages((prev) => {
                if (
                    normalized.uid &&
                    prev.some(
                        (msg) => msg.uid === normalized.uid,
                    )
                ) {
                    if (normalized.uid) {
                        const skipKey = `skip:${normalized.uid}`
                        if (
                            !ackSeenRef.current.has(skipKey)
                        ) {
                            ackSeenRef.current.add(skipKey)
                            console.info(
                                '[WebSocket] message already stored',
                                {
                                    uid: normalized.uid,
                                    chatKey:
                                        normalized.chatKey,
                                },
                            )
                        }
                    }
                    return prev
                }
                const withoutPending = pendingUid
                    ? prev.filter(
                          (msg) => msg.uid !== pendingUid,
                      )
                    : prev
                if (normalized.uid) {
                    if (
                        !storedSeenRef.current.has(
                            normalized.uid,
                        )
                    ) {
                        storedSeenRef.current.add(
                            normalized.uid,
                        )
                        console.info(
                            '[WebSocket] message stored',
                            {
                                chatKey: normalized.chatKey,
                                toUserId:
                                    normalized.toUserId,
                                uid: normalized.uid,
                            },
                        )
                    }
                }
                return [...withoutPending, normalized]
            })

            updateChatPreview(normalized)

            if (normalized.toUserId && normalized.chatKey) {
                const tempChat = chatsRef.current.find(
                    (chat) =>
                        chat.isTemporary &&
                        chat.tempContactUid ===
                            normalized.toUserId,
                )

                if (
                    tempChat &&
                    tempChat.chatKey !== normalized.chatKey
                ) {
                    // Временный чат получил настоящий chatKey — обновляем и сохраняем локально
                    const updatedTempChat: ChatItem = {
                        ...tempChat,
                        isTemporary: false,
                        tempContactUid: undefined,
                        chatKey: normalized.chatKey,
                    }
                    console.info(
                        '[WebSocket] update temp chat',
                        {
                            tempChatId: tempChat.id,
                            fromChatKey: tempChat.chatKey,
                            toChatKey: normalized.chatKey,
                            toUserId: normalized.toUserId,
                        },
                    )
                    dispatch(updateChat(updatedTempChat))
                    persistLocalChatsSnapshot(
                        chatsRef.current.map((chat) =>
                            chat.id === updatedTempChat.id
                                ? updatedTempChat
                                : chat,
                        ),
                    )

                    const now = Date.now()
                    const isChatsPage =
                        typeof window !== 'undefined' &&
                        window.location.pathname.startsWith(
                            '/chats',
                        )

                    if (
                        isChatsPage &&
                        now - lastChatsRefreshRef.current >
                            3000
                    ) {
                        lastChatsRefreshRef.current = now
                        dispatch(fetchChats({ count: 15 }))
                    }
                }
            }
        },
        [
            dispatch,
            normalizeIncomingMessage,
            persistLocalChatsSnapshot,
            updateChatPreview,
        ],
    )

    // Вспомогательная функция для получения токена из cookies
    const getAccessToken = useCallback(() => {
        return Cookies.get('access_token') || null
    }, [])

    // Функция подключения
    const connectWebSocket = useCallback(() => {
        if (
            wsRef.current?.readyState === WebSocket.OPEN ||
            wsRef.current?.readyState ===
                WebSocket.CONNECTING
        ) {
            return
        }
        // 1. Получить токен из localstorage из поля (access_token)
        const token = getAccessToken()

        if (!token) {
            console.warn('[WebSocket] no auth token found')
            setError('No auth token found')
            return
        }

        // Построить URL:
        const url = `${WS_URL}/ws/chat?authorization=${encodeURIComponent(token)}`

        // Создать новое webSocket подключение с этим url
        const socket = new WebSocket(url)

        console.info('[WebSocket] connecting', { url })

        // Обработка событий
        socket.onopen = () => {
            console.log('WebSocket opened')
            onOpen()
        }

        socket.onclose = () => {
            console.log('WebSocket closed')
            onClose()
        }
        socket.onerror = (ev: Event) => {
            onError(ev)
        }
        socket.onmessage = (data: MessageEvent) => {
            onMessage(data)
        }

        wsRef.current = socket
    }, [getAccessToken, onError, onMessage])

    // при монтировании компонента открываем ws соединение или загружаем моки
    useLayoutEffect(() => {
        // Если используем моковые данные
        if (USE_MOCK) {
            console.log('🎭 Используются моковые данные')
            queueMicrotask(() => {
                setMessages(MOCK_MESSAGES)
                setStatus('OPEN') // Имитируем успешное подключение
            })
            return
        }

        // Реальное WebSocket подключение
        reconnectRef.current = () => connectWebSocket()

        const token = getAccessToken()
        if (token) {
            queueMicrotask(() => {
                connectWebSocket()
            })
        } else {
            console.warn(
                '[WebSocket] token missing on mount',
            )
        }

        return () => {
            if (statusIntervalRef.current) {
                clearInterval(statusIntervalRef.current)
                statusIntervalRef.current = null
            }
            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current?.close()
            }
        }
    }, [connectWebSocket, getAccessToken])

    // Функция отправки сообщения
    const sendMessage = useCallback(
        ({
            toUserId,
            content,
            status,
            files,
            repliedMessages,
            forwardedMessages,
            chatKey,
        }: Message) => {
            const requestUid = crypto.randomUUID()
            const createdAt = Math.floor(Date.now() / 1000)
            const tempUid = `local-${requestUid}`

            if (content || (files && files.length > 0)) {
                // Оптимистично добавляем сообщение и превью чата
                const optimisticMessage: Message = {
                    uid: tempUid,
                    chatKey,
                    content,
                    status: status || 'publish',
                    toUserId,
                    from_user: currentUserId,
                    created_at: createdAt,
                    updated_at: createdAt,
                    delivered_at: createdAt,
                    files: files || [],
                    repliedMessages,
                    forwardedMessages,
                }
                pendingMessageMapRef.current.set(
                    requestUid,
                    tempUid,
                )

                setMessages((prev) => [
                    ...prev,
                    optimisticMessage,
                ])
                updateChatPreview(optimisticMessage)
            }
            // создаём объект для отправки на backend
            const isTemporaryChatKey =
                typeof chatKey === 'string' &&
                chatKey.startsWith('chat_key_')
            const isDirectChat =
                typeof chatKey === 'string' &&
                chatKey.startsWith('chat_')
            // Сервер ожидает массив UID-строк в replied/forwarded_messages,
            // объекты вызывают ошибку «Невалидный UID»
            const cleanReplied = (repliedMessages ?? [])
                .map((r) => r.uid)
                .filter(Boolean)
            const cleanForwarded = (forwardedMessages ?? [])
                .map((f) => f.uid)
                .filter(Boolean)
            const messageObject: Record<string, unknown> = {
                content: content,
                status: status || 'publish',
                files: files ?? [],
                replied_messages: cleanReplied,
                forwarded_messages: cleanForwarded,
            }

            if (isTemporaryChatKey || isDirectChat) {
                messageObject.to_user_uid = toUserId
            } else {
                messageObject.chat_key = chatKey
            }

            const messageObj = {
                // тип действия -> отправка сообщения
                action: 'create_text_message',
                // генерируем уникальный идентификатор
                request_uid: requestUid,
                // отправляем данные
                object: messageObject,
            }

            console.info('[WebSocket] send message', {
                requestUid,
                chatKey,
                toUserId,
                contentLength: content?.length ?? 0,
                hasFiles: (files?.length ?? 0) > 0,
                hasReplies:
                    (repliedMessages?.length ?? 0) > 0,
                hasForwards:
                    (forwardedMessages?.length ?? 0) > 0,
                readyState: wsRef.current?.readyState,
            })

            // Отправляем только есть соединение
            if (
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                wsRef.current?.send(
                    JSON.stringify(messageObj),
                )
            } else {
                console.warn('[WebSocket] send skipped', {
                    reason: 'socket not open',
                    readyState: wsRef.current?.readyState,
                })
            }
        },
        [currentUserId, updateChatPreview],
    )

    const markMessagesRead = useCallback(
        ({
            chatKey,
            messageUids,
        }: {
            chatKey: string
            messageUids: string[]
        }) => {
            if (
                !messageUids.length ||
                wsRef.current?.readyState !== WebSocket.OPEN
            ) {
                return
            }

            messageUids.forEach((uid) => {
                const messageObj = {
                    action: 'change_status_read_message',
                    request_uid: crypto.randomUUID(),
                    object: {
                        uid,
                        reader_uid: currentUserId,
                        new_read_status: true,
                        chat_key: chatKey,
                    },
                }

                wsRef.current?.send(
                    JSON.stringify(messageObj),
                )
            })
        },
        [currentUserId],
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

    return useMemo(
        () => ({
            sendMessage,
            updateMessage,
            deleteMessage,
            markMessagesRead,
            messages,
            status,
            error,
        }),
        [
            sendMessage,
            updateMessage,
            deleteMessage,
            markMessagesRead,
            messages,
            status,
            error,
        ],
    )
}
