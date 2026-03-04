// transferOwner.ts
import { TransferOwnerCallback } from './types'

export interface TransferOwnerParams {
    chat_key: string
    new_owner_uid: string
}

export interface TransferOwnerResult {
    success: boolean
    result?: {
        chat_key: string
        chat_type: string
        new_owner: {
            uid: string
            full_name: string
        }
    }
    error?: string
}

export function transferOwnerMethod(
    ws: WebSocket | null,
    isConnected: boolean,
    connectionState: string,
    callbacks: Map<string, TransferOwnerCallback>,
    sendFn: (data: unknown) => boolean,
    connectFn: () => void,
): (
    params: TransferOwnerParams,
) => Promise<TransferOwnerResult> {
    return function transferOwner(
        params: TransferOwnerParams,
    ): Promise<TransferOwnerResult> {
        console.log(
            '[WS Service] 👑 transferOwner() called with:',
            params,
        )

        return new Promise((resolve) => {
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

            callbacks.set(requestUid, resolve)

            const messageObj = {
                action: 'transfer_owner',
                request_uid: requestUid,
                object: {
                    chat_key: params.chat_key,
                    new_owner_uid: params.new_owner_uid,
                },
            }

            if (isConnected) {
                console.log(
                    '[WS Service] ✅ Connected, sending immediately',
                )
                sendFn(messageObj)
            } else {
                console.log(
                    '[WS Service] ⏳ Not connected yet, waiting...',
                )
                let attempts = 0
                const maxAttempts = 50
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
