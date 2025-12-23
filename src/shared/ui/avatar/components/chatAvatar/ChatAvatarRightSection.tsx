'use client'

import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'

import type { ReactNode } from 'react'
import { MessageStatusIcon } from '@shared/ui/messageStatusIcon/MessageStatusIcon'

interface ChatAvatarRightSectionProps {
    timestamp?: string
    showUnread: boolean
    unreadCount?: number
    messageStatus?: 'sent' | 'delivered' | 'read' | null
    rightElement?: ReactNode
    selected?: boolean
}

export const ChatAvatarRightSection = ({
    timestamp,
    showUnread,
    unreadCount,
    messageStatus,
    rightElement,
    selected,
}: ChatAvatarRightSectionProps) => {
    return (
        <div className="ml-auto flex gap-2 items-start">
            {(timestamp || showUnread || messageStatus) && (
                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1">
                        {messageStatus && messageStatus !== null && (
                            <div className={cn(
                                'w-4 h-4 flex items-center justify-center',
                                selected && 'opacity-80'
                            )}>
                                <MessageStatusIcon 
                                    status={messageStatus} 
                                    selected={selected}
                                />
                            </div>
                        )}
                        {timestamp && (
                            <span className={cn(
                                'text-xs whitespace-nowrap',
                                selected
                                    ? 'text-(--color-white-bg) opacity-80'
                                    : 'text-(--color-text-gray)'
                            )}>
                                {timestamp}
                            </span>
                        )}
                    </div>
                    {showUnread && (
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
                            {unreadCount}
                        </Badge>
                    )}
                </div>
            )}
            {rightElement}
        </div>
    );
};

ChatAvatarRightSection.displayName = 'ChatAvatarRightSection';