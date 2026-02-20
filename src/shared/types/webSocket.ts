import { Message } from '@shared/types/message'
import { ReactNode } from 'react'

export type ConnectionStatus =
    | 'CONNECTING'
    | 'OPEN'
    | 'CLOSED'
    | 'ERROR'

export type WebSocketContextType = {
    sendMessage: (message: Message) => void
    updateMessage: (params: {
        uid: string
        chatKey: string
        content: string
        status: string
        files?: { filename: string; data: string }[]
    }) => void
    deleteMessage: (params: {
        uid: string
        chatKey: string
        forAll: boolean
    }) => void
    markMessagesRead: (params: {
        chatKey: string
        messageUids: string[]
    }) => void

    messages: Message[]
    status: ConnectionStatus
    error: string | null
}

export type WebSocketProviderProps = {
    children: ReactNode
}
