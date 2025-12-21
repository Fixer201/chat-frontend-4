import React from 'react'
import { Avatar } from '@shared/ui/avatar/Avatar'
import { getStatusText } from '@shared/lib/getStatusText'
import { Contact } from '@shared/types/contact'

interface ContactAvatarProps {
    contact: Contact
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact: (uid: string) => void
    onSetSelectedContact: (uid: string) => void
}

export const ContactAvatar: React.FC<
    ContactAvatarProps
> = ({
    contact,
    deleteMode,
    selectedUid,
    selectedContacts,
    searchValue,
    onSelectContact,
    onSetSelectedContact,
}) => {
    const statusText = getStatusText(contact, searchValue)

    return (
        <Avatar
            src={`/images/contacts/${contact?.avatarUrl}`}
            name={`${contact.firstName} ${contact.lastName}`}
            mode={deleteMode ? 'select-contact' : 'contact'}
            isOnline={contact.isOnline}
            statusText={statusText}
            onClick={() =>
                !deleteMode &&
                onSetSelectedContact(contact.uid)
            }
            selected={contact.uid === selectedUid}
            onSelect={
                deleteMode
                    ? () => onSelectContact(contact.uid)
                    : undefined
            }
            isSelected={
                deleteMode
                    ? selectedContacts.includes(contact.uid)
                    : false
            }
        />
    )
}
