'use client'

import {
    Dispatch,
    MutableRefObject,
    SetStateAction,
    useCallback,
    useRef,
    useState,
} from 'react'

import { ChatItem } from '@shared/types/chat'
import { Message, MessageFile } from '@shared/types/message'
import { AppDispatch } from '@redux/store'
import { updateChat } from '@redux/slices/chatsSlice'
import { buildLastMessagePreview } from './chatPreviewUtils'

/**
 * Хук, инкапсулирующий все исходящие WS-команды и стейт сообщений.
 *
 * - messages/setMessages живут здесь (sendMessage нужен оптимистичный UI)
 * - pendingMessageMapRef — маппинг request_uid → temp_uid
 */
export function useSendOperations(
    wsRef: MutableRefObject<WebSocket | null>,
    currentUserId: string,
    dispatch: AppDispatch,
    chatsRef: MutableRefObject<ChatItem[]>,
): {
    sendMessage: (message: Message) => void
    updateMessage: (params: {
        uid: string
        chatKey: string
        content: string
        status: string
        files?: MessageFile[]
    }) => void
    deleteMessage: (params: {
        uid: string
        chatKey: string
        forAll: boolean
    }) => void
    markMessagesRead: (params: {
        chatKey: string
        messageUids: string[]
    }) => void
    pendingMessageMapRef: MutableRefObject<
        Map<string, string>
    >
    setMessages: Dispatch<SetStateAction<Message[]>>
    messages: Message[]
} {
    const [messages, setMessages] = useState<Message[]>([])
    const pendingMessageMapRef = useRef(
        new Map<string, string>(),
    )

    const updateChatPreview = useCallback(
        (message: Message) => {
            const preview = buildLastMessagePreview(
                message,
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
        },
        [dispatch, chatsRef],
    )

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

            const isTemporaryChatKey =
                typeof chatKey === 'string' &&
                chatKey.startsWith('chat_key_')
            const isDirectChat =
                typeof chatKey === 'string' &&
                chatKey.startsWith('chat_')

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

            if (
                (isTemporaryChatKey || isDirectChat) &&
                toUserId
            ) {
                messageObject.to_user_uid = toUserId
            } else {
                messageObject.chat_key = chatKey
            }

            const messageObj = {
                action: 'create_text_message',
                request_uid: requestUid,
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
        [wsRef, currentUserId, updateChatPreview],
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
        [wsRef, currentUserId],
    )

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
        [wsRef],
    )

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
        [wsRef],
    )

    return {
        sendMessage,
        updateMessage,
        deleteMessage,
        markMessagesRead,
        pendingMessageMapRef,
        setMessages,
        messages,
    }
}
