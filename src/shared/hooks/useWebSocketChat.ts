'use client'

import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { Message, MessageFile } from '@shared/types/message'
import { ConnectionStatus } from '@shared/types/webSocket'
import { MOCK_MESSAGES } from '@shared/mocks/messages'
import {
    useAppDispatch,
    useAppSelector,
} from '@redux/store'
import { updateChat } from '@redux/slices/chatsSlice'

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

    // Статус websocket подключения
    const [status, setStatus] =
        useState<ConnectionStatus>('CLOSED')

    // сообщения для отправки на сервер от клиента
    const [messages, setMessages] = useState<Message[]>([])

    // сообщение об ошибке
    const [error, setError] = useState<string | null>(null)

    function onOpen() {
        console.log('WebSocket opened')
        // в случае успешного подключения нужно сбросить счётчик кол-ва реконектов
        reconnectCountRef.current = 0
        setStatus('OPEN')
    }

    function onClose() {
        console.log('WebSocket closed')
        setStatus('CLOSED')
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
                console.debug('[WebSocket] skip payload', {
                    payload,
                })
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
                    (messageData.files_list as
                        | MessageFile[]
                        | undefined) ??
                    (messageData.files as
                        | MessageFile[]
                        | undefined) ??
                    [],
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

    const onMessage = useCallback(
        (event: MessageEvent) => {
            console.log('Received: ', event)

            // получаем ответ сервера и парсим его
            const data = JSON.parse(event.data)
            console.debug('[WebSocket] payload', data)

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

            const normalized =
                normalizeIncomingMessage(data)
            if (!normalized) return

            setMessages((prev) => [...prev, normalized])
            console.info('[WebSocket] message stored', {
                chatKey: normalized.chatKey,
                toUserId: normalized.toUserId,
                uid: normalized.uid,
            })

            if (normalized.toUserId && normalized.chatKey) {
                const tempChat = chats.find(
                    (chat) =>
                        chat.isTemporary &&
                        chat.tempContactUid ===
                            normalized.toUserId,
                )

                if (
                    tempChat &&
                    tempChat.chatKey !== normalized.chatKey
                ) {
                    console.info(
                        '[WebSocket] update temp chat',
                        {
                            tempChatId: tempChat.id,
                            fromChatKey: tempChat.chatKey,
                            toChatKey: normalized.chatKey,
                        },
                    )
                    dispatch(
                        updateChat({
                            ...tempChat,
                            isTemporary: false,
                            tempContactUid: undefined,
                            chatKey: normalized.chatKey,
                        }),
                    )
                }
            }
        },
        [chats, dispatch, normalizeIncomingMessage],
    )

    // Вспомогательная функция для получения токена из LocalStorage
    const getAccessToken = useCallback(() => {
        return localStorage.getItem('access_token')
    }, [])

    // Функция подключения
    const connectWebSocket = useCallback(() => {
        // 1. Получить токен из localstorage из поля (access_token)
        const token = getAccessToken()

        if (!token) {
            setError('No auth token found')
            return
        }

        // Построить URL:
        const url = `wss://api.test.chat.ktsf.ru/ws/chat?authorization=${encodeURIComponent(token)}`

        // Создать новое webSocket подключение с этим url
        const socket = new WebSocket(url)

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
            console.log('onMessage вызван: ', data)
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

        const token = localStorage.getItem('access_token')
        if (token) {
            queueMicrotask(() => {
                connectWebSocket()
            })
        }

        return () => {
            wsRef.current?.close()
        }
    }, [connectWebSocket])

    // Функция отправки сообщения
    const sendMessage = useCallback(
        ({
            toUserId,
            content,
            status,
            files,
            repliedMessages,
            forwardedMessages,
        }: Message) => {
            // создаём объект для отправки на backend
            const messageObj = {
                // тип действия -> отправка сообщения
                action: 'create_text_message',
                // генерируем уникальный идентификатор
                request_uid: crypto.randomUUID(),
                // отправляем данные
                object: {
                    to_user_uid: toUserId,
                    content: content,
                    status: status,
                    files: files,
                    replied_messages: repliedMessages,
                    forwarded_messages: forwardedMessages,
                },
            }

            console.log('Отправили на сервер: ', messageObj)

            // Отправляем только есть соединение
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
            messages,
            status,
            error,
        }),
        [
            sendMessage,
            updateMessage,
            deleteMessage,
            messages,
            status,
            error,
        ],
    )
}
