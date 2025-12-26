'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'

interface ChatListItemDropdownProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    position: { top: number; left: number }
    onMuteChat?: () => void
    onPinChat?: () => void
    onMarkAsRead?: () => void
    onMarkAsUnread?: () => void
    onDeleteChat?: () => void
    onAddToContacts?: () => void
    notificationsEnabled: boolean
    isPinned: boolean
    isChatRead: boolean
    isInContacts: boolean
    onMenuItemClick: (handler?: () => void) => void
    hoveredItem: string | null
    setHoveredItem: (item: string | null) => void
}

export const ChatListItemDropdown = ({
    open,
    onOpenChange,
    position,
    onMuteChat,
    onPinChat,
    onMarkAsRead,
    onMarkAsUnread,
    onDeleteChat,
    onAddToContacts,
    notificationsEnabled,
    isPinned,
    isChatRead,
    isInContacts,
    onMenuItemClick,
    hoveredItem,
    setHoveredItem,
}: ChatListItemDropdownProps) => {
    return (
        <Dropdown
            open={open}
            onOpenChange={onOpenChange}
            closeOnSelect={true}
        >
            <Dropdown.Content
                manualPosition={position}
                width="auto"
                minWidth={180}
            >
                {!isInContacts && onAddToContacts && (
                    <Dropdown.Item
                        onSelect={() => onMenuItemClick(onAddToContacts)}
                        rightIcon={
                            <Image
                                src="/images/chatList/addContact.svg"
                                alt="Добавить в контакты"
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                        onMouseEnter={() => setHoveredItem('addToContacts')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        Добавить в контакты
                    </Dropdown.Item>
                )}

                {onMuteChat && (
                    <Dropdown.Item
                        onSelect={() => onMenuItemClick(onMuteChat)}
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
                        onSelect={() => onMenuItemClick(onPinChat)}
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
                    onMarkAsUnread && (
                        <Dropdown.Item
                            onSelect={() => onMenuItemClick(onMarkAsUnread)}
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
                    onMarkAsRead && (
                        <Dropdown.Item
                            onSelect={() => onMenuItemClick(onMarkAsRead)}
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
                        onSelect={() => onMenuItemClick(onDeleteChat)}
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
    )
}