'use client'

import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'

import type { ReactNode } from 'react'
import { MessageStatusIcon } from '@shared/ui/messageStatusIcon/MessageStatusIcon'
import Image from 'next/image'

interface ChatAvatarRightSectionProps {
    timestamp?: string
    showUnread: boolean
    unreadCount?: number |undefined
    messageStatus?: 'sent' | 'delivered' | 'read' | null
    rightElement?: ReactNode
    selected?: boolean
    isFavorite?:boolean
    isChatRead?:boolean
}

export const ChatAvatarRightSection = ({
    timestamp,
    showUnread,
    unreadCount,
    messageStatus,
    rightElement,
    selected,
    isFavorite,
    isChatRead
}: ChatAvatarRightSectionProps) => {
    return (
        <div className="ml-auto flex items-start gap-2">
            {(timestamp || showUnread || messageStatus) && (
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        {messageStatus &&
                            messageStatus !== null && (
                                <div
                                    className={cn(
                                        'flex h-4 w-4 items-center justify-center',
                                        selected &&
                                            'opacity-80',
                                    )}
                                >
                                    <MessageStatusIcon
                                        status={
                                            messageStatus
                                        }
                                        selected={selected}
                                    />
                                </div>
                            )}
                        {timestamp && (
                            <span
                                className={cn(
                                    'text-xs whitespace-nowrap',
                                    selected
                                        ? 'text-(--color-white-bg) opacity-80'
                                        : 'text-(--color-text-gray)',
                                )}
                            >
                                {timestamp}
                            </span>
                        )}
                    </div>
                    {isFavorite
                        ?( <Image
                                    src='/images/chatList/pin.svg'
                                    alt={'Закреплено'}
                                    width={16}
                                    height={16}
                                    className={cn(
                                        selected
                                            ? 'brightness-0 invert'
                                            : 'opacity-70'
                                    )}
                                />)
                        :(!isChatRead && (
                            showUnread?
                            (<Badge
                            variant="counter"
                            color="primary"
                            size="md"
                            className={
                                selected
                                    ? `
                                      bg-(--color-white-bg)
                                      text-(--color-accent-violet-primary)
                                    `
                                    : ''
                            }
                        >
                            {unreadCount}
                        </Badge>
                    ):(
                        <Badge
                            variant="counter"
                            color="primary"
                            size="md"
                            className={
                                selected
                                    ? 'bg-(--color-white-bg) text-(--color-accent-violet-primary)'
                                    : ''
                            }
                        >
                            {null}
                        </Badge>
                    )
                )
                    
                    )}
                    
                </div>
            )}
            {rightElement}
        </div>
    )
}

ChatAvatarRightSection.displayName =
    'ChatAvatarRightSection'
