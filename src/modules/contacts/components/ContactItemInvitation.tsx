'use client'
import React, { useEffect, useState } from 'react'
import { Contact } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'

interface ContactItemInvitationProps {
    contact: Contact
    selectedMode?: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact: (uid: string) => void
    onSetSelectedContact: (uid: string) => void
}

export const ContactItemInvitation: React.FC<
    ContactItemInvitationProps
> = ({
    contact,
    selectedMode = false,
    selectedUid,
    selectedContacts,
    searchValue,
    onSelectContact,
    onSetSelectedContact,
}) => {
    const [secondaryText, setSecondaryText] = useState('')
    useEffect(() => {
        // Вычисляем secondaryText на клиенте после гидрации для избежания mismatch.
        // getStatusText() использует getContactWebStatus(), который зависит от new Date(),
        // поэтому значение будет разным на сервере (SSR) и клиенте.
        // useEffect гарантирует, что вычисление происходит ТОЛЬКО после гидрации.
        const text = getStatusText(contact, searchValue)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondaryText(text)
    }, [contact, searchValue])

    return (
        <ContactAvatar
            src={`/images/contacts/${contact?.avatarUrl}`}
            name={`${contact.firstName} ${contact.lastName}`}
            mode={
                selectedMode ? 'select-contact' : 'contact'
            }
            isOnline={contact.isOnline}
            statusText={secondaryText}
            onClick={() =>
                !selectedMode &&
                onSetSelectedContact(contact.uid)
            }
            selected={contact.uid === selectedUid}
            onSelect={
                selectedMode
                    ? () => onSelectContact(contact.uid)
                    : undefined
            }
            isSelected={
                selectedMode
                    ? selectedContacts.includes(contact.uid)
                    : false
            }
        />
    )
}
