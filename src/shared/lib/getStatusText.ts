import type {
    Contact,
    GroupParticipant,
} from '@shared/types/contact'
import { getContactWebStatus } from './getContactWebStatus'

export function getStatusText(
    contact: Contact | GroupParticipant,
    searchValue: string,
) {
    const lowerSearch = searchValue.toLowerCase()

    // Для Contact ищем по телефону/нику, для GroupParticipant только статус
    if (
        'phone' in contact &&
        lowerSearch &&
        contact.phone?.toLowerCase().includes(lowerSearch)
    ) {
        return contact.phone
    } else if (
        'nickname' in contact &&
        lowerSearch &&
        contact.nickname
            ?.toLowerCase()
            .includes(lowerSearch)
    ) {
        return contact.nickname
    } else {
        const status = getContactWebStatus(
            contact.isOnline,
            contact.wasOnlineAt,
        )
        return status
    }
}
