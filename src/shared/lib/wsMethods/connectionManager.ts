// Connection Manager - handles WebSocket connection lifecycle
import Cookies from 'js-cookie'

const MAX_RECONNECT_ATTEMPTS = 3

export interface ConnectionConfig {
    url: string
    onOpen: () => void
    onClose: (event: CloseEvent) => void
    onError: (error: Event) => void
    onMessage: (event: MessageEvent) => void
}

export class ConnectionManager {
    private ws: WebSocket | null = null
    private reconnectCount = 0
    private reconnectTimer: NodeJS.Timeout | null = null

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    get connectionState(): string {
        if (!this.ws) return 'NO_SOCKET'
        const states = [
            'CONNECTING',
            'OPEN',
            'CLOSING',
            'CLOSED',
        ]
        return states[this.ws.readyState] ?? 'UNKNOWN'
    }

    connect(
        config: ConnectionConfig,
        logFn: (emoji: string, ...args: unknown[]) => void,
        errorFn: (
            emoji: string,
            ...args: unknown[]
        ) => void,
    ): void {
        logFn(
            '🔌',
            'connect() called, current state:',
            this.connectionState,
        )

        if (this.ws?.readyState === WebSocket.OPEN) {
            logFn('✅', 'Already connected, skipping')
            return
        }

        this.reconnectCount = 0

        const token = Cookies.get('access_token')
        if (!token) {
            errorFn('❌', 'No auth token found in cookies')
            errorFn(
                '💡',
                'Make sure you are logged in and have a valid access_token cookie',
            )
            return
        }

        logFn(
            '🔑',
            'Token found (length:',
            token.length,
            ')',
        )
        logFn(
            '🌐',
            'Connecting to: wss://api.test.chat.ktsf.ru/ws/chat?authorization=***',
        )

        try {
            const url = `wss://api.test.chat.ktsf.ru/ws/chat?authorization=${encodeURIComponent(token)}`
            this.ws = new WebSocket(url)

            this.ws.onopen = config.onOpen
            this.ws.onclose = config.onClose
            this.ws.onerror = config.onError
            this.ws.onmessage = config.onMessage
        } catch (error) {
            errorFn('❌', 'Failed to connect:', error)
        }
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.ws?.close()
        this.ws = null
    }

    attemptReconnect(
        connectFn: () => void,
        logFn: (emoji: string, ...args: unknown[]) => void,
        errorFn: (
            emoji: string,
            ...args: unknown[]
        ) => void,
    ): void {
        if (this.reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
            errorFn(
                '❌',
                `Max reconnect attempts reached (${MAX_RECONNECT_ATTEMPTS}). WebSocket will not auto-reconnect.`,
            )
            errorFn(
                '💡',
                'Tip: Check if you have a valid access_token cookie',
            )
            return
        }

        this.reconnectCount++
        logFn(
            '🔄',
            `Scheduling reconnect attempt ${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS} in 3 seconds...`,
        )

        this.reconnectTimer = setTimeout(() => {
            logFn(
                '🔄',
                `Reconnecting... Attempt ${this.reconnectCount}/${MAX_RECONNECT_ATTEMPTS}`,
            )
            connectFn()
        }, 3000)
    }

    resetReconnect(): void {
        this.reconnectCount = 0
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
    }

    getSocket(): WebSocket | null {
        return this.ws
    }
}
