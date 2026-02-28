// WebSocket Chat Service - can be used by both React hooks and Redux thunks
import {
    CreateChatCallback,
    AddMembersCallback,
    DeleteChatCallback,
    createChatMethod,
    addMembersMethod,
    deleteChatMethod,
    parseAndRouteMessage,
    createSender,
    ConnectionManager,
    CallbackMaps,
    CreateChatParams,
    CreateChatResult,
    AddMembersParams,
    AddMembersResult,
    DeleteChatParams,
    DeleteChatResult,
} from './wsMethods'

// WebSocket service class
class WebSocketChatService {
    private conn = new ConnectionManager()

    // Callback maps for each action type
    private callbacks: CallbackMaps = {
        createChat: new Map<string, CreateChatCallback>(),
        addMembers: new Map<string, AddMembersCallback>(),
        deleteChat: new Map<string, DeleteChatCallback>(),
    }

    // Getters
    get isConnected(): boolean {
        return this.conn.isConnected
    }
    get connectionState(): string {
        return this.conn.connectionState
    }

    // Connect to WebSocket
    connect(): void {
        this.conn.connect(
            {
                url: '',
                onOpen: () => {
                    this.log(
                        '✅',
                        'Connected successfully!',
                    )
                    this.log(
                        '📊',
                        'State:',
                        this.connectionState,
                    )
                },
                onClose: (event) => {
                    this.log('🔴', 'Disconnected', {
                        code: event.code,
                        reason:
                            event.reason ||
                            '(no reason provided)',
                        wasClean: event.wasClean,
                    })
                    if (
                        !event.wasClean &&
                        event.code !== 1000
                    ) {
                        this.conn.attemptReconnect(
                            () => this.connect(),
                            this.log.bind(this),
                            this.error.bind(this),
                        )
                    }
                },
                onError: (error) =>
                    this.error('❌', 'Error:', error),
                onMessage: (event) => {
                    this.log(
                        '📨',
                        'Message received:',
                        event.data.substring(0, 200) +
                            '...',
                    )
                    parseAndRouteMessage(
                        event.data,
                        this.callbacks,
                        this.log.bind(this),
                        this.error.bind(this),
                    )
                },
            },
            this.log.bind(this),
            this.error.bind(this),
        )
    }

    // Disconnect
    disconnect(): void {
        this.conn.disconnect()
    }

    // Reset reconnect counter
    resetReconnect(): void {
        this.conn.resetReconnect()
    }

    // Send message through WebSocket
    send(data: unknown): boolean {
        return createSender(
            this.conn.getSocket(),
            () => this.isConnected,
            () => this.connectionState,
            this.log.bind(this),
            this.error.bind(this),
        )(data)
    }

    // Create chat via WebSocket
    createChat(
        params: CreateChatParams,
    ): Promise<CreateChatResult> {
        return createChatMethod(
            this.conn.getSocket(),
            this.isConnected,
            this.connectionState,
            this.callbacks.createChat,
            (data) => this.send(data),
            () => this.connect(),
        )(params)
    }

    // Add members to chat via WebSocket
    addMembersToChat(
        params: AddMembersParams,
    ): Promise<AddMembersResult> {
        return addMembersMethod(
            this.conn.getSocket(),
            this.isConnected,
            this.connectionState,
            this.callbacks.addMembers,
            (data) => this.send(data),
            () => this.connect(),
        )(params)
    }

    // Delete chat via WebSocket
    deleteChat(
        params: DeleteChatParams,
    ): Promise<DeleteChatResult> {
        return deleteChatMethod(
            this.conn.getSocket(),
            this.isConnected,
            this.connectionState,
            this.callbacks.deleteChat,
            (data) => this.send(data),
            () => this.connect(),
        )(params)
    }

    // Logging helpers
    private log(emoji: string, ...args: unknown[]): void {
        console.log(`[WS Service] ${emoji}`, ...args)
    }

    private error(emoji: string, ...args: unknown[]): void {
        console.error(`[WS Service] ${emoji}`, ...args)
    }
}

// Export singleton instance
export const wsChatService = new WebSocketChatService()

// Auto-connect when in browser environment
if (typeof window !== 'undefined') {
    console.log(
        '[WS Service] 🌐',
        'Browser environment detected',
    )
    setTimeout(() => {
        const token = document.cookie.match(
            /access_token=([^;]+)/,
        )?.[1]
        if (token) {
            console.log(
                '[WS Service] 🚀',
                'Token found, auto-connecting...',
            )
            wsChatService.connect()
        } else {
            console.log(
                '[WS Service] ⏳',
                'No token yet, skipping auto-connect',
            )
        }
    }, 500)
}
