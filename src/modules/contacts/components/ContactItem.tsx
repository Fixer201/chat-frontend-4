'use client'
import React, { useEffect, useState } from 'react'
import { Contact } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getContactWebStatus } from '@shared/lib/getContactWebStatus'

interface ContactItemProps {
    contact: Contact
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact: (uid: string) => void
    onSetSelectedContact: (uid: string) => void
}

export const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    deleteMode,
    selectedUid,
    selectedContacts,
    onSelectContact,
    onSetSelectedContact,
}) => {
    const [statusText, setStatusText] = useState('')
    useEffect(() => {
        // Вычисляем статус на клиенте после гидрации для избежания mismatch.
        // getContactWebStatus() использует new Date() для расчета относительного времени,
        // поэтому значение будет разным на сервере (SSR) и клиенте.
        // useEffect гарантирует, что вычисление происходит ТОЛЬКО после гидрации.
        // https://nextjs.org/docs/messages/react-hydration-error
        const status = getContactWebStatus(
            contact.isOnline,
            contact.wasOnlineAt,
        )
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatusText(status)
    }, [contact.isOnline, contact.wasOnlineAt])

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
