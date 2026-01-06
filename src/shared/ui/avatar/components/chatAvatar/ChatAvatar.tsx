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
    messageStatus?: 'sent' | 'delivered' | 'read' | null
    isFavorite?: boolean
    isChatRead?: boolean
}

export const ChatAvatar = forwardRef<
    HTMLDivElement,
    ChatAvatarProps
>(
    (
        {
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
        },
        ref,
    ) => {
        const showUnread =
            typeof unreadCount === 'number' &&
            unreadCount > 0
        const hasRightSection =
            timestamp ||
            showUnread ||
            messageStatus ||
            rightElement
        return (
            <div
                ref={ref}
                className={cn(
                    `
                      flex cursor-pointer gap-3 rounded-md px-3 py-2
                      transition-colors duration-200 select-none
                    `,
                    `
                      bg-(--color-white-bg)
                      hover:bg-(--color-gray-light)
                    `,
                    'relative rounded-none',
                    selected &&
                        'bg-(--color-accent-violet-primary)',
                    className,
                )}
                {...props}
            >
                <div
                    className={`
                      relative h-15 w-15 shrink-0 overflow-hidden rounded-full
                      bg-(--color-gray-main)
                    `}
                >
                    <Image
                        src={src}
                        alt={alt ?? name}
                        width={60}
                        height={60}
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                            <p
                                className={cn(
                                    'truncate text-base font-medium',
                                    selected
                                        ? 'text-(--color-white-bg)'
                                        : 'text-(--color-text-black)',
                                )}
                            >
                                {name}
                            </p>
                            {notificationsEnabled ===
                                false && (
                                <Image
                                    src="/images/chatList/notificationsDisabled.svg"
                                    alt="Уведомления выключены"
                                    width={16}
                                    height={16}
                                    className={cn(
                                        'truncate text-sm',
                                        selected
                                            ? `
                                              text-(--color-white-bg) opacity-80
                                            `
                                            : 'text-(--color-text-gray)',
                                    )}
                                />
                            )}
                            {messagePreview && (
                                <p
                                    className={cn(
                                        'truncate text-sm',
                                        selected
                                            ? `
                                              text-(--color-white-bg) opacity-80
                                            `
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
    },
)

ChatAvatar.displayName = 'ChatAvatar'
