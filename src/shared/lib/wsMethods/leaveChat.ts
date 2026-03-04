// Leave Chat WebSocket Method
import { LeaveChatCallback } from './types'

const REQUEST_TIMEOUT = 10000

export interface LeaveChatParams {
    chatKey: string
}

export interface LeaveChatResult {
    success: boolean
    chatKey?: string
    chatType?: string
    leftUser?: {
        uid: string
        fullName: string
    }
    error?: string
}

export function leaveChatMethod(
    ws: WebSocket | null,
    isConnected: boolean,
    connectionState: string,
    leaveChatCallbacks: Map<string, LeaveChatCallback>,
    sendFn: (data: unknown) => boolean,
    connectFn: () => void,
): (params: LeaveChatParams) => Promise<LeaveChatResult> {
    return function leaveChat(
        params: LeaveChatParams,
    ): Promise<LeaveChatResult> {
        console.log(
            '[WS leaveChat] 🚪 Starting leave chat request:',
            {
                chatKey: params.chatKey,
            },
        )

        // If not connected, try to connect first
        if (!isConnected) {
            console.log(
                '[WS leaveChat] ⚠️ Not connected, attempting to connect...',
            )
            connectFn()

            // Wait a bit and check again
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (!isConnected) {
                        console.error(
                            '[WS leaveChat] ❌ Still not connected after attempt',
                        )
                        resolve({
                            success: false,
                            error: 'WebSocket not connected',
                        })
                    } else {
                        // Retry the request now that we're connected
                        resolve(leaveChat(params))
                    }
                }, 1000)
            })
        }

        return new Promise((resolve) => {
            const requestUid = crypto.randomUUID()
            console.log(
                '[WS leaveChat] 🆔 Generated request_uid:',
                requestUid,
            )

            // Set up timeout
            const timeoutId = setTimeout(() => {
                console.error(
                    '[WS leaveChat] ⏰ Request timeout after 10 seconds',
                    {
                        request_uid: requestUid,
                    },
                )
                leaveChatCallbacks.delete(requestUid)
                resolve({
                    success: false,
                    error: 'Request timeout',
                })
            }, REQUEST_TIMEOUT)

            // Store callback
            console.log(
                '[WS leaveChat] 📝 Storing callback for request_uid:',
                requestUid,
                'Total callbacks:',
                leaveChatCallbacks.size + 1,
            )
            leaveChatCallbacks.set(
                requestUid,
                (response: {
                    success: boolean
                    chatKey?: string
                    chatType?: string
                    leftUser?: {
                        uid: string
                        fullName: string
                    }
                    error?: string
                }) => {
                    clearTimeout(timeoutId)
                    console.log(
                        '[WS leaveChat] ✅ Callback executed with response:',
                        {
                            success: response.success,
                            error: response.error,
                        },
                    )
                    resolve({
                        success: response.success,
                        chatKey: response.chatKey,
                        chatType: response.chatType,
                        leftUser: response.leftUser,
                        error: response.error,
                    })
                },
            )

            // Build request payload
            const payload = {
                action: 'leave_chat',
                request_uid: requestUid,
                object: {
                    chat_key: params.chatKey,
                },
            }

            console.log(
                '[WS leaveChat] 📤 Sending leave_chat request:',
                {
                    action: payload.action,
                    request_uid: payload.request_uid,
                    chat_key: payload.object.chat_key,
                },
            )

            // Send via WebSocket
            const sent = sendFn(payload)
            console.log(
                '[WS leaveChat] 📨 Send result:',
                sent,
            )

            if (!sent) {
                clearTimeout(timeoutId)
                leaveChatCallbacks.delete(requestUid)
                console.error(
                    '[WS leaveChat] ❌ Failed to send request',
                )
                resolve({
                    success: false,
                    error: 'Failed to send WebSocket message',
                })
            }
        })
    }
}
