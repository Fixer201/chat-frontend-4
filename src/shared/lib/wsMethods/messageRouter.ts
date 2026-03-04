// Message Router - routes incoming WebSocket messages to appropriate handlers
import {
    handleCreateChatResponse,
    handleAddMembersResponse,
    handleDeleteChatResponse,
    handleEditChatResponse,
    handleLeaveChatResponse,
    handleTransferOwnerResponse,
} from './messageHandlers'
import {
    WsResponse,
    CreateChatCallback,
    AddMembersCallback,
    DeleteChatCallback,
    EditChatCallback,
    LeaveChatCallback,
    TransferOwnerCallback,
} from './types'

export interface CallbackMaps {
    createChat: Map<string, CreateChatCallback>
    addMembers: Map<string, AddMembersCallback>
    deleteChat: Map<string, DeleteChatCallback>
    editChat: Map<string, EditChatCallback>
    leaveChat: Map<string, LeaveChatCallback>
    transferOwner: Map<string, TransferOwnerCallback>
}

export function routeMessage(
    parsed: WsResponse,
    callbacks: CallbackMaps,
    logFn: (emoji: string, ...args: unknown[]) => void,
): void {
    const handlers: Record<string, () => void> = {
        create_chat: () =>
            handleCreateChatResponse(
                parsed,
                callbacks.createChat,
            ),
        add_members_to_chat: () =>
            handleAddMembersResponse(
                parsed,
                callbacks.addMembers,
            ),
        delete_chat: () =>
            handleDeleteChatResponse(
                parsed,
                callbacks.deleteChat,
            ),
        edit_chat: () =>
            handleEditChatResponse(
                parsed,
                callbacks.editChat,
            ),
        leave_chat: () =>
            handleLeaveChatResponse(
                parsed,
                callbacks.leaveChat,
            ),
        transfer_owner: () =>
            handleTransferOwnerResponse(
                parsed,
                callbacks.transferOwner,
            ),
    }

    const handler = handlers[parsed.action]
    if (handler) {
        handler()
    } else {
        logFn('ℹ️', 'Unhandled action:', parsed.action)
    }
}

export function parseAndRouteMessage(
    data: string,
    callbacks: CallbackMaps,
    logFn: (emoji: string, ...args: unknown[]) => void,
    errorFn: (emoji: string, ...args: unknown[]) => void,
): void {
    try {
        const parsed: WsResponse = JSON.parse(data)
        logFn('📥', 'Parsed message:', {
            action: parsed.action,
            status: parsed.status,
            error: parsed.error,
            request_uid: parsed.request_uid,
            hasObject: !!parsed.object,
        })

        routeMessage(parsed, callbacks, logFn)
    } catch (error) {
        errorFn('❌', 'Error parsing message:', error)
    }
}
