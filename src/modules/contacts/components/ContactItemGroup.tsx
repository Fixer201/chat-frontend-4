// src/modules/contacts/components/ContactItemGroup.tsx
'use client'

import React, {
    useEffect,
    useState,
    useCallback,
} from 'react'
import {
    Contact,
    GroupParticipant,
} from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'
import Dropdown from '@shared/ui/dropdown/Dropdown'

interface ContactItemProps {
    contact: Contact | GroupParticipant
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact: (uid: string) => void
    onSetSelectedContact: (uid: string) => void
    onDelete?: (contact: Contact | GroupParticipant) => void
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
    deleteMode,
    selectedUid,
    selectedContacts,
    searchValue,
    onSelectContact,
    onSetSelectedContact,
    onDelete,
}) => {
    const [secondaryText, setSecondaryText] = useState('')
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ x: 0, y: 0 })

    useEffect(() => {
        const text = getStatusText(contact, searchValue)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondaryText(text)
    }, [contact, searchValue])

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            // Проверяем, является ли контакт владельцем (только для GroupParticipant)
            const isOwner =
                'isOwner' in contact && contact.isOwner
            if (deleteMode || isOwner || !onDelete) return
            setContextMenuPosition({
                x: e.clientX,
                y: e.clientY,
            })
            setContextMenuOpen(true)
        },
        [deleteMode, contact, onDelete],
    )

    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(contact)
        }
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
                    src={`/images/contacts/${contact?.avatarUrl}`}
                    name={`${contact.firstName} ${contact.lastName}`}
                    mode={
                        deleteMode
                            ? 'select-contact'
                            : 'contact'
                    }
                    isOnline={contact.isOnline}
                    statusText={secondaryText}
                    onClick={() =>
                        deleteMode
                            ? onSelectContact(contact.uid)
                            : onSetSelectedContact(
                                  contact.uid,
                              )
                    }
                    selected={
                        deleteMode
                            ? selectedContacts.includes(
                                  contact.uid,
                              )
                            : contact.uid === selectedUid
                    }
                    onSelect={
                        deleteMode
                            ? () =>
                                  onSelectContact(
                                      contact.uid,
                                  )
                            : undefined
                    }
                    isSelected={
                        deleteMode
                            ? selectedContacts.includes(
                                  contact.uid,
                              )
                            : false
                    }
                />
            </div>

            {/* Контекстное меню */}
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
