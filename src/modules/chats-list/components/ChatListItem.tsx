'use client'

import {
    forwardRef,
    useState,
    useRef,
    useEffect,
} from 'react'
import {
    Avatar,
    AvatarProps,
} from '@shared/ui/avatar/Avatar'
import { cn } from '@shared/lib/utils'
import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'


export interface ChatListItemProps
    extends Omit<AvatarProps, 'mode' | 'className'> {
    selected?: boolean
    messageStatus?: 'sent' | 'delivered' | 'read' | null
    notificationsEnabled: boolean
    onDeleteChat?: () => void
    onPinChat?: () => void
    onMuteChat?: () => void
    onMarkAsRead?: () => void
    onMarkAsUnread?: () => void
    isPinned?: boolean
    isChatRead?: boolean
}

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
        useEffect(() => {
            console.log('ContextMenu state:', {
                open: contextMenuOpen,
                position: contextMenuPosition,
            })
        }, [contextMenuOpen, contextMenuPosition])
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
                ref={(node) => {
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                    containerRef.current = node
                }}
                className={cn(
                    'px-2 py-1 transition-all duration-200',
                    'relative',
                )}
                onClick={onClick}
                onContextMenu={handleContextMenu}
            >
                <div className="absolute bottom-0 left-[calc(60px+12px+8px)] right-4 h-px bg-(--color-black-alpha-20)" />

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
                <Dropdown
                    open={contextMenuOpen}
                    onOpenChange={setContextMenuOpen}
                    closeOnSelect={true}
                >
                    <Dropdown.Content
                        manualPosition={contextMenuPosition}
                        width="auto"
                        minWidth={180} 
                    >
                         {onMuteChat && (
                            <Dropdown.Item
                             onSelect={() => handleMenuItemClick(onMuteChat)}
                             rightIcon={
                             <Image 
                                        src={notificationsEnabled 
                                            ? "/images/chatList/mute.svg" 
                                            : "/images/chatList/unMute.svg"}
                                        alt={notificationsEnabled ? "Отключить уведомления" : "Включить уведомления"} 
                                        width={16} 
                                        height={16}
                                        className="opacity-80"
                                    />
                            }
                                onMouseEnter={() => setHoveredItem('mute')}
                                onMouseLeave={() => setHoveredItem(null)}
                             >
                                {notificationsEnabled ? 'Отключить уведомления' : 'Включить уведомления'}
                            </Dropdown.Item>
                        )}
                        {onPinChat && (
                            <Dropdown.Item
                             onSelect={() => handleMenuItemClick(onPinChat)}
                                rightIcon={
                                    <Image 
                                        src={isPinned 
                                            ? "/images/chatList/unpin.svg" 
                                            : "/images/chatList/pin.svg"}
                                        alt={isPinned ? "Открепить" : "Закрепить"} 
                                        width={16} 
                                        height={16}
                                        className="opacity-80"
                                    />
                                }
                                onMouseEnter={() => setHoveredItem('pin')}
                                onMouseLeave={() => setHoveredItem(null)}
                             >
                                 {isPinned ? 'Открепить чат' : 'Закрепить чат'}
                            </Dropdown.Item>
                        )}
                         
                           {isChatRead ? (
                            // Если чат прочитан - показываем "Пометить непрочитанным"
                            onMarkAsUnread && (
                                <Dropdown.Item 
                                    onSelect={() => handleMenuItemClick(onMarkAsUnread)}
                                    rightIcon={
                                        <Image 
                                            src="/images/chatList/markAsUnread.svg" 
                                            alt="Пометить непрочитанным" 
                                            width={16} 
                                            height={16}
                                            className="opacity-80"
                                        />
                                    }
                                    onMouseEnter={() => setHoveredItem('unread')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    Пометить непрочитанным
                                </Dropdown.Item>
                            )
                        ) : (
                            // Если чат не прочитан - показываем "Пометить прочитанным"
                            onMarkAsRead && (
                                <Dropdown.Item 
                                    onSelect={() => handleMenuItemClick(onMarkAsRead)}
                                    rightIcon={
                                        <Image 
                                            src="/images/chatList/markAsRead.svg" 
                                            alt="Пометить прочитанным" 
                                            width={16} 
                                            height={16}
                                            className="opacity-80"
                                        />
                                    }
                                    onMouseEnter={() => setHoveredItem('read')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    Пометить прочитанным
                                </Dropdown.Item>
                            )
                        )}
                       
                        
                        
                        {onDeleteChat && (
                            <Dropdown.Item 
                                danger 
                                onSelect={() => handleMenuItemClick(onDeleteChat)}
                                rightIcon={
                                    <Image 
                                        src="/images/chatList/deleteChat.svg" 
                                        alt="Удалить" 
                                        width={16} 
                                        height={16}
                                        className="opacity-80"
                                    />
                                }
                                onMouseEnter={() => setHoveredItem('delete')}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                Удалить чат
                            </Dropdown.Item>
                        )}
                        </Dropdown.Content>
                </Dropdown>
                
            </div>
        )
    },
)

ChatListItem.displayName = 'ChatListItem'
