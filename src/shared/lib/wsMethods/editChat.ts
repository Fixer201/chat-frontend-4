// Edit Chat WebSocket Method
import { EditChatCallback } from './types'

const REQUEST_TIMEOUT = 10000

export interface EditChatParams {
    chatKey: string
    name: string
    description?: string
    avatar?: {
        filename: string
        data: string // Base64
    } | null
    chatType: 'chat' // API expects 'chat' for both groups and channels
}

export interface EditChatResult {
    success: boolean
    chat?: {
        createdBy: string
        ownerFullName: string
        chatKey: string
        chatId: string
        name: string
        description: string
        chatType: string
        avatar?: {
            filename: string
            url: string
        }
        addedUsers?: Array<{
            uid: string
            fullName: string
        }>
    }
    error?: string
}

export function editChatMethod(
    ws: WebSocket | null,
    isConnected: boolean,
    connectionState: string,
    editChatCallbacks: Map<string, EditChatCallback>,
    sendFn: (data: unknown) => boolean,
    connectFn: () => void,
): (params: EditChatParams) => Promise<EditChatResult> {
    return function editChat(
        params: EditChatParams,
    ): Promise<EditChatResult> {
        console.log(
            '[WS editChat] 📝 Starting edit chat request:',
            {
                chatKey: params.chatKey,
                name: params.name,
                hasAvatar: !!params.avatar,
            },
        )

        // If not connected, try to connect first
        if (!isConnected) {
            console.log(
                '[WS editChat] ⚠️ Not connected, attempting to connect...',
            )
            connectFn()

            // Wait a bit and check again
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (!isConnected) {
                        console.error(
                            '[WS editChat] ❌ Still not connected after attempt',
                        )
                        resolve({
                            success: false,
                            error: 'WebSocket not connected',
                        })
                    } else {
                        // Retry the request now that we're connected
                        resolve(editChat(params))
                    }
                }, 1000)
            })
        }

        return new Promise((resolve) => {
            const requestUid = crypto.randomUUID()
            console.log(
                '[WS editChat] 🆔 Generated request_uid:',
                requestUid,
            )

            // Set up timeout
            const timeoutId = setTimeout(() => {
                console.error(
                    '[WS editChat] ⏰ Request timeout after 10 seconds',
                    {
                        request_uid: requestUid,
                    },
                )
                editChatCallbacks.delete(requestUid)
                resolve({
                    success: false,
                    error: 'Request timeout',
                })
            }, REQUEST_TIMEOUT)

            // Store callback
            console.log(
                '[WS editChat] 📝 Storing callback for request_uid:',
                requestUid,
                'Total callbacks:',
                editChatCallbacks.size + 1,
            )
            editChatCallbacks.set(
                requestUid,
                (response: {
                    success: boolean
                    chat?: unknown
                    error?: string
                }) => {
                    clearTimeout(timeoutId)
                    console.log(
                        '[WS editChat] ✅ Callback executed with response:',
                        {
                            success: response.success,
                            error: response.error,
                        },
                    )
                    resolve({
                        success: response.success,
                        chat: response.chat as
                            | EditChatResult['chat']
                            | undefined,
                        error: response.error,
                    })
                },
            )

            // Build request payload
            const payload: {
                action: string
                request_uid: string
                object: {
                    chat_key: string
                    name: string
                    description: string
                    avatar?: {
                        filename: string
                        data: string
                    }
                    chat_type: string
                }
            } = {
                action: 'edit_chat',
                request_uid: requestUid,
                object: {
                    chat_key: params.chatKey,
                    name: params.name,
                    description: params.description || '',
                    chat_type: params.chatType,
                },
            }

            // Add avatar if provided
            if (params.avatar) {
                payload.object.avatar = params.avatar
            }

            console.log(
                '[WS editChat] 📤 Sending edit_chat request:',
                {
                    action: payload.action,
                    request_uid: payload.request_uid,
                    chat_key: payload.object.chat_key,
                    name: payload.object.name,
                    description: payload.object.description,
                    chat_type: payload.object.chat_type,
                    hasAvatar: !!payload.object.avatar,
                    avatarFilename:
                        payload.object.avatar?.filename,
                },
            )

            // Send via WebSocket
            const sent = sendFn(payload)
            console.log(
                '[WS editChat] 📨 Send result:',
                sent,
            )

            if (!sent) {
                clearTimeout(timeoutId)
                editChatCallbacks.delete(requestUid)
                console.error(
                    '[WS editChat] ❌ Failed to send request',
                )
                resolve({
                    success: false,
                    error: 'Failed to send WebSocket message',
                })
            }
        })
    }
}
