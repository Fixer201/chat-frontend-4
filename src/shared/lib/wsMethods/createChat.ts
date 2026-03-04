// Create Chat WebSocket Method
import { CreateChatCallback } from './types'

export interface CreateChatParams {
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
}

export interface CreateChatResult {
    success: boolean
    chat?: unknown
    error?: string
}

export function createChatMethod(
    ws: WebSocket | null,
    isConnected: boolean,
    connectionState: string,
    callbacks: Map<string, CreateChatCallback>,
    sendFn: (data: unknown) => boolean,
    connectFn: () => void,
): (params: CreateChatParams) => Promise<CreateChatResult> {
    return function createChat(
        params: CreateChatParams,
    ): Promise<CreateChatResult> {
        console.log(
            '[WS Service] 🏠 createChat() called with:',
            {
                name: params.name,
                description: params.description,
                chatType: params.chatType,
                uidUsersList: params.uidUsersList,
                hasAvatar: !!params.avatar,
                avatarFilename: params.avatar?.filename,
                avatarDataLength:
                    params.avatar?.data?.length,
            },
        )

        return new Promise((resolve) => {
            // Ensure connection
            console.log(
                '[WS Service] 📊 Connection state before send:',
                connectionState,
            )
            if (!isConnected) {
                console.log(
                    '[WS Service] 🔌 Not connected, calling connect()...',
                )
                connectFn()
            }

            const requestUid = crypto.randomUUID()
            console.log(
                '[WS Service] 🔑 Generated request_uid:',
                requestUid,
            )

            // Store callback
            callbacks.set(requestUid, resolve)

            // Prepare message
            const messageObj = {
                action: 'create_chat',
                request_uid: requestUid,
                object: {
                    name: params.name,
                    description: params.description || '',
                    chat_type: params.chatType,
                    uid_users_list: params.uidUsersList,
                    ...(params.avatar && {
                        avatar: params.avatar,
                    }),
                },
            }

            console.log(
                '[WS Service] 📦 Prepared message object (without avatar data):',
                {
                    action: messageObj.action,
                    request_uid: messageObj.request_uid,
                    object: {
                        ...messageObj.object,
                        avatar: messageObj.object.avatar
                            ? {
                                  filename:
                                      messageObj.object
                                          .avatar.filename,
                                  dataLength:
                                      messageObj.object
                                          .avatar.data
                                          .length,
                              }
                            : null,
                    },
                },
            )

            // Try to send immediately if connected
            if (isConnected) {
                console.log(
                    '[WS Service] ✅ Connected, sending immediately',
                )
                sendFn(messageObj)
            } else {
                console.log(
                    '[WS Service] ⏳ Not connected yet, waiting...',
                )
                // Wait for connection then send
                let attempts = 0
                const maxAttempts = 50 // 5 seconds max
                const checkAndSend = () => {
                    attempts++
                    if (isConnected) {
                        console.log(
                            '[WS Service] ✅ Connected after',
                            attempts * 100,
                            'ms, sending now',
                        )
                        sendFn(messageObj)
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkAndSend, 100)
                    } else {
                        console.error(
                            '[WS Service] ❌ Timeout waiting for connection',
                        )
                        callbacks.delete(requestUid)
                        resolve({
                            success: false,
                            error: 'Connection timeout',
                        })
                    }
                }
                checkAndSend()
            }

            // Timeout after 10 seconds
            setTimeout(() => {
                if (callbacks.has(requestUid)) {
                    console.error(
                        '[WS Service] ⏰ Request timeout after 10 seconds, request_uid:',
                        requestUid,
                    )
                    callbacks.delete(requestUid)
                    resolve({
                        success: false,
                        error: 'WebSocket timeout',
                    })
                }
            }, 10000)
        })
    }
}
