'use client'

import React, { useState, useCallback } from 'react'
import type { GroupParticipant } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'
import Dropdown from '@shared/ui/dropdown/Dropdown'

interface ContactItemProps {
    contact: GroupParticipant
    selectedUid: string | null
    searchValue: string
    onSetSelectedContact: (uid: string) => void
    onDelete?: (contact: GroupParticipant) => void
    canDelete?: boolean
    onTransferOwnership?: () => void // <-- новый
    canTransferOwnership?: boolean // <-- новый
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
    onTransferOwnership,
    canTransferOwnership,
}) => {
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ x: 0, y: 0 })

    // Для GroupParticipant вычисляем статус
    const secondaryText = getStatusText(
        contact,
        searchValue,
    )

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            if (!onDelete || !canDelete || contact.isOwner)
                return
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
    const handleTransferOwnership = useCallback(() => {
        onTransferOwnership?.()
        setContextMenuOpen(false)
    }, [onTransferOwnership])
    return (
        <div
            className={STYLES.container}
            onContextMenu={handleContextMenu}
        >
            <div className={STYLES.divider} />
            <div className={STYLES.avatarWrapper}>
                <ContactAvatar
                    src={
                        contact.avatarUrl
                            ? `/images/contacts/${contact.avatarUrl}`
                            : ''
                    }
                    name={
                        `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
                        'Участник'
                    }
                    mode="contact"
                    isOnline={contact.isOnline}
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
                    {/* Пункт передачи прав, если разрешено */}
                    {canTransferOwnership &&
                        onTransferOwnership &&
                        !(
                            'isOwner' in contact &&
                            contact.isOwner
                        ) && (
                            <Dropdown.Item
                                onSelect={
                                    handleTransferOwnership
                                }
                                // Можно добавить иконку, например, crown
                            >
                                Передать права владельца
                            </Dropdown.Item>
                        )}

                    {/* Пункт удаления */}
                    {canDelete &&
                        onDelete &&
                        !(
                            'isOwner' in contact &&
                            contact.isOwner
                        ) && (
                            <Dropdown.Item
                                danger
                                onSelect={handleDelete}
                            >
                                Удалить
                            </Dropdown.Item>
                        )}
                </Dropdown.Content>
            </Dropdown>
        </div>
    )
}
