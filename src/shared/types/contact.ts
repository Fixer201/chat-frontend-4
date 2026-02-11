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
    owner_user: string
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
