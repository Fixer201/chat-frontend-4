'use client'

import React, { useState, useCallback } from 'react'
import type { Contact } from '@shared/types/contact'
import type { Participant } from '@shared/types/chat'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'
import Dropdown from '@shared/ui/dropdown/Dropdown'

interface ContactItemProps {
    contact: Contact | Participant
    selectedUid: string | null
    searchValue: string
    onSetSelectedContact: (uid: string) => void
    onDelete?: (contact: Contact | Participant) => void
    canDelete?: boolean
}

const STYLES = {
    container: `
        relative w-full px-2 py-1 transition-all duration-200
        hover:bg-gray-50 cursor-context-menu
    `,
    divider: `
        absolute right-4 bottom-0 left-(--chat-list-divider-left) 
        h-px bg-(--color-black-alpha-20)
    `,
    avatarWrapper: 'flex-1 min-w-0',
} as const

export const ContactItemGroup: React.FC<
    ContactItemProps
> = ({
    contact,
    selectedUid,
    searchValue,
    onSetSelectedContact,
    onDelete,
    canDelete = false,
}) => {
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ x: 0, y: 0 })

    // Вычисляем статус только для Contact
    const secondaryText =
        'isOnline' in contact && 'wasOnlineAt' in contact
            ? getStatusText(contact as Contact, searchValue)
            : ''

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            const isOwner =
                'isOwner' in contact && contact.isOwner
            if (!onDelete || !canDelete || isOwner) return

            setContextMenuPosition({
                x: e.clientX,
                y: e.clientY,
            })
            setContextMenuOpen(true)
        },
        [contact, onDelete, canDelete],
    )

    const handleDelete = useCallback(() => {
        onDelete?.(contact)
        setContextMenuOpen(false)
    }, [onDelete, contact])

    return (
        <div
            className={STYLES.container}
            onContextMenu={handleContextMenu}
        >
            <div className={STYLES.divider} />
            <div className={STYLES.avatarWrapper}>
                <ContactAvatar
                    src={
                        'avatarUrl' in contact &&
                        contact.avatarUrl
                            ? `/images/contacts/${contact.avatarUrl}`
                            : ''
                    }
                    name={
                        'firstName' in contact &&
                        'lastName' in contact
                            ? `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim()
                            : 'Участник'
                    }
                    mode="contact"
                    isOnline={
                        'isOnline' in contact
                            ? contact.isOnline
                            : false
                    }
                    statusText={secondaryText}
                    onClick={() =>
                        onSetSelectedContact(contact.uid)
                    }
                    selected={contact.uid === selectedUid}
                />
            </div>

            <Dropdown
                open={contextMenuOpen}
                onOpenChange={setContextMenuOpen}
                closeOnSelect
            >
                <Dropdown.Content
                    manualPosition={{
                        left: contextMenuPosition.x,
                        top: contextMenuPosition.y,
                    }}
                    width="auto"
                    minWidth={150}
                    maxWidth={250}
                >
                    <Dropdown.Item
                        danger
                        onSelect={handleDelete}
                    >
                        Удалить
                    </Dropdown.Item>
                </Dropdown.Content>
            </Dropdown>
        </div>
    )
}
