'use client'
import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export interface ChatAvatarProps
    extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    messagePreview?: string
    timestamp?: string
    unreadCount?: number
    selected?: boolean
    rightElement?: ReactNode
    className?: string
    notificationsEnabled?: boolean
    messageStatus?: 'sent' | 'delivered' | 'read' | null
}

export const ChatAvatar = forwardRef<
    HTMLDivElement,
    ChatAvatarProps
>(({
    src,
    alt,
    name,
    messagePreview,
    timestamp,
    unreadCount,
    selected,
    rightElement,
    className,
    notificationsEnabled,
    messageStatus,
    ...props
}, ref) => {
    const showUnread = typeof unreadCount === 'number' && unreadCount > 0
    
    return (
        <div
            ref={ref}
            className={cn(
                'flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer',
                'bg-(--color-white-bg) hover:bg-(--color-gray-light)',
                'rounded-none relative',
                selected && 'bg-(--color-accent-violet-primary)',
                className
            )}
            {...props}
        >
            <div className="relative shrink-0 rounded-full overflow-hidden bg-(--color-gray-main) w-[60px] h-[60px]">
                <Image
                    src={src}
                    alt={alt ?? name}
                    fill
                    sizes="60px"
                    className="object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                        <p className={cn(
                            'text-base font-medium truncate',
                            selected
                                ? 'text-(--color-white-bg)'
                                : 'text-(--color-text-black)'
                        )}>
                            {name}
                        </p>
                        {notificationsEnabled === false && (
                            <Image
                                src="/images/chatList/notificationsDisabled.svg"
                                alt="Уведомления выключены"
                                width={16}
                                height={16}
                                className={cn(
                                    selected
                                        ? 'opacity-80'
                                        : 'opacity-60'
                                )}
                            />
                        )}
                    </div>
                    {messagePreview && (
                        <p className={cn(
                            'text-sm truncate',
                            selected
                                ? 'text-(--color-white-bg) opacity-80'
                                : 'text-(--color-text-gray)'
                        )}>
                            {messagePreview}
                        </p>
                    )}
                </div>
            </div>
            {(timestamp || showUnread || messageStatus || rightElement) && (
                <div className="ml-auto flex gap-2 items-start">
                    {(timestamp || showUnread || messageStatus) && (
                        <div className="flex flex-col gap-1 items-end">
                            <div className="flex items-center gap-1">
                                {messageStatus && messageStatus !== null && (
                                    <div className={cn(
                                        'w-4 h-4 flex items-center justify-center',
                                        selected && 'opacity-80'
                                    )}>
                                        {messageStatus === 'sent' && (
                                            <Image
                                                src="/images/messageStatus/sent.svg"
                                                alt="Отправлено"
                                                width={14}
                                                height={14}
                                                className={cn(
                                                    selected
                                                        ? 'brightness-0 invert'
                                                        : 'opacity-70'
                                                )}
                                            />
                                        )}
                                        {messageStatus === 'delivered' && (
                                            <Image
                                                src="/images/messageStatus/delivered.svg"
                                                alt="Доставлено"
                                                width={14}
                                                height={14}
                                                className={cn(
                                                    selected
                                                        ? 'brightness-0 invert'
                                                        : 'opacity-70'
                                                )}
                                            />
                                        )}
                                        {messageStatus === 'read' && (
                                            <Image
                                                src="/images/messageStatus/read.svg"
                                                alt="Прочитано"
                                                width={16}
                                                height={16}
                                                className={cn(
                                                    selected
                                                        ? 'brightness-0 invert'
                                                        : 'opacity-70'
                                                )}
                                            />
                                        )}
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
            )}
        </div>
    )
})

ChatAvatar.displayName = 'ChatAvatar'