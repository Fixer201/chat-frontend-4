import { getContactWebStatus } from '@shared/lib/getContactWebStatus'
import { Contact } from '@shared/types/contact'

export const getStatusText = (
    contact: Contact,
    searchValue: string,
) => {
    const lowerSearch = searchValue.toLowerCase()
    if (
        lowerSearch &&
        contact.phone?.toLowerCase().includes(lowerSearch)
    ) {
        return contact.phone
    } else if (
        lowerSearch &&
        contact.nickname
            ?.toLowerCase()
            .includes(lowerSearch)
    ) {
        return contact.nickname
    } else {
        return getContactWebStatus(
            contact.isOnline,
            contact.wasOnlineAt,
        )
    }
}
