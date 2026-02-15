// src/modules/contacts/components/ContactItem.tsx
'use client'
import React, {
    useCallback,
    useEffect,
    useState,
} from 'react'
import { Contact } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'
import { ContactContextMenu } from './ContactContextMenu'

interface ContactItemProps {
    contact: Contact
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    onSelectContact?: (uid: string) => void
    // onSetSelectedContact получает uid, чтобы не привязывать компонент к форме данных.
    onSetSelectedContact: (uid: string) => void
    onContextMenu?: (e: React.MouseEvent) => void
    rightElement?: React.ReactNode
    onBlock?: () => void
}

const STYLES = {
    container:
        'relative px-2 py-1 transition-all duration-200',
    divider:
        'absolute right-4 bottom-0 left-(--chat-list-divider-left) h-px bg-(--color-black-alpha-20)',
} as const

export const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    deleteMode,
    selectedUid,
    selectedContacts,
    searchValue,
    onSelectContact,
    onSetSelectedContact,
    onContextMenu,
    rightElement,
    onBlock,
}) => {
    const [secondaryText, setSecondaryText] = useState('')
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ top: 0, left: 0 })

    const handleContextMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            onContextMenu?.(event)
            event.preventDefault()
            setContextMenuPosition({
                left: event.clientX,
                top: event.clientY,
            })
            setContextMenuOpen(true)
        },
        [onContextMenu],
    )
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
        <div
            className={STYLES.container}
            onContextMenu={handleContextMenu}
        >
            <div className={STYLES.divider} />
            <ContactAvatar
                // src={`/images/contacts/${contact?.avatarUrl}`}
                src={contact?.avatarUrl || ''}
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
                        ? onSelectContact?.(contact.uid)
                        : onSetSelectedContact(contact.uid)
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
                              onSelectContact?.(contact.uid)
                        : undefined
                }
                isSelected={
                    deleteMode
                        ? selectedContacts.includes(
                              contact.uid,
                          )
                        : false
                }
                rightElement={rightElement}
            />

            <ContactContextMenu
                open={contextMenuOpen}
                onOpenChange={setContextMenuOpen}
                position={contextMenuPosition}
                onBlock={() => {
                    onBlock?.()
                    setContextMenuOpen(false)
                }}
            />
        </div>
    )
}
