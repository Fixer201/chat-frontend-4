// ContactAvatar.tsx
/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
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
    invertTextOnHighlight?: boolean
}

const rowBaseClasses =
    'flex cursor-pointer gap-3 rounded-md px-3 py-2 transition-colors duration-200 select-none relative rounded-none'

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
            invertTextOnHighlight = true,
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

        // Определяем, нужно ли инвертировать текст при выделении
        // По умолчанию true для обычного режима, false для режима выбора
        const shouldInvertText =
            invertTextOnHighlight && isHighlighted

        const handleSelectClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            onSelect?.()
        }
        const handleSelectKeyDown = createButtonKeyHandler(
            (e: React.KeyboardEvent) => {
                e.stopPropagation()
                onSelect?.()
            },
        )

        return (
            <div
                ref={ref}
                className={cn(
                    rowBaseClasses,
                    `bg-transparent hover:bg-transparent`,
                    selected
                        ? `bg-(--color-accent-violet-primary) hover:bg-(--color-accent-violet-primary)`
                        : 'hover:bg-(--color-accent-violet-light)',
                    'hover:rounded-lg',
                    selected && 'rounded-lg',
                    className,
                )}
                {...props}
            >
                <div
                    className={`
                  relative h-15 w-15 shrink-0 overflow-hidden rounded-full
                  bg-gray-200 p-4
                `}
                >
                    <Image
                        src={
                            src ||
                            '/images/contacts/DefaultAvatar.svg'
                        } // заменить на дефолтный аватар
                        alt={alt ?? name}
                        fill
                        sizes={'40px'}
                        className={`
                      object-cover
                      
                    `}
                    />
                </div>
                <div
                    className={`
                  min-w-0 flex-1
                `}
                >
                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                            <p
                                className={cn(
                                    'truncate text-base font-medium',
                                    shouldInvertText
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
                                    shouldInvertText
                                        ? 'text-(--color-white-bg)'
                                        : isOnline
                                          ? 'text-(--color-accent-violet-primary)'
                                          : 'text-(--color-text-black)',
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
                            'ml-3 flex gap-2',
                            showChatMeta
                                ? 'items-start'
                                : 'items-center',
                        )}
                    >
                        {showChatMeta && (
                            <div className="flex flex-col items-center gap-1">
                                {timestamp && (
                                    <span
                                        className={cn(
                                            'text-xs whitespace-nowrap',
                                            shouldInvertText
                                                ? 'text-(--color-white-bg)'
                                                : 'text-(--color-text-black)',
                                        )}
                                    >
                                        {timestamp}
                                    </span>
                                )}
                                <Badge
                                    variant="counter"
                                    color="primary"
                                    size="md"
                                    className={
                                        isHighlighted
                                            ? `
                                      bg-white
                                      text-(--color-accent-violet-primary)
                                    `
                                            : ''
                                    }
                                >
                                    {unreadCount}
                                </Badge>
                            </div>
                        )}
                        {showSelectIndicator && (
                            <span
                                className={cn(
                                    `
                                      flex h-6 w-6 cursor-pointer
                                      items-center justify-center rounded-full
                                      border-2 transition-colors
                                    `,
                                    isHighlighted ||
                                        isSelected
                                        ? `
                                          border-(--color-white-bg)
                                          bg-(--color-white-bg)
                                        `
                                        : `
                                          border-(--color-accent-violet-primary)
                                        `,
                                )}
                                onClick={handleSelectClick}
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
                                        width={24}
                                        height={24}
                                        onClick={handleSelectClick}
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
