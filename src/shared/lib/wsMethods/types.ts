// WebSocket Method Types

export type CreateChatCallback = (response: {
    success: boolean
    chat?: unknown
    error?: string
}) => void

export type AddMembersCallback = (response: {
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

export type DeleteChatCallback = (response: {
    success: boolean
    result?: {
        chat_key: string
        chat_type: string
    }
    error?: string
}) => void

// Generic WebSocket response parser
export interface WsResponse {
    action: string
    request_uid?: string
    status?: 'OK' | 'error'
    error?: string
    object?: unknown
}
