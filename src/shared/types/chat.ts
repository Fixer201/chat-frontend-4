import { ChatType } from './chat'

import { AvatarProps } from '@shared/ui/avatar/Avatar'
//для хранения настроек чата в Redux
export interface ChatSettings {
    isFavorite: boolean
    isChatRead: boolean
    notificationsEnabled: boolean
    isDeleted: boolean
    originalUnreadCount: number
}
// варианты представления аватара пользователя
export type ChatAvatar = {
    avatarWebpUrl?: string | null
    avatarUrl?: string | null
    avatarWebp?: string | null
    avatar?: string | null
}

// Тип для UI - все поля camelCase, все вложено в один интерфейс
export interface ChatItem {
    id: number
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
    isFavorite: boolean
    notifications: boolean
    newMessageCount: number
    newFileCount: number
    name: string
    chatType:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    chatKey: string
    lastActivityAt: number
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
        filesSummary: {
            types: string[]
            count: number
        }
        hasRepliedMessage: boolean
        hasForwardedMessage: boolean
        new: boolean
        createdAt: number
        updatedAt: number
    }
    settings?: ChatSettings
}

// Тип для состояния Redux
export interface ChatsState {
    items: ChatItem[]
    loading: boolean
    error: string | null
    selectedChatId: number | null
    chatSettings: Record<string, ChatSettings>
}

// Тип для API данных (snake_case)
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
    is_favorite: boolean
    notifications: boolean
    new_message_count: number
    new_file_count: number
    name: string
    chat_type:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    chat_key: string
    last_activity_at: number
    last_seen_message: {
        id: number
        uid: string
    }
    first_new_message: {
        id: number
        uid: string
    }
    last_message: {
        id: number
        uid: string
        from_user: string
        content: string
        files_summary: {
            types: string[]
            count: number
        }
        has_replied_message: boolean
        has_forwarded_message: boolean
        new: boolean
        created_at: number
        updated_at: number
    }
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
}

// Тип для моковых данных (частичный)
export type MockChatData = Partial<ApiChatItem>[]
