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

    const handleClick = () => {
        if (selectedMode) {
            onSelectContact(contact.uid)
        } else {
            onSetSelectedContact(contact.uid)
        }
    }

    return (
        <ContactAvatar
            src={`/images/contacts/${contact?.avatarUrl}`}
            name={`${contact.firstName} ${contact.lastName}`}
            mode={
                selectedMode ? 'select-contact' : 'contact'
            }
            isOnline={contact.isOnline}
            statusText={secondaryText}
            onClick={handleClick}
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
            // Для режима select-contact инвертация текста не нужна
            invertTextOnHighlight={!selectedMode}
        />
    )
}
