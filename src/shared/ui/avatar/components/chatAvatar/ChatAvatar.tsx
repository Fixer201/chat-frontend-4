'use client'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { ChatAvatarRightSection } from './ChatAvatarRightSection'

export interface ChatAvatarProps extends HTMLAttributes<HTMLDivElement> {
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
    messageStatus?: 'sent' | 'delivered' | 'read' | null,
    isFavorite?:boolean
    isChatRead?:boolean
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
    isFavorite,
    isChatRead,
    ...props
}, ref) => {
    const showUnread = typeof unreadCount === 'number' && unreadCount > 0
    const hasRightSection = timestamp || showUnread || messageStatus || rightElement
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
            <div className="relative shrink-0 rounded-full overflow-hidden bg-(--color-gray-main) w-15 h-15">
                <Image
                    src={src}
                    alt={alt ?? name}
                    width={60}
                    height={60}
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
                                    'truncate text-sm',
                                    selected
                                        ? 'text-(--color-white-bg) opacity-80'
                                        : 'text-(--color-text-gray)',
                                )}
                            >
                                {messagePreview}
                            </p>
                        )}
                    </div>
                </div>
                {hasRightSection && (
                    <ChatAvatarRightSection
                        timestamp={timestamp}
                        showUnread={showUnread}
                        unreadCount={unreadCount}
                        messageStatus={messageStatus}
                        rightElement={rightElement}
                        selected={selected}
                    />
                )}
            </div>
           {hasRightSection && (
                <ChatAvatarRightSection
                    timestamp={timestamp}
                    showUnread={showUnread}
                    unreadCount={unreadCount}
                    messageStatus={messageStatus}
                    rightElement={rightElement}
                    selected={selected}
                    isFavorite={isFavorite}
                    isChatRead={isChatRead}
                />
            )}
        </div>
    )
})

ChatAvatar.displayName = 'ChatAvatar'
