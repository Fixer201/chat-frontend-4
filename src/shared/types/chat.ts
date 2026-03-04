// @shared/types/chat.ts

//import { ChatType } from './chat'

import { AvatarProps } from '@shared/ui/avatar/Avatar'

export interface ChatSettings {
    isFavorite: boolean
    isChatRead: boolean
    notificationsEnabled: boolean
    isDeleted: boolean
    originalUnreadCount: number
}

export type ChatAvatar = {
    avatarWebpUrl?: string | null
    avatarUrl?: string | null
    avatarWebp?: string | null
    avatar?: string | null
}

export interface FileInfo {
    id: number
    uid: string
    file: string
    fileUrl: string
    fileWebp: string
    fileWebpUrl: string
    fileType: string
    new: boolean
    createdAt: number
    updatedAt: number
}

export interface Participant {
    uid: string
    fullName: string
}

// Полный UI тип для чатов с API полями
export interface ChatItem {
    id: number
    isTemporary?: boolean
    tempContactUid?: string
    chat: {
        uid: string
        username: string
        nickname: string
        firstName: string
        lastName: string
        avatar: string
        avatarUrl: string
        avatarWebp: string
        avatarWebpUrl: string
        isBlocked: boolean
        isOnline: boolean
        wasOnlineAt: number
        isInContacts: boolean
    }
    isActive: boolean
    isFavorite: boolean
    notifications: boolean
    index: number
    messageCount: number
    fileCount: number
    newMessageCount: number
    name: string
    chatType:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    chatKey: string
    description?: string
    createdBy?: string
    ownerFullName?: string
    participants?: Participant[]
    createdAt: string
    updatedAt: string
    lastSeenMessage: {
        id: number
        uid: string
    }
    firstNewMessage: {
        id: number
        uid: string
    }
    lastMessage: {
        id: number
        uid: string
        fromUser: string
        content: string
        filesList?: FileInfo[]
        filesSummary: {
            types: string[]
            count: number
        }
        hasRepliedMessage: boolean
        hasForwardedMessage: boolean
        repliedMessages?: number[]
        forwardedMessages?: number[]
        new: boolean
        createdAt: number
        updatedAt: number
    }
    settings?: ChatSettings
    // contactUid?: string
}

// Тип для состояния Redux
export interface ChatsState {
    items: ChatItem[]
    loading: boolean
    error: string | null
    selectedChatId: number | null
    chatSettings: Record<string, ChatSettings>
}

// Полный API тип (snake_case)
export interface ApiChatItem {
    id: number
    chat: {
        uid: string
        username: string
        nickname: string
        first_name: string
        last_name: string
        avatar: string
        avatar_url: string
        avatar_webp: string
        avatar_webp_url: string
        is_blocked: boolean
        is_online: boolean
        was_online_at: number
        is_in_contacts: boolean
    }
    is_active: boolean
    is_favorite: boolean
    notifications: boolean
    index: number
    message_count: number
    file_count: number
    new_file_count: number
    new_message_count: number
    last_message: {
        id: number
        uid: string
        from_user: string
        content: string
        files_list?: FileInfoApi[]
        files_summary: {
            types: string[]
            count: number
        }
        has_replied_message: boolean
        has_forwarded_message: boolean
        replied_messages?: number[]
        forwarded_messages?: number[]
        new: boolean
        created_at: number
        updated_at: number
    }
    last_seen_message: {
        id: number
        uid: string
    }
    first_new_message: {
        id: number
        uid: string
    }
    name: string
    chat_type:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    chat_key: string
    description?: string
    created_by?: string
    owner_full_name?: string
    participants?: ParticipantApi[]
    created_at: string
    updated_at: string
    last_activity_at: number
}

// API типы для вложенных объектов
export interface FileInfoApi {
    id: number
    uid: string
    file: string
    file_url: string
    file_webp: string
    file_webp_url: string
    file_type: string
    new: boolean
    created_at: number
    updated_at: number
}

export interface ParticipantApi {
    uid: string
    full_name: string
}

export interface ChatListItemProps extends Omit<
    AvatarProps,
    'mode' | 'className'
> {
    selected?: boolean
    messageStatus?: 'sent' | 'delivered' | 'read' | null
    notificationsEnabled: boolean
    chatType:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    onDeleteChat?: () => void
    onFavoriteChat?: () => void
    onMuteChat?: () => void
    onMarkAsRead?: () => void
    onMarkAsUnread?: () => void
    isFavorite?: boolean
    isChatRead?: boolean
    onAddToContacts?: () => void
    isInContacts?: boolean
    onOpenInfoPanel?: () => void
}
