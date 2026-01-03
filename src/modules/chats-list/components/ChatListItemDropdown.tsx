'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'

/** Позиция контекстного меню */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

interface ChatListItemDropdownProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    position: ContextMenuPosition
    onMuteChat?: () => void
    onPinChat?: () => void
    onMarkAsRead?: () => void
    onMarkAsUnread?: () => void
    onDeleteChat?: () => void
    notificationsEnabled: boolean
    isPinned: boolean
    isChatRead: boolean
    onMenuItemClick: (handler?: () => void) => void
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
    notificationsEnabled,
    isPinned,
    isChatRead,
    onMenuItemClick,
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
                {onMuteChat && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onMuteChat)
                        }
                        rightIcon={
                            <Image
                                src={
                                    notificationsEnabled
                                        ? '/images/chatList/mute.svg'
                                        : '/images/chatList/unMute.svg'
                                }
                                alt={
                                    notificationsEnabled
                                        ? 'Отключить уведомления'
                                        : 'Включить уведомления'
                                }
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        {notificationsEnabled
                            ? 'Отключить уведомления'
                            : 'Включить уведомления'}
                    </Dropdown.Item>
                )}

                {onPinChat && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onPinChat)
                        }
                        rightIcon={
                            <Image
                                src={
                                    isPinned
                                        ? '/images/chatList/unpin.svg'
                                        : '/images/chatList/pin.svg'
                                }
                                alt={
                                    isPinned
                                        ? 'Открепить'
                                        : 'Закрепить'
                                }
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        {isPinned
                            ? 'Открепить чат'
                            : 'Закрепить чат'}
                    </Dropdown.Item>
                )}

                {isChatRead
                    ? onMarkAsUnread && (
                          <Dropdown.Item
                              onSelect={() =>
                                  onMenuItemClick(
                                      onMarkAsUnread,
                                  )
                              }
                              rightIcon={
                                  <Image
                                      src="/images/chatList/markAsUnread.svg"
                                      alt="Пометить непрочитанным"
                                      width={16}
                                      height={16}
                                      className="opacity-80"
                                  />
                              }
                          >
                              Пометить непрочитанным
                          </Dropdown.Item>
                      )
                    : onMarkAsRead && (
                          <Dropdown.Item
                              onSelect={() =>
                                  onMenuItemClick(
                                      onMarkAsRead,
                                  )
                              }
                              rightIcon={
                                  <Image
                                      src="/images/chatList/markAsRead.svg"
                                      alt="Пометить прочитанным"
                                      width={16}
                                      height={16}
                                      className="opacity-80"
                                  />
                              }
                          >
                              Пометить прочитанным
                          </Dropdown.Item>
                      )}

                {onDeleteChat && (
                    <Dropdown.Item
                        danger
                        onSelect={() =>
                            onMenuItemClick(onDeleteChat)
                        }
                        rightIcon={
                            <Image
                                src="/images/chatList/deleteChat.svg"
                                alt="Удалить"
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        Удалить чат
                    </Dropdown.Item>
                )}
            </Dropdown.Content>
        </Dropdown>
    )
}
