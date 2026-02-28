// WebSocket Message Handlers
import {
    CreateChatCallback,
    AddMembersCallback,
    DeleteChatCallback,
    WsResponse,
} from './types'

export function handleCreateChatResponse(
    parsed: WsResponse,
    callbacks: Map<string, CreateChatCallback>,
): void {
    console.log(
        '[WS Service] 🏠 create_chat response received',
    )
    const requestUid = parsed.request_uid
    if (requestUid) {
        const callback = callbacks.get(requestUid)
        console.log(
            '[WS Service] 🔑 Request UID:',
            requestUid,
            'Has callback:',
            !!callback,
        )
        if (callback) {
            if (parsed.status === 'OK' && parsed.object) {
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
            callbacks.delete(requestUid)
        }
    }
}

export function handleAddMembersResponse(
    parsed: WsResponse,
    callbacks: Map<string, AddMembersCallback>,
): void {
    console.log(
        '[WS Service] 👥 add_members_to_chat response received',
    )
    const requestUid = parsed.request_uid
    if (requestUid) {
        const callback = callbacks.get(requestUid)
        console.log(
            '[WS Service] 🔑 Request UID:',
            requestUid,
            'Has callback:',
            !!callback,
        )
        if (callback) {
            if (parsed.status === 'OK' && parsed.object) {
                console.log(
                    '[WS Service] ✅ Members added successfully:',
                    parsed.object,
                )
                callback({
                    success: true,
                    result: parsed.object as {
                        chat_key: string
                        chat_type: string
                        added_users: Array<{
                            uid: string
                            full_name: string
                        }>
                    },
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
            callbacks.delete(requestUid)
        }
    }
}

export function handleDeleteChatResponse(
    parsed: WsResponse,
    callbacks: Map<string, DeleteChatCallback>,
): void {
    console.log(
        '[WS Service] 🗑️ delete_chat response received',
    )
    const requestUid = parsed.request_uid
    if (requestUid) {
        const callback = callbacks.get(requestUid)
        console.log(
            '[WS Service] 🔑 Request UID:',
            requestUid,
            'Has callback:',
            !!callback,
        )
        if (callback) {
            if (parsed.status === 'OK' && parsed.object) {
                console.log(
                    '[WS Service] ✅ Chat deleted successfully:',
                    parsed.object,
                )
                callback({
                    success: true,
                    result: parsed.object as {
                        chat_key: string
                        chat_type: string
                    },
                })
            } else {
                console.error(
                    '[WS Service] ❌ Delete chat failed:',
                    parsed.error,
                )
                callback({
                    success: false,
                    error:
                        parsed.error ||
                        'Failed to delete chat',
                })
            }
            callbacks.delete(requestUid)
        }
    }
}
