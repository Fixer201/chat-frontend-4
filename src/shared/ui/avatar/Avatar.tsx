'use client'
import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export type AvatarMode =
    | 'contact'
    | 'select-contact'
    | 'chat'

export interface AvatarProps
    extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    mode?: AvatarMode
    statusText?: string
    messagePreview?: string
    timestamp?: string
    unreadCount?: number
    isOnline?: boolean
    selected?: boolean
    rightElement?: ReactNode
    className?: string
    notificationsEnabled?: boolean
    wasOnlineAt?: number
}

const rowBaseClasses =
    'flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer'

const modeClasses: Record<AvatarMode, string> = {
    contact:
        'bg-gray-light active:bg-(--color-accent-violet-dark)/60',
    'select-contact':
        'bg-gray-light active:bg-(--color-accent-violet-dark)/60',
    chat: 'bg-white hover:bg-[#EFEEF7]',
}

export const Avatar = forwardRef<
    HTMLDivElement,
    AvatarProps
>(
    (
        {
            src,
            alt,
            name,
            mode = 'contact',
            statusText,
            messagePreview,
            timestamp,
            unreadCount,
            isOnline,
            selected,
            rightElement,
            className,
            notificationsEnabled,
            ...props
        },
        ref,
    ) => {
        const showUnread =
            mode === 'chat' &&
            typeof unreadCount === 'number' &&
            unreadCount > 0
        const secondaryText =
            mode === 'chat' ? messagePreview : statusText
        const showChatMeta =
            mode === 'chat' && (timestamp || showUnread)
        const showSelectIndicator =
            mode === 'select-contact'
        const hasRightElement = Boolean(rightElement)
        const showRightSection =
            showChatMeta ||
            showSelectIndicator ||
            hasRightElement
        return (
            <div
                ref={ref}
                className={cn(
                    rowBaseClasses,
                    modeClasses[mode],
                    (mode === 'select-contact' ||
                        mode === 'contact') &&
                        selected &&
                        'bg-accent-violet-dark/60',
                    mode === 'chat' && 'rounded-none',
                    mode === 'chat' && 'relative',
                    className,
                    mode === 'chat' &&
                        selected &&
                        'bg-[#7769E1]',
                )}
                {...props}
            >
                <div
                    className={cn(
                        'relative shrink-0 rounded-full overflow-hidden bg-gray-200 p-4 w-[60px] h-[60px]',
                    )}
                >
                    <Image
                        src={src}
                        alt={alt ?? name}
                        fill
                        sizes={
                            mode === 'contact'
                                ? '40px'
                                : '60px'
                        }
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0 border-b border-b-gray-200">
                    <div className="min-w-0 flex flex-col ">
                        <div className="flex items-center gap-2">
                            <p
                                className={cn(
                                    'text-base font-medium truncate',

                                    selected
                                        ? 'text-(--color-white-bg)'
                                        : 'text-(--color-text-black)',
                                    
                                        selected
                                        ? 'text-(--color-white-bg)'
                                        : 'text-(--color-text-black)',
                                )}
                            >
                                {name}
                            </p>
                            {mode === 'chat' &&
                                notificationsEnabled ===
                                    false && (
                                    <Image
                                        src="/images/chatList/notificationsDisabled.svg"
                                        alt="Уведомления выключены"
                                        width={16}
                                        height={16}
                                        className={cn(
                                            selected
                                                ? 'opacity-80'
                                                : 'opacity-60',
                                        )}
                                    />
                                )}
                        </div>

                        {secondaryText && (
                            <p
                                className={cn(
                                    'text-sm truncate',
                                   
                                        selected
                                        ? 'text-white-bg/80'
                                        : mode === 'chat'
                                        ? 'text-(--color-text-gray)'
                                        : isOnline
                                        ? 'text-(--color-accent-violet-primary)'
                                        : 'text-text-gray',
                                )}
                            >
                                {secondaryText}
                            </p>
                        )}
                    </div>
                </div>
                {showRightSection && (
                    <div
                        className={cn(
                            'flex gap-2',
                            mode === 'chat' &&
                                'ml-auto items-end',
                            mode !== 'chat' && 'ml-3',
                            'ml-3 flex gap-2',
                            showChatMeta
                                ? 'items-start'
                                : 'items-center',
                        )}
                    >
                        {showChatMeta && (
                            <div
                                className={cn(
                                    'flex flex-col gap-1',
                                    mode === 'chat'
                                        ? 'items-end'
                                        : 'items-center',
                                )}
                            >
                                {timestamp && (
                                    <span
                                        className={cn(
                                            'text-xs text-text-gray whitespace-nowrap',
                                            mode ===
                                                'chat' &&
                                                selected
                                                ? 'text-white/80'
                                                : 'text-text-gray',
                                        )}
                                    >
                                        {timestamp}
                                    </span>
                                )}
                                {showUnread && (
                                    <Badge
                                        variant="counter"
                                        color="primary"
                                        size="md"
                                        className={
                                            selected
                                                ? 'bg-white text-[#7769E1]'
                                                : ''
                                        }
                                    >
                                        {unreadCount}
                                    </Badge>
                                )}
                            </div>
                        )}
                        {showSelectIndicator && (
                            <span
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                                    selected
                                        ? 'bg-(--color-white-bg) border-(--color-white-bg)'
                                        : 'border-(--color-accent-violet-primary)',
                                )}
                            >
                                {selected && (
                                    <Image
                                        src="/images/Check.svg"
                                        alt="selected"
                                        width={20}
                                        height={20}
                                    />
                                )}
                            </span>
                        )}
                        {rightElement}
                    </div>
                )}
            </div>
        )
    },
)

Avatar.displayName = 'Avatar'

// Пример использования:
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="contact" statusText="в сети" />
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="select-contact" statusText="был(а) только что" selected />
// <Avatar src="/images/user/image.svg" name="Алексей Митрофанов" mode="chat" messagePreview="Мурка по утрам..." timestamp="ПН" unreadCount={56} />
