'use client'

import {
    forwardRef,
    useState,
    useRef,
    useCallback,
} from 'react'
import {
    Avatar,
} from '@shared/ui/avatar/Avatar'
import { cn } from '@shared/lib/utils'
import { ChatListItemDropdown } from './ChatListItemDropdown'
import { ChatListItemProps } from '@shared/types/chat'



export const ChatListItem = forwardRef<
    HTMLDivElement,
    ChatListItemProps
>(
    (
        {
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
        },
        ref,
    ) => {
       
        const [contextMenuOpen, setContextMenuOpen] =
            useState(false)
        const [
            contextMenuPosition,
            setContextMenuPosition,
        ] = useState({top:0,left:0})
        const containerRef = useRef<HTMLDivElement>(null)
         const [hoveredItem, setHoveredItem] = useState<string | null>(null)
        const setRefs = useCallback((node: HTMLDivElement | null) => {
            if (typeof ref === 'function') {
                ref(node)
            } else if (ref) {
                ref.current = node
            }
            containerRef.current = node
        }, [ref])
        const handleContextMenu = (e: React.MouseEvent) => {
            e.preventDefault()
            console.log('Context menu triggered at:', e.clientX, e.clientY)
            const containerRect =
                containerRef.current?.getBoundingClientRect()
            if (containerRect) {
                setContextMenuPosition({
                    left: e.clientX,
                    top: e.clientY,
                })
            }
            setContextMenuOpen(true)
        }
        const handleMenuItemClick = (
            handler?: () => void,
        ) => {
            if (handler) {
                handler()
            }
            setContextMenuOpen(false)
        }

        return (
            <div
                ref={setRefs}
                className='px-2 py-1 transition-all duration-200 relative'
                onClick={onClick}
                onContextMenu={handleContextMenu}
            >
                <div className="absolute bottom-0 left-(--chat-list-divider-left) right-4 h-px bg-(--color-black-alpha-20)" />

                <Avatar
                    {...avatarProps}
                    mode="chat"
                    selected={selected}
                    messageStatus={
                        avatarProps.messageStatus
                    }
                    notificationsEnabled={notificationsEnabled}
                    className={cn(
                        'bg-transparent hover:bg-transparent', // Базовые стили
                        selected
                            ? 'bg-(--color-accent-violet-primary) hover:bg-(--color-accent-violet-primary)'
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
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />
                
            </div>
        )
    },
)

ChatListItem.displayName = 'ChatListItem'
