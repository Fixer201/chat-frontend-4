// WebSocket Sender - handles sending messages with logging
export function createSender(
    ws: WebSocket | null,
    isConnected: () => boolean,
    connectionState: () => string,
    logFn: (emoji: string, ...args: unknown[]) => void,
    errorFn: (emoji: string, ...args: unknown[]) => void,
): (data: unknown) => boolean {
    return function send(data: unknown): boolean {
        logFn(
            '📤',
            'Sending message, connected:',
            isConnected(),
            'state:',
            connectionState(),
        )

        if (!isConnected()) {
            errorFn('❌', 'Not connected, cannot send')
            return false
        }

        try {
            const jsonStr = JSON.stringify(data)
            logFn(
                '📤',
                'Sending:',
                jsonStr.substring(0, 300) +
                    (jsonStr.length > 300 ? '...' : ''),
            )
            ws!.send(jsonStr)
            logFn('✅', 'Message sent successfully')
            return true
        } catch (error) {
            errorFn('❌', 'Send error:', error)
            return false
        }
    }
}
