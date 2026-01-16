import { Message } from '@shared/types/message'
import { ReactNode } from 'react'

export type ConnectionStatus =
    | 'CONNECTING'
    | 'OPEN'
    | 'CLOSED'
    | 'ERROR'

export type WebSocketContextType = {
    sendMessage: (message: Message) => void
    messages: Message[]
    status: ConnectionStatus
    error: string | null
}

export type WebSocketProviderProps = {
    children: ReactNode
}
