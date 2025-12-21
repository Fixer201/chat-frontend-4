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
    wasOnlineAt: number
}