'use client'

import {
    Dispatch,
    MutableRefObject,
    SetStateAction,
} from 'react'
import { ChatItem, ChatSettings } from '@shared/types/chat'
import { Message } from '@shared/types/message'
import { AppDispatch } from '@redux/store'
import {
    updateChat,
    updateContactStatus,
} from '@redux/slices/chatsSlice'
import { fetchChats } from '@redux/extraReducers/chat-extraReducers/fetchChatsExtraRed'
import { normalizeIncomingMessage } from './normalizeMessage'
import {
    buildLastMessagePreview,
    persistLocalChatsSnapshot,
} from './chatPreviewUtils'

export interface MessageHandlerDeps {
    setMessages: Dispatch<SetStateAction<Message[]>>
    dispatch: AppDispatch
    chatsRef: MutableRefObject<ChatItem[]>
    pendingMessageMapRef: MutableRefObject<
        Map<string, string>
    >
    ackSeenRef: MutableRefObject<Set<string>>
    normalizeSeenRef: MutableRefObject<Set<string>>
    storedSeenRef: MutableRefObject<Set<string>>
    lastChatsRefreshRef: MutableRefObject<number>
    chatSettings: Record<string, ChatSettings>
}

// --- Per-action handlers ---

function handleStatusList(
    data: Record<string, unknown>,
    dispatch: AppDispatch,
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
                    isOnline: entry.is_online ?? false,
                    wasOnlineAt: entry.was_online_at ?? 0,
                }),
            )
        },
    )
}

function handleUpdateMessage(
    data: Record<string, unknown>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
) {
    const obj = data.object as Record<string, unknown>
    setMessages((prev) =>
        prev.map((msg) =>
            msg.uid === obj.uid
                ? {
                      ...msg,
                      content:
                          (obj.content as
                              | string
                              | undefined) ?? msg.content,
                      updated_at:
                          (obj.updated_at as
                              | number
                              | undefined) ??
                          msg.updated_at,
                      isEdited: true,
                  }
                : msg,
        ),
    )
}

function handleCreateAck(
    data: Record<string, unknown>,
    ackSeenRef: MutableRefObject<Set<string>>,
) {
    const messageData =
        (data.message as
            | Record<string, unknown>
            | undefined) ??
        (data.object as Record<string, unknown> | undefined)
    const ackKey =
        (data.request_uid as string | undefined) ??
        (messageData?.uid as string | undefined)
    if (ackKey && ackSeenRef.current.has(ackKey)) {
        return
    }
    if (ackKey) {
        ackSeenRef.current.add(ackKey)
    }
    console.info('[WebSocket] message ack', {
        chatKey: messageData?.chat_key,
        hasContent:
            typeof messageData?.content === 'string',
        objectKeys: messageData
            ? Object.keys(messageData)
            : [],
    })
}

function handleDeleteMessage(
    data: Record<string, unknown>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
) {
    const obj = data.object as Record<string, unknown>
    setMessages((prev) =>
        prev.filter((msg) => msg.uid !== obj.uid),
    )
}

function handleReadStatus(
    data: Record<string, unknown>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
) {
    const obj = data.object as
        | Record<string, unknown>
        | undefined
    const messageUid =
        (obj?.uid as string | undefined) ||
        (obj?.message_uid as string | undefined)
    const readAt =
        (obj?.updated_at as number | undefined) ||
        (obj?.created_at as number | undefined) ||
        Math.floor(Date.now() / 1000)

    if (messageUid) {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.uid === messageUid
                    ? {
                          ...msg,
                          read_at: readAt,
                          delivered_at:
                              msg.delivered_at || readAt,
                      }
                    : msg,
            ),
        )
    }
}

function handleNormalizedMessage(
    data: Record<string, unknown>,
    normalized: Message,
    deps: MessageHandlerDeps,
) {
    const {
        setMessages,
        dispatch,
        chatsRef,
        pendingMessageMapRef,
        ackSeenRef,
        normalizeSeenRef,
        storedSeenRef,
        lastChatsRefreshRef,
        chatSettings,
    } = deps

    if (normalized.uid) {
        if (!normalizeSeenRef.current.has(normalized.uid)) {
            normalizeSeenRef.current.add(normalized.uid)
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
        ? pendingMessageMapRef.current.get(requestUid)
        : undefined

    if (pendingUid && requestUid) {
        pendingMessageMapRef.current.delete(requestUid)
    }

    setMessages((prev) => {
        if (
            normalized.uid &&
            prev.some((msg) => msg.uid === normalized.uid)
        ) {
            if (normalized.uid) {
                const skipKey = `skip:${normalized.uid}`
                if (!ackSeenRef.current.has(skipKey)) {
                    ackSeenRef.current.add(skipKey)
                    console.info(
                        '[WebSocket] message already stored',
                        {
                            uid: normalized.uid,
                            chatKey: normalized.chatKey,
                        },
                    )
                }
            }
            return prev
        }
        const withoutPending = pendingUid
            ? prev.filter((msg) => msg.uid !== pendingUid)
            : prev
        if (normalized.uid) {
            if (
                !storedSeenRef.current.has(normalized.uid)
            ) {
                storedSeenRef.current.add(normalized.uid)
                console.info('[WebSocket] message stored', {
                    chatKey: normalized.chatKey,
                    toUserId: normalized.toUserId,
                    uid: normalized.uid,
                })
            }
        }
        return [...withoutPending, normalized]
    })

    // Update chat preview
    const preview = buildLastMessagePreview(
        normalized,
        chatsRef.current,
    )
    if (preview) {
        dispatch(
            updateChat({
                ...preview.chat,
                lastMessage: preview.lastMessage,
                updatedAt: preview.updatedAt,
            }),
        )
    }

    // Update temp chat if needed
    if (normalized.toUserId && normalized.chatKey) {
        const tempChat = chatsRef.current.find(
            (chat) =>
                chat.isTemporary &&
                chat.tempContactUid === normalized.toUserId,
        )

        if (
            tempChat &&
            tempChat.chatKey !== normalized.chatKey
        ) {
            const updatedTempChat: ChatItem = {
                ...tempChat,
                isTemporary: false,
                tempContactUid: undefined,
                chatKey: normalized.chatKey,
            }
            console.info('[WebSocket] update temp chat', {
                tempChatId: tempChat.id,
                fromChatKey: tempChat.chatKey,
                toChatKey: normalized.chatKey,
                toUserId: normalized.toUserId,
            })
            dispatch(updateChat(updatedTempChat))
            persistLocalChatsSnapshot(
                chatsRef.current.map((chat) =>
                    chat.id === updatedTempChat.id
                        ? updatedTempChat
                        : chat,
                ),
                chatSettings,
            )

            const now = Date.now()
            const isChatsPage =
                typeof window !== 'undefined' &&
                window.location.pathname.startsWith(
                    '/chats',
                )

            if (
                isChatsPage &&
                now - lastChatsRefreshRef.current > 3000
            ) {
                lastChatsRefreshRef.current = now
                dispatch(fetchChats({ count: 15 }))
            }
        }
    }
}

/**
 * Factory: принимает deps-объект, возвращает `(event: MessageEvent) => void`.
 *
 * Парсит JSON из WS event и маршрутизирует по `data.action`.
 */
export function createMessageHandler(
    deps: MessageHandlerDeps,
): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
        const data = JSON.parse(event.data) as Record<
            string,
            unknown
        >

        // get_status_list_chat
        if (
            data.action === 'get_status_list_chat' &&
            data.status === 'OK'
        ) {
            handleStatusList(data, deps.dispatch)
            return
        }

        // update_message
        if (
            data.action === 'update_message' &&
            data.status === 'OK'
        ) {
            handleUpdateMessage(data, deps.setMessages)
            return
        }

        // create_text_message OK (ack)
        if (
            data.action === 'create_text_message' &&
            data.status === 'OK'
        ) {
            handleCreateAck(data, deps.ackSeenRef)
        }

        // create_text_message error
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

        // delete_message
        if (
            data.action === 'delete_message' &&
            data.status === 'OK'
        ) {
            handleDeleteMessage(data, deps.setMessages)
            return
        }

        // change_status_read_message
        if (
            data.action === 'change_status_read_message' &&
            data.status === 'OK'
        ) {
            handleReadStatus(data, deps.setMessages)
            return
        }

        // Normalize incoming message
        const normalized = normalizeIncomingMessage(data)
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

        handleNormalizedMessage(data, normalized, deps)
    }
}
