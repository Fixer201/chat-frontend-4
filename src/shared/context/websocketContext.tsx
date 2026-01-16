'use client'

import React, { createContext, useContext } from 'react'
import { useWebSocketChat } from '@shared/hooks/useWebSocketChat'
import {
    WebSocketContextType,
    WebSocketProviderProps,
} from '@shared/types/webSocket'

export const WebSocketContext =
    createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({
    children,
}: WebSocketProviderProps) {
    const ws: WebSocketContextType = useWebSocketChat()

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const context = useContext(WebSocketContext)

    if (!context) {
        throw new Error(
            'useWebSocket must be used within WebSocketProvider',
        )
    }

    return context
}
