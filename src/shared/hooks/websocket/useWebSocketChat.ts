'use client'

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import Cookies from 'js-cookie'

import {
    useAppDispatch,
    useAppSelector,
} from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import { ChatSettings } from '@shared/types/chat'
import { createMessageHandler } from './createMessageHandler'
import { useWsConnection } from './useWsConnection'
import { useSendOperations } from './useSendOperations'

/**
 * Тонкий оркестратор — только композиция модулей, без собственной логики.
 */
export function useWebSocketChat() {
    // 1. Redux state
    const dispatch = useAppDispatch()
    const chats = useAppSelector(
        (state) => state.chats.items,
    )
    const chatSettings = useAppSelector(
        (state) => state.chats.chatSettings,
    ) as Record<string, ChatSettings>
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

    // 2. Refs
    const chatsRef = useRef(chats)
    const ackSeenRef = useRef(new Set<string>())
    const normalizeSeenRef = useRef(new Set<string>())
    const storedSeenRef = useRef(new Set<string>())
    const lastChatsRefreshRef = useRef(0)

    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    // 3. Shared wsRef — owned by orchestrator, passed to both hooks
    const wsRef = useRef<WebSocket | null>(null)

    // 4. Send operations (owns messages state)
    const sendOps = useSendOperations(
        wsRef,
        currentUserId,
        dispatch,
        chatsRef,
    )

    // 5. Message handler — deps хранятся в ref, чтобы не читать refs во время рендера
    const handlerDepsRef = useRef({
        setMessages: sendOps.setMessages,
        dispatch,
        chatsRef,
        pendingMessageMapRef: sendOps.pendingMessageMapRef,
        ackSeenRef,
        normalizeSeenRef,
        storedSeenRef,
        lastChatsRefreshRef,
        chatSettings,
    })
    useEffect(() => {
        handlerDepsRef.current = {
            setMessages: sendOps.setMessages,
            dispatch,
            chatsRef,
            pendingMessageMapRef:
                sendOps.pendingMessageMapRef,
            ackSeenRef,
            normalizeSeenRef,
            storedSeenRef,
            lastChatsRefreshRef,
            chatSettings,
        }
    }, [
        sendOps.setMessages,
        dispatch,
        chatSettings,
        sendOps.pendingMessageMapRef,
    ])

    const onMessage = useCallback((event: MessageEvent) => {
        createMessageHandler(handlerDepsRef.current)(event)
    }, [])

    // 6. Connection (receives wsRef + onMessage)
    const { status, error } = useWsConnection(
        wsRef,
        onMessage,
        sendOps.setMessages,
    )

    // 7. Return
    return useMemo(
        () => ({
            sendMessage: sendOps.sendMessage,
            updateMessage: sendOps.updateMessage,
            deleteMessage: sendOps.deleteMessage,
            markMessagesRead: sendOps.markMessagesRead,
            messages: sendOps.messages,
            status,
            error,
        }),
        [
            sendOps.sendMessage,
            sendOps.updateMessage,
            sendOps.deleteMessage,
            sendOps.markMessagesRead,
            sendOps.messages,
            status,
            error,
        ],
    )
}
