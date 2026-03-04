// WebSocket Message Handlers
import {
    CreateChatCallback,
    AddMembersCallback,
    DeleteChatCallback,
    EditChatCallback,
    LeaveChatCallback,
    WsResponse,
    TransferOwnerCallback,
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

export function handleEditChatResponse(
    parsed: WsResponse,
    callbacks: Map<string, EditChatCallback>,
): void {
    console.log(
        '[WS Service] ✏️ edit_chat response received',
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
                    '[WS Service] ✅ Chat edited successfully:',
                    parsed.object,
                )
                callback({
                    success: true,
                    chat: parsed.object as {
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
                    },
                })
            } else {
                console.error(
                    '[WS Service] ❌ Edit chat failed:',
                    parsed.error,
                )
                callback({
                    success: false,
                    error:
                        parsed.error ||
                        'Failed to edit chat',
                })
            }
            callbacks.delete(requestUid)
        }
    }
}

export function handleLeaveChatResponse(
    parsed: WsResponse,
    callbacks: Map<string, LeaveChatCallback>,
): void {
    console.log(
        '[WS Service] 🚪 leave_chat response received',
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
                    '[WS Service] ✅ Left chat successfully:',
                    parsed.object,
                )
                const obj = parsed.object as {
                    chat_key: string
                    chat_type: string
                    left_user: {
                        uid: string
                        full_name: string
                    }
                }
                callback({
                    success: true,
                    chatKey: obj.chat_key,
                    chatType: obj.chat_type,
                    leftUser: {
                        uid: obj.left_user.uid,
                        fullName: obj.left_user.full_name,
                    },
                })
            } else {
                console.error(
                    '[WS Service] ❌ Leave chat failed:',
                    parsed.error,
                )
                callback({
                    success: false,
                    error:
                        parsed.error ||
                        'Failed to leave chat',
                })
            }
            callbacks.delete(requestUid)
        }
    }
}

export function handleTransferOwnerResponse(
    parsed: WsResponse,
    callbacks: Map<string, TransferOwnerCallback>,
): void {
    console.log(
        '[WS Service] 👑 transfer_owner response received',
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
                    '[WS Service] ✅ Transfer owner successful:',
                    parsed.object,
                )
                callback({
                    success: true,
                    result: parsed.object as {
                        chat_key: string
                        chat_type: string
                        new_owner: {
                            uid: string
                            full_name: string
                        }
                    },
                })
            } else {
                console.error(
                    '[WS Service] ❌ Transfer owner failed:',
                    parsed.error,
                )
                callback({
                    success: false,
                    error:
                        parsed.error ||
                        'Failed to transfer ownership',
                })
            }
            callbacks.delete(requestUid)
        }
    }
}
