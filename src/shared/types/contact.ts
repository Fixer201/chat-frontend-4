export interface Contact {
    uid: string
    username?: string
    nickname?: string
    phone?: string
    firstName?: string
    lastName?: string
    patronymic?: string
    avatar?: string
    avatarUrl?: string
    avatarWebp?: string
    avatarWebpUrl?: string
    additionalInformation?: string
    birthday?: number
    chatId?: number
    isOnline: boolean
    wasOnlineAt: number | string | Date
}

export interface ApiContact {
    uid: string
    username: string
    nickname: string
    phone: string
    first_name: string
    last_name: string
    patronymic: string
    avatar: string
    avatar_url: string
    avatar_webp: string
    avatar_webp_url: string
    additional_information: string
    birthday: number
    chat_id: number
    is_online: boolean
    was_online_at: number | string | Date
}
// Новый интерфейс для участников группы из API
export interface ApiGroupParticipant {
    uid: string
    first_name: string
    last_name: string
    avatar_url: string
    avatar_webp_url: string
    is_owner: boolean
    is_blocked: boolean
    is_online: boolean
    was_online_at: number | string | Date
    is_in_contacts: boolean
}

// Расширенный интерфейс Contact для участников группы
export interface GroupParticipant extends Contact {
    isOwner: boolean
    isBlocked: boolean
    isInContacts: boolean
}
