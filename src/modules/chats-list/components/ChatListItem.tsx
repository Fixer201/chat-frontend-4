'use client'

import React, { useCallback, useRef, useState } from 'react'
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

/** ChatListItem компонент - элемент в списке чатов с контекстным меню
 * @param selected - Выбран ли текущий чат
 * @param onClick - Обработчик клика на элемент чата
 * @param ref - Ref на контейнер для доступа к DOM узлу из родительского компонента
 */
const ChatListItem = ({
    selected,
    onClick,
    onDeleteChat,
    onPinChat,
    onMuteChat,
    notificationsEnabled,
    isPinned = false,
    onMarkAsRead,
    onMarkAsUnread,
    isChatRead = true,
    ...avatarProps
}: ChatListItemProps & {
    ref?: React.Ref<HTMLDivElement>
}) => {
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    const [contextMenuPosition, setContextMenuPosition] =
        useState<ContextMenuPosition>({
            top: 0,
            left: 0,
        })
    const containerRef = useRef<HTMLDivElement>(null)

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
                messageStatus={avatarProps.messageStatus}
                notificationsEnabled={notificationsEnabled}
                className={cn(
                    `
                      bg-transparent
                      hover:bg-transparent
                    `,
                    selected
                        ? `
                          bg-(--color-accent-violet-primary)
                          hover:bg-(--color-accent-violet-primary)
                        `
                        : 'hover:bg-(--color-gray-main)',
                    'hover:rounded-lg',
                    selected && 'rounded-lg',
                )}
            />
            <ChatListItemDropdown
                open={contextMenuOpen}
                onOpenChange={setContextMenuOpen}
                position={contextMenuPosition}
                onMuteChat={onMuteChat}
                onPinChat={onPinChat}
                onMarkAsRead={onMarkAsRead}
                onMarkAsUnread={onMarkAsUnread}
                onDeleteChat={onDeleteChat}
                notificationsEnabled={notificationsEnabled}
                isPinned={isPinned}
                isChatRead={isChatRead}
                onMenuItemClick={handleMenuItemClick}
            />
        </div>
    )
}

ChatListItem.displayName = 'ChatListItem'

export { ChatListItem }
