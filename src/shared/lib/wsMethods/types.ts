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

export type EditChatCallback = (response: {
    success: boolean
    chat?: {
        created_by: string
        owner_full_name: string
        chat_key: string
        chat_id: string
        name: string
        description: string
        chat_type: string
        avatar?: {
            filename: string
            url: string
        }
        added_users?: Array<{
            uid: string
            full_name: string
        }>
    }
    error?: string
}) => void

export type LeaveChatCallback = (response: {
    success: boolean
    chatKey?: string
    chatType?: string
    leftUser?: {
        uid: string
        fullName: string
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
