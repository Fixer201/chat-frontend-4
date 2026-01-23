'use client'

import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { Message } from '@shared/types/message'
import { ConnectionStatus } from '@shared/types/webSocket'
import { MOCK_MESSAGES } from '@shared/mocks/messages'

const MAX_RECONNECT_ATTEMPTS = 3

// TODO: Временный флаг для переключения между моковыми и реальными данными
// Удалить после реализации контактов на бэкенде
const USE_MOCK = true

export function useWebSocketChat() {
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

    function onMessage(event: MessageEvent) {
        console.log('Received: ', event)

        // получаем ответ сервера и парсим его
        const data = JSON.parse(event.data)

        if (
            // если удачно получили сообщение
            data.action === 'create_text_message' &&
            data.status === 'success'
        ) {
            setMessages((prev) => [...prev, data.message])
        }
    }

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
    }, [getAccessToken, onError])

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

    return useMemo(
        () => ({
            sendMessage,
            messages,
            status,
            error,
        }),
        [sendMessage, messages, status, error],
    )
}
