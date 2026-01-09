'use client'

import React, {
    forwardRef,
    useCallback,
    useRef,
    useState,
} from 'react'
import { Avatar } from '@shared/ui/avatar/Avatar'
import { cn } from '@shared/lib/utils'
import { ChatListItemDropdown } from './ChatListItemDropdown'
import { ChatListItemProps } from '@shared/types/chat'

/** Позиция контекстного меню */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

/** Tailwind классы для компонента */
const STYLES = {
    container:
        'relative px-2 py-1 transition-all duration-200',
    divider:
        'absolute right-4 bottom-0 left-(--chat-list-divider-left) h-px bg-(--color-black-alpha-20)',
} as const

export const ChatListItem = forwardRef<
    HTMLDivElement,
    ChatListItemProps
>(
    (
        {
            selected,
            onClick,
            onDeleteChat,
            onFavoriteChat,
            onMuteChat,
            onAddToContacts,
            notificationsEnabled,
            isFavorite = false,
            onMarkAsRead,
            onMarkAsUnread,
            isChatRead = true,
            isInContacts = false,
            ...avatarProps
        },
        ref,
    ) => {
        const [contextMenuOpen, setContextMenuOpen] =
            useState(false)
        const [
            contextMenuPosition,
            setContextMenuPosition,
        ] = useState({ top: 0, left: 0 })
        const containerRef = useRef<HTMLDivElement>(null)
        const [hoveredItem, setHoveredItem] = useState<
            string | null
        >(null)
        const setRefs = useCallback(
            (node: HTMLDivElement | null) => {
                if (typeof ref === 'function') {
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
                containerRef.current = node
            },
            [ref],
        )
        const handleContextMenu = useCallback(
            (e: React.MouseEvent) => {
                e.preventDefault()
                setContextMenuPosition({
                    left: e.clientX,
                    top: e.clientY,
                })
                setContextMenuOpen(true)
            },
            [],
        )

        const handleMenuItemClick = useCallback(
            (handler?: () => void) => {
                handler?.()
                setContextMenuOpen(false)
            },
            [],
        )

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.currentTarget.click()
                }
            },
            [],
        )

        return (
            <div
                ref={containerRef}
                className={STYLES.container}
                onClick={onClick}
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
                role="button"
                aria-label="Элемент списка чатов"
                aria-haspopup="menu"
                aria-expanded={contextMenuOpen}
                tabIndex={0}
            >
                <div className={STYLES.divider} />

                <Avatar
                    {...avatarProps}
                    mode="chat"
                    selected={selected}
                    messageStatus={
                        avatarProps.messageStatus
                    }
                    isFavorite={isFavorite}
                    isChatRead={isChatRead}
                    notificationsEnabled={
                        notificationsEnabled
                    }
                    className={cn(
                        `
                          bg-transparent
                          hover:bg-transparent
                        `, // Базовые стили
                        selected
                            ? `
                              bg-(--color-accent-violet-primary)
                              hover:bg-(--color-accent-violet-primary)
                            `
                            : 'hover:bg-(--color-accent-violet-light)',
                        'hover:rounded-lg',
                        selected && 'rounded-lg',
                    )}
                />
                <ChatListItemDropdown
                    open={contextMenuOpen}
                    onOpenChange={setContextMenuOpen}
                    position={contextMenuPosition}
                    onMuteChat={onMuteChat}
                    onFavoriteChat={onFavoriteChat}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAsUnread={onMarkAsUnread}
                    onDeleteChat={onDeleteChat}
                    onAddToContacts={onAddToContacts}
                    notificationsEnabled={
                        notificationsEnabled
                    }
                    isFavorite={isFavorite}
                    isChatRead={isChatRead}
                    isInContacts={isInContacts}
                    onMenuItemClick={handleMenuItemClick}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />
            </div>
        )
    },
)

ChatListItem.displayName = 'ChatListItem'
