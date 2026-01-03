'use client'
import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import { createButtonKeyHandler } from '@shared/lib/keyboard-handlers'
import type { HTMLAttributes, ReactNode } from 'react'

export type AvatarMode = 'contact' | 'select-contact'

export interface ContactAvatarProps extends HTMLAttributes<HTMLDivElement> {
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
    onSelect?: () => void
    isSelected?: boolean
}

const rowBaseClasses =
    'flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer'

const modeClasses: Record<AvatarMode, string> = {
    contact:
        'bg-gray-light hover:bg-(--color-accent-violet-primary)',
    'select-contact':
        'bg-gray-light hover:bg-(--color-accent-violet-dark)/60',
}

export const ContactAvatar = forwardRef<
    HTMLDivElement,
    ContactAvatarProps
>(
    (
        {
            src,
            alt,
            name,
            mode = 'contact',
            statusText,
            timestamp,
            unreadCount,
            isOnline,
            selected,
            rightElement,
            className,
            onSelect,
            isSelected,
            ...props
        },
        ref,
    ) => {
        const secondaryText = statusText
        const showChatMeta = timestamp
        const showSelectIndicator =
            mode === 'select-contact'
        const hasRightElement = Boolean(rightElement)
        const showRightSection =
            showChatMeta ||
            showSelectIndicator ||
            hasRightElement

        const isHighlighted =
            selected ||
            (mode === 'select-contact' && isSelected)

        const handleSelectKeyDown = createButtonKeyHandler(
            () => onSelect?.(),
        )

        return (
            <div
                ref={ref}
                className={cn(
                    rowBaseClasses,
                    modeClasses[mode],

                    isHighlighted &&
                        'bg-(--color-accent-violet-primary)',
                    className,
                )}
                {...props}
            >
                <div
                    className={cn(
                        `
                          relative h-15 w-15 shrink-0 overflow-hidden
                          rounded-full bg-gray-200 p-4
                        `,
                    )}
                >
                    <Image
                        src={src}
                        alt={alt ?? name}
                        fill
                        sizes={'40px'}
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1 border-b border-b-gray-200">
                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                            <p
                                className={cn(
                                    'truncate text-base font-medium',
                                    isHighlighted
                                        ? 'text-(--color-white-bg)'
                                        : 'text-(--color-text-black)',
                                )}
                            >
                                {name}
                            </p>
                        </div>

                        {secondaryText && (
                            <p
                                className={cn(
                                    'truncate text-sm',

                                    isHighlighted
                                        ? 'text-white/80'
                                        : isOnline
                                          ? `
                                              text-(--color-accent-violet-primary)
                                            `
                                          : 'text-(--color-text-gray)',
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
                                    'items-center',
                                )}
                            >
                                {timestamp && (
                                    <span
                                        className={cn(
                                            `
                                              text-xs whitespace-nowrap
                                              text-(--color-text-gray)
                                            `,

                                            isHighlighted
                                                ? 'text-white/80'
                                                : 'text-(--color-text-gray)',
                                        )}
                                    >
                                        {timestamp}
                                    </span>
                                )}
                                {
                                    <Badge
                                        variant="counter"
                                        color="primary"
                                        size="md"
                                        className={
                                            isHighlighted
                                                ? `
                                                  bg-white
                                                  text-accent-violet-dark/60
                                                `
                                                : ''
                                        }
                                    >
                                        {unreadCount}
                                    </Badge>
                                }
                            </div>
                        )}
                        {showSelectIndicator && (
                            <span
                                className={cn(
                                    `
                                      flex h-6 w-6 items-center justify-center
                                      rounded-full border-2
                                    `,
                                    isHighlighted
                                        ? `
                                          border-(--color-white-bg)
                                          bg-(--color-white-bg)
                                        `
                                        : `
                                          border-(--color-accent-violet-primary)
                                        `,
                                    isSelected
                                        ? `
                                          border-(--color-white-bg)
                                          bg-(--color-white-bg)
                                        `
                                        : `
                                          border-(--color-accent-violet-primary)
                                        `,
                                )}
                                onClick={onSelect}
                                onKeyDown={
                                    handleSelectKeyDown
                                }
                                role="button"
                                tabIndex={0}
                                aria-label={
                                    isSelected
                                        ? 'Отменить выбор'
                                        : 'Выбрать'
                                }
                            >
                                {isSelected && (
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

ContactAvatar.displayName = 'ContactAvatar'
