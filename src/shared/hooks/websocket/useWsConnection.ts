'use client'

import {
    MutableRefObject,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import Cookies from 'js-cookie'

import { ConnectionStatus } from '@shared/types/webSocket'
import { MOCK_MESSAGES } from '@shared/mocks/messages'
import { Message } from '@shared/types/message'
import { WS_URL } from '@shared/config/env'
import {
    MAX_RECONNECT_ATTEMPTS,
    STATUS_POLL_INTERVAL_MS,
    USE_MOCK,
} from './constants'

/**
 * Хук жизненного цикла WebSocket-соединения.
 *
 * Инкапсулирует: подключение, reconnect, периодический опрос статусов.
 * Принимает wsRef извне (создаётся оркестратором) и onMessage callback.
 */
export function useWsConnection(
    wsRef: MutableRefObject<WebSocket | null>,
    onMessage: (event: MessageEvent) => void,
    setMessages?: (messages: Message[]) => void,
): {
    status: ConnectionStatus
    error: string | null
} {
    const reconnectRef = useRef<() => void>(() => {})
    const reconnectCountRef = useRef<number>(0)
    const statusIntervalRef = useRef<ReturnType<
        typeof setInterval
    > | null>(null)

    const [status, setStatus] =
        useState<ConnectionStatus>('CLOSED')
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
    }, [wsRef])

    const onOpen = useCallback(() => {
        console.info('[WebSocket] opened')
        reconnectCountRef.current = 0
        setStatus('OPEN')

        setTimeout(() => {
            requestStatusList()
        }, 100)

        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current)
        }
        statusIntervalRef.current = setInterval(
            requestStatusList,
            STATUS_POLL_INTERVAL_MS,
        )
    }, [requestStatusList])

    const onClose = useCallback(() => {
        console.info('[WebSocket] closed')
        setStatus('CLOSED')
        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current)
            statusIntervalRef.current = null
        }
    }, [])

    const onError = useCallback((e: Event) => {
        setStatus('ERROR')
        setError(`${e}`)
        console.log('WebSocket Error: ', e)

        if (
            reconnectCountRef.current <
            MAX_RECONNECT_ATTEMPTS
        ) {
            reconnectCountRef.current += 1
            setTimeout(() => {
                reconnectRef.current()
            }, 3000)
        }
    }, [])

    const getAccessToken = useCallback(() => {
        return Cookies.get('access_token') || null
    }, [])

    const connectWebSocket = useCallback(() => {
        if (
            wsRef.current?.readyState === WebSocket.OPEN ||
            wsRef.current?.readyState ===
                WebSocket.CONNECTING
        ) {
            return
        }
        const token = getAccessToken()

        if (!token) {
            console.warn('[WebSocket] no auth token found')
            setError('No auth token found')
            return
        }

        const url = `${WS_URL}/ws/chat?authorization=${encodeURIComponent(token)}`
        const socket = new WebSocket(url)

        console.info('[WebSocket] connecting', { url })

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
    }, [
        wsRef,
        getAccessToken,
        onOpen,
        onClose,
        onError,
        onMessage,
    ])

    useLayoutEffect(() => {
        if (USE_MOCK) {
            console.log('🎭 Используются моковые данные')
            queueMicrotask(() => {
                setMessages?.(MOCK_MESSAGES)
                setStatus('OPEN')
            })
            return
        }

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
    }, [
        wsRef,
        connectWebSocket,
        getAccessToken,
        setMessages,
    ])

    return { status, error }
}
