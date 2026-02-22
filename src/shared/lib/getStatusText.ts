import { getContactWebStatus } from '@shared/lib/getContactWebStatus'
import { Contact } from '@shared/types/contact'

export const getStatusText = (
    contact: Contact,
    searchValue: string,
) => {
    const lowerSearch = searchValue.toLowerCase()
    // console.log('getStatusText:', {
    //     searchValue,
    //     lowerSearch,
    //     phone: contact.phone,
    //     nickname: contact.nickname,
    //     isOnline: contact.isOnline,
    //     wasOnlineAt: contact.wasOnlineAt,
    // })

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
        // console.log(
        //     'Status from getContactWebStatus:',
        //     status,
        // )
        return status
    }
}
