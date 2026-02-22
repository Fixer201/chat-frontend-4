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
} from '@redux/slices/chatsSlice'

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
    //
    // Нужен для optimistic-сообщений: при отправке файла мы мгновенно
    // добавляем сообщение в локальный стейт со статусом 'sending'.
    // Чтобы MessageItem корректно определил isOwn (выравнивание вправо,
    // цвет пузыря, иконки статуса) — проставляем from_user = текущий UID.
    //
    // Вычисляется один раз (lazy init через if-guard) и хранится в ref,
    // потому что JWT не меняется в рамках сессии, а sendMessage — useCallback
    // с пустым массивом зависимостей, и ему нужен доступ через ref.
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
                // Сервер возвращает файлы в формате ApiFileItem
                // (file_url, file_type), маппим через normalizeFileItem
                files: (
                    (messageData.files_list as
                        | Record<string, unknown>[]
                        | undefined) ??
                    (messageData.files as
                        | Record<string, unknown>[]
                        | undefined) ??
                    []
                ).map((f) =>
                    // Если уже есть filename — это локальный файл (base64),
                    // пропускаем нормализацию чтобы не потерять data
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

                // Статусные события (онлайн/офлайн пользователей) —
                // не логируем, чтобы не засорять консоль десятками сообщений в секунду
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

                const normalized =
                    normalizeIncomingMessage(data)
                if (!normalized) return

                // Сервер возвращает request_uid, который мы передали при отправке.
                // Это единственный надёжный способ связать ответ сервера
                // с конкретным optimistic-сообщением в локальном стейте.
                // Без этого мы бы не знали, какую заглушку удалять.
                const reqUid = data.request_uid as
                    | string
                    | undefined

                setMessages((prev) => {
                    // Шаг 1: удаляем optimistic-заглушку (uid вида `_sending_<reqUid>`).
                    // Если сервер не вернул request_uid — пропускаем (нечего удалять).
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

                    // Переносим file_size из optimistic → серверное сообщение.
                    //
                    // Зачем: API не возвращает размер файла. При создании
                    // optimistic-сообщения мы вычисляем его из base64 (length × 0.75)
                    // и сохраняем в file_size. Без переноса — после замены
                    // optimistic на серверное сообщение размер пропадёт из UI.
                    //
                    // Сопоставление по индексу (files[i]) безопасно, потому что
                    // MessageComposer отправляет файлы в фиксированном порядке,
                    // а сервер сохраняет его в files_list.
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

                    // Шаг 2: дедупликация — сервер иногда присылает одно
                    // сообщение дважды (echo + broadcast), пропускаем повторы
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
                //
                // Три сценария:
                // 1. Временный чат → реальный: пользователь открыл контакт (создался
                //    временный чат с chatKey "chat_key_0"), отправил/получил сообщение —
                //    сервер вернул реальный chatKey. Обновляем чат в Redux.
                // 2. Совершенно новый чат: сообщение от незнакомого пользователя,
                //    чата нет в списке — перезагружаем список с сервера.
                // 3. Существующий чат: сообщение уже привязано к известному chatKey —
                //    ничего делать не нужно, сообщение уже добавлено в messages.
                if (normalized.chatKey) {
                    const currentChats = chatsRef.current

                    // Ищем временный чат, соответствующий собеседнику.
                    // toUserId — для исходящих (получатель = контакт),
                    // from_user — для входящих (отправитель = контакт).
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
                        // Сценарий 1: заменяем временный chatKey на реальный от сервера.
                        // Сначала обновляем chatKey для мгновенного отображения,
                        // затем перезагружаем список чатов с сервера, чтобы
                        // получить актуальные метаданные (имя, аватар),
                        // которые во временном чате были моковыми.
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
                        // Сценарий 2: чат отсутствует в списке —
                        // загружаем актуальный список чатов с сервера,
                        // чтобы новый чат появился в боковой панели
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
            // Уникальный идентификатор запроса — связывает optimistic-сообщение
            // в UI с ответом сервера для корректной замены заглушки на реальные данные
            const requestUid = crypto.randomUUID()

            const messageObj = {
                action: 'create_text_message',
                request_uid: requestUid,
                object: {
                    // Бэкенд принимает ровно один идентификатор адресата:
                    // — chat_key: для существующих реальных чатов
                    // — to_user_uid: для новых чатов (первое сообщение контакту)
                    // Одновременная отправка обоих полей вызывает ошибку.
                    //
                    // Логика выбора:
                    // 1. Если chatKey принадлежит реальному (не временному) чату → chat_key
                    // 2. Если передан toUserId (обычная отправка) → to_user_uid
                    // 3. Иначе (пересылка во временный чат) → ищем UID контакта
                    //    в Redux по chatKey и используем как to_user_uid
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
                        // Пересылка во временный чат: находим UID собеседника
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
                    // Ответы и пересылка: бэкенд ожидает массив UID
                    // оригинальных сообщений — контент подтягивается на сервере
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

            // Optimistic UI: сообщение с файлами мгновенно появляется в чате
            // со статусом «sending» (спиннер + иконка часов). Когда сервер
            // подтвердит доставку (вернёт request_uid), заглушка будет заменена
            // реальным сообщением в обработчике onmessage.
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
                        // Предвычисляем file_size из base64, пока data ещё доступна.
                        // После подтверждения сервером optimistic-сообщение заменяется
                        // на серверное (без base64), и размер был бы потерян.
                        // file_size переносится в обработчике onmessage (см. выше).
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

    // Отмена отправки файла: удаляет optimistic-сообщение из UI.
    //
    // Ограничение: сообщение уже ушло на сервер через WebSocket —
    // «отмена» убирает только локальную заглушку. Серверное сообщение
    // всё равно появится, когда придёт WS-ответ (пользователь увидит
    // «доставленное» сообщение). Полноценная отмена требует серверной
    // поддержки (action: cancel_message), которой пока нет.
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

    return useMemo(
        () => ({
            sendMessage,
            updateMessage,
            deleteMessage,
            cancelSending,
            messages,
            status,
            error,
        }),
        [
            sendMessage,
            updateMessage,
            deleteMessage,
            cancelSending,
            messages,
            status,
            error,
        ],
    )
}
