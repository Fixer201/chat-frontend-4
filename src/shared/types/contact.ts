// Участник группы (frontend-тип)
export interface GroupParticipant {
    uid: string
    firstName?: string
    lastName?: string
    avatarUrl?: string | null
    avatarWebpUrl?: string | null
    isOnline: boolean
    wasOnlineAt: number | string | Date | null
    isOwner?: boolean
    isBlocked?: boolean
    isInContacts?: boolean
}

// Участник группы (API-тип)
export interface ApiGroupParticipant {
    uid: string
    first_name?: string
    last_name?: string
    avatar_url?: string | null
    avatar_webp_url?: string | null
    is_online: boolean
    was_online_at: number | string | Date | null
    is_owner?: boolean
    is_blocked?: boolean
    is_in_contacts?: boolean
}

export interface Contact {
    uid: string
    userUid: string
    username?: string | ''
    nickname?: string | ''
    phone?: string
    firstName?: string
    lastName?: string
    patronymic?: string
    avatar?: string | null
    avatarUrl?: string | null
    avatarWebp?: string | null
    avatarWebpUrl?: string | null
    additionalInformation?: string
    birthday?: number
    chatId?: number
    isOnline: boolean
    wasOnlineAt: number | string | Date | null
}

export interface ApiContact {
    uid: string
    // UID владельца контакта (user uid). Может отсутствовать в некоторых ответах.
    owner_user?: string
    // Системные данные контакта (онлайн/аватар и т.п.).
    system_contact: {
        uid: string
        avatar: string | null
        avatar_url: string | null
        avatar_webp: string | null
        avatar_webp_url: string | null
        is_online: boolean
        was_online_at: number // Timestamp в секундах
    }
    first_name: string
    last_name: string
    phone: string
    // Поля, приходящие в ответах чёрного списка / поиска (опционально).
    nickname?: string | null
    avatar?: string | null
    avatar_url?: string | null
    avatar_webp?: string | null
    avatar_webp_url?: string | null
    is_online?: boolean
    was_online_at?: number | string | Date | null
}

export interface ApiAddedContact {
    uid: string
    phone: string
    first_name: string
    last_name: string
    avatar: string | null
    avatar_url: string | null
    avatar_webp: string | null
    avatar_webp_url: string | null
    is_online: boolean
    was_online_at: number // Timestamp в секундах
}
