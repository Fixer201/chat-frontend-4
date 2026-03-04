// Delete Chat WebSocket Method
import { DeleteChatCallback } from './types'

export interface DeleteChatParams {
    chat_key: string
}

export interface DeleteChatResult {
    success: boolean
    result?: {
        chat_key: string
        chat_type: string
    }
    error?: string
}

export function deleteChatMethod(
    ws: WebSocket | null,
    isConnected: boolean,
    connectionState: string,
    callbacks: Map<string, DeleteChatCallback>,
    sendFn: (data: unknown) => boolean,
    connectFn: () => void,
): (params: DeleteChatParams) => Promise<DeleteChatResult> {
    return function deleteChat(
        params: DeleteChatParams,
    ): Promise<DeleteChatResult> {
        console.log(
            '[WS Service] 🗑️ deleteChat() called with:',
            {
                chat_key: params.chat_key,
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
                action: 'delete_chat',
                request_uid: requestUid,
                object: {
                    chat_key: params.chat_key,
                },
            }

            console.log(
                '[WS Service] 📦 Prepared message object:',
                messageObj,
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
