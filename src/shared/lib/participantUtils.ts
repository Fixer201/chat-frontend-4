// utils/participantUtils.ts
import {
    ApiGroupParticipant,
    GroupParticipant,
    Contact,
} from '../types/contact'

// Функция преобразования API участника в GroupParticipant
export const apiParticipantToContact = (
    apiParticipant: ApiGroupParticipant,
): GroupParticipant => {
    return {
        uid: apiParticipant.uid,
        firstName: apiParticipant.first_name,
        lastName: apiParticipant.last_name,
        avatarUrl: apiParticipant.avatar_url,
        avatarWebpUrl: apiParticipant.avatar_webp_url,
        isOnline: apiParticipant.is_online,
        wasOnlineAt: apiParticipant.was_online_at,
        isOwner: apiParticipant.is_owner,
        isBlocked: apiParticipant.is_blocked,
        isInContacts: apiParticipant.is_in_contacts,
    }
}

// Функция для преобразования массива участников
export const transformParticipants = (
    apiParticipants: ApiGroupParticipant[],
): GroupParticipant[] => {
    return apiParticipants.map(apiParticipantToContact)
}

// Функция для разделения участников на владельца и остальных
export const separateOwnerAndParticipants = (
    participants: GroupParticipant[],
): {
    owner: GroupParticipant | null
    participants: GroupParticipant[]
} => {
    const owner =
        participants.find((p) => p.isOwner) || null
    const regularParticipants = participants.filter(
        (p) => !p.isOwner,
    )

    return {
        owner,
        participants: regularParticipants,
    }
}

//  Преобразование Contact в GroupParticipant
export const contactToGroupParticipant = (
    contact: Contact,
    isOwner: boolean = false,
): GroupParticipant => {
    return {
        uid: contact.uid,
        firstName: contact.firstName,
        lastName: contact.lastName,
        avatarUrl: contact.avatarUrl,
        avatarWebpUrl: contact.avatarWebpUrl,
        isOnline: contact.isOnline,
        wasOnlineAt: contact.wasOnlineAt,
        isOwner,
        isBlocked: false,
        isInContacts: true, // раз мы их выбрали из контактов, они в контактах
    }
}
//  Преобразование массива Contact в массив GroupParticipant
export const contactsToGroupParticipants = (
    contacts: Contact[],
): GroupParticipant[] => {
    return contacts.map((contact) =>
        contactToGroupParticipant(contact),
    )
}
