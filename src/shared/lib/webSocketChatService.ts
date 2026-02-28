// WebSocket Chat Service - can be used by both React hooks and Redux thunks
import Cookies from 'js-cookie'
import { ConnectionStatus } from '@shared/types/webSocket'

const MAX_RECONNECT_ATTEMPTS = 3

// Callback types
type CreateChatCallback = (response: {
    success: boolean
    chat?: unknown
    error?: string
}) => void

type AddMembersCallback = (response: {
    success: boolean
    result?: {
        chat_key: string
        chat_type: string
        added_users: Array<{
            uid: string
            full_name: string
        }>
    }
    error?: string
}) => void

// WebSocket service class
class WebSocketChatService {
    private ws: WebSocket | null = null
    private reconnectCount = 0
    private reconnectTimer: NodeJS.Timeout | null = null
    private createChatCallbacks = new Map<
        string,
        CreateChatCallback
    >()
    private addMembersCallbacks = new Map<
        string,
        AddMembersCallback
    >()

    // Getters
    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    // Get connection state as string for logging
    get connectionState(): string {
        if (!this.ws) return 'NO_SOCKET'
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING'
            case WebSocket.OPEN:
                return 'OPEN'
            case WebSocket.CLOSING:
                return 'CLOSING'
            case WebSocket.CLOSED:
                return 'CLOSED'
            default:
                return 'UNKNOWN'
        }
    }

    // Connect to WebSocket
    connect(): void {
        console.log(
            '[WS Service] 🔌 connect() called, current state:',
            this.connectionState,
        )

        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log(
                '[WS Service] ✅ Already connected, skipping',
            )
            return
        }

        // Reset reconnect counter when manually connecting
        this.reconnectCount = 0

        const token = Cookies.get('access_token')
        if (!token) {
            console.error(
                '[WS Service] ❌ No auth token found in cookies',
            )
            console.error(
                '[WS Service] 💡 Make sure you are logged in and have a valid access_token cookie',
            )
            return
        }

        console.log(
            '[WS Service] 🔑 Token found (length:',
            token.length,
            ')',
        )

        const url = `wss://api.test.chat.ktsf.ru/ws/chat?authorization=${encodeURIComponent(token)}`
        console.log(
            '[WS Service] 🌐 Connecting to: wss://api.test.chat.ktsf.ru/ws/chat?authorization=***',
        )

        try {
            this.ws = new WebSocket(url)

            this.ws.onopen = () => {
                console.log(
                    '[WS Service] ✅ Connected successfully!',
                )
                console.log(
                    '[WS Service] 📊 State:',
                    this.connectionState,
                )
                this.reconnectCount = 0
            }

            this.ws.onclose = (event) => {
                console.log(
                    '[WS Service] 🔴 Disconnected',
                    {
                        code: event.code,
                        codeExplanation:
                            this.getCloseCodeExplanation(
                                event.code,
                            ),
                        reason:
                            event.reason ||
                            '(no reason provided)',
                        wasClean: event.wasClean,
                    },
                )
                // Only attempt reconnect if it wasn't a clean close
                if (
                    !event.wasClean &&
                    event.code !== 1000
                ) {
                    this.attemptReconnect()
                }
            }

            this.ws.onerror = (error) => {
                console.error(
                    '[WS Service] ❌ Error:',
                    error,
                )
            }

            this.ws.onmessage = (event) => {
                console.log(
                    '[WS Service] 📨 Message received:',
                    event.data.substring(0, 200) + '...',
                )
                this.handleMessage(event.data)
            }
        } catch (error) {
            console.error(
                '[WS Service] ❌ Failed to connect:',
                error,
            )
        }
    }

    // Disconnect
    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.ws?.close()
        this.ws = null
    }

    // Attempt reconnection
    private attemptReconnect(): void {
        if (this.reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
            console.error(
                '[WS Service] ❌ Max reconnect attempts reached. WebSocket will not auto-reconnect.',
            )
            console.error(
                '[WS Service] 💡 Tip: Check if you have a valid access_token cookie',
            )
            return
        }

        this.reconnectCount++
        console.log(
            `[WS Service] 🔄 Scheduling reconnect attempt ${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS} in 3 seconds...`,
        )
        this.reconnectTimer = setTimeout(() => {
            console.log(
                `[WS Service] 🔄 Reconnecting... Attempt ${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS}`,
            )
            this.connect()
        }, 3000)
    }

    // Reset reconnect counter (call this when user logs in)
    resetReconnect(): void {
        this.reconnectCount = 0
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
    }

    // Get WebSocket close code explanation
    private getCloseCodeExplanation(code: number): string {
        const codes: Record<number, string> = {
            1000: 'Normal closure',
            1001: 'Going away (page closing)',
            1002: 'Protocol error',
            1003: 'Unsupported data',
            1005: 'No status received',
            1006: 'Abnormal closure (no close frame) - possibly network issue or server down',
            1007: 'Invalid frame payload data',
            1008: 'Policy violation',
            1009: 'Message too big',
            1010: 'Mandatory extension',
            1011: 'Internal server error',
            1015: 'TLS handshake failure',
            4001: 'Unauthorized - invalid or missing token',
            4003: 'Forbidden',
        }
        return codes[code] || `Unknown code: ${code}`
    }

    // Handle incoming messages
    private handleMessage(data: string): void {
        try {
            const parsed = JSON.parse(data)
            console.log('[WS Service] 📥 Parsed message:', {
                action: parsed.action,
                status: parsed.status,
                error: parsed.error,
                request_uid: parsed.request_uid,
                hasObject: !!parsed.object,
            })

            // Handle create_chat response
            if (parsed.action === 'create_chat') {
                console.log(
                    '[WS Service] 🏠 create_chat response received',
                )
                const requestUid = parsed.request_uid as
                    | string
                    | undefined
                if (requestUid) {
                    const callback =
                        this.createChatCallbacks.get(
                            requestUid,
                        )
                    console.log(
                        '[WS Service] 🔑 Request UID:',
                        requestUid,
                        'Has callback:',
                        !!callback,
                    )
                    if (callback) {
                        if (
                            parsed.status === 'OK' &&
                            parsed.object
                        ) {
                            console.log(
                                '[WS Service] ✅ Chat created successfully:',
                                parsed.object,
                            )
                            callback({
                                success: true,
                                chat: parsed.object,
                            })
                        } else {
                            console.error(
                                '[WS Service] ❌ Chat creation failed:',
                                parsed.error,
                            )
                            callback({
                                success: false,
                                error:
                                    parsed.error ||
                                    'Failed to create chat',
                            })
                        }
                        this.createChatCallbacks.delete(
                            requestUid,
                        )
                    }
                }
            }

            // Handle add_members_to_chat response
            if (parsed.action === 'add_members_to_chat') {
                console.log(
                    '[WS Service] 👥 add_members_to_chat response received',
                )
                const requestUid = parsed.request_uid as
                    | string
                    | undefined
                if (requestUid) {
                    const callback =
                        this.addMembersCallbacks.get(
                            requestUid,
                        )
                    console.log(
                        '[WS Service] 🔑 Request UID:',
                        requestUid,
                        'Has callback:',
                        !!callback,
                    )
                    if (callback) {
                        if (
                            parsed.status === 'OK' &&
                            parsed.object
                        ) {
                            console.log(
                                '[WS Service] ✅ Members added successfully:',
                                parsed.object,
                            )
                            callback({
                                success: true,
                                result: parsed.object,
                            })
                        } else {
                            console.error(
                                '[WS Service] ❌ Add members failed:',
                                parsed.error,
                            )
                            callback({
                                success: false,
                                error:
                                    parsed.error ||
                                    'Failed to add members',
                            })
                        }
                        this.addMembersCallbacks.delete(
                            requestUid,
                        )
                    }
                }
            }
        } catch (error) {
            console.error(
                '[WS Service] ❌ Error parsing message:',
                error,
            )
        }
    }

    // Send message through WebSocket
    send(data: unknown): boolean {
        console.log(
            '[WS Service] 📤 Sending message, connected:',
            this.isConnected,
            'state:',
            this.connectionState,
        )
        if (!this.isConnected) {
            console.error(
                '[WS Service] ❌ Not connected, cannot send',
            )
            return false
        }

        try {
            const jsonStr = JSON.stringify(data)
            console.log(
                '[WS Service] 📤 Sending:',
                jsonStr.substring(0, 300) +
                    (jsonStr.length > 300 ? '...' : ''),
            )
            this.ws!.send(jsonStr)
            console.log(
                '[WS Service] ✅ Message sent successfully',
            )
            return true
        } catch (error) {
            console.error(
                '[WS Service] ❌ Send error:',
                error,
            )
            return false
        }
    }

    // Create chat via WebSocket
    createChat(params: {
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
    }): Promise<{
        success: boolean
        chat?: unknown
        error?: string
    }> {
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
                this.connectionState,
            )
            if (!this.isConnected) {
                console.log(
                    '[WS Service] 🔌 Not connected, calling connect()...',
                )
                this.connect()
            }

            const requestUid = crypto.randomUUID()
            console.log(
                '[WS Service] 🔑 Generated request_uid:',
                requestUid,
            )

            // Store callback
            this.createChatCallbacks.set(
                requestUid,
                resolve,
            )

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
            if (this.isConnected) {
                console.log(
                    '[WS Service] ✅ Connected, sending immediately',
                )
                this.send(messageObj)
            } else {
                console.log(
                    '[WS Service] ⏳ Not connected yet, waiting...',
                )
                // Wait for connection then send
                let attempts = 0
                const maxAttempts = 50 // 5 seconds max
                const checkAndSend = () => {
                    attempts++
                    if (this.isConnected) {
                        console.log(
                            '[WS Service] ✅ Connected after',
                            attempts * 100,
                            'ms, sending now',
                        )
                        this.send(messageObj)
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkAndSend, 100)
                    } else {
                        console.error(
                            '[WS Service] ❌ Timeout waiting for connection',
                        )
                        this.createChatCallbacks.delete(
                            requestUid,
                        )
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
                if (
                    this.createChatCallbacks.has(requestUid)
                ) {
                    console.error(
                        '[WS Service] ⏰ Request timeout after 10 seconds, request_uid:',
                        requestUid,
                    )
                    this.createChatCallbacks.delete(
                        requestUid,
                    )
                    resolve({
                        success: false,
                        error: 'WebSocket timeout',
                    })
                }
            }, 10000)
        })
    }

    // Add members to chat via WebSocket
    addMembersToChat(params: {
        chat_key: string
        uid_users_list: string[]
    }): Promise<{
        success: boolean
        result?: {
            chat_key: string
            chat_type: string
            added_users: Array<{
                uid: string
                full_name: string
            }>
        }
        error?: string
    }> {
        console.log(
            '[WS Service] 👥 addMembersToChat() called with:',
            {
                chat_key: params.chat_key,
                uid_users_list: params.uid_users_list,
                userCount: params.uid_users_list.length,
            },
        )

        return new Promise((resolve) => {
            // Ensure connection
            console.log(
                '[WS Service] 📊 Connection state before send:',
                this.connectionState,
            )
            if (!this.isConnected) {
                console.log(
                    '[WS Service] 🔌 Not connected, calling connect()...',
                )
                this.connect()
            }

            const requestUid = crypto.randomUUID()
            console.log(
                '[WS Service] 🔑 Generated request_uid:',
                requestUid,
            )

            // Store callback
            this.addMembersCallbacks.set(
                requestUid,
                resolve,
            )

            // Prepare message
            const messageObj = {
                action: 'add_members_to_chat',
                request_uid: requestUid,
                object: {
                    chat_key: params.chat_key,
                    uid_users_list: params.uid_users_list,
                },
            }

            console.log(
                '[WS Service] 📦 Prepared message object:',
                messageObj,
            )

            // Try to send immediately if connected
            if (this.isConnected) {
                console.log(
                    '[WS Service] ✅ Connected, sending immediately',
                )
                this.send(messageObj)
            } else {
                console.log(
                    '[WS Service] ⏳ Not connected yet, waiting...',
                )
                // Wait for connection then send
                let attempts = 0
                const maxAttempts = 50 // 5 seconds max
                const checkAndSend = () => {
                    attempts++
                    if (this.isConnected) {
                        console.log(
                            '[WS Service] ✅ Connected after',
                            attempts * 100,
                            'ms, sending now',
                        )
                        this.send(messageObj)
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkAndSend, 100)
                    } else {
                        console.error(
                            '[WS Service] ❌ Timeout waiting for connection',
                        )
                        this.addMembersCallbacks.delete(
                            requestUid,
                        )
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
                if (
                    this.addMembersCallbacks.has(requestUid)
                ) {
                    console.error(
                        '[WS Service] ⏰ Request timeout after 10 seconds, request_uid:',
                        requestUid,
                    )
                    this.addMembersCallbacks.delete(
                        requestUid,
                    )
                    resolve({
                        success: false,
                        error: 'WebSocket timeout',
                    })
                }
            }, 10000)
        })
    }
}

// Export singleton instance
export const wsChatService = new WebSocketChatService()

// Auto-connect when in browser environment - only if token exists
if (typeof window !== 'undefined') {
    console.log(
        '[WS Service] 🌐 Browser environment detected',
    )
    // Check for token before auto-connecting
    const checkAndConnect = () => {
        const token = Cookies.get('access_token')
        if (token) {
            console.log(
                '[WS Service] 🚀 Token found, auto-connecting...',
            )
            wsChatService.connect()
        } else {
            console.log(
                '[WS Service] ⏳ No token yet, skipping auto-connect',
            )
        }
    }
    // Small delay to ensure cookies are loaded
    setTimeout(checkAndConnect, 500)
}
