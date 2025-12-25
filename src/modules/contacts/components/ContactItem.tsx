'use client'
import React from 'react'

import { getStatusText } from '@shared/lib/getStatusText'
import { Contact } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'


interface ContactItemProps {
    contact: Contact
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact: (uid: string) => void
    onSetSelectedContact: (uid: string) => void
}

export const ContactItem: React.FC<
    ContactItemProps
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
            <ContactAvatar
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
