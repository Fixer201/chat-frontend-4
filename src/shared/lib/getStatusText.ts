import { Contact } from '@shared/types/contact'
import { getContactWebStatus } from './getContactWebStatus'

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
        const status = getContactWebStatus(
            contact.isOnline,
            contact.wasOnlineAt,
        )

        return status
    }
}
