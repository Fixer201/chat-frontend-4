'use client'

import { ContactItemGroup } from '@modules/contacts/components/ContactItemGroup'
import ContactsListGroup from '@modules/contacts/components/ContactsListGroup'
import { useState, useEffect } from 'react'
import { Contact } from '@shared/types/contact'
export default function ParticipantsContent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    return (
        <div
            className={`
          transition-opacity duration-200
          ${visible ? `opacity-100` : `opacity-0`}
          bg-gray-main
        `}
        >
            <ContactsListGroup />
        </div>
    )
}
