// Компонент аватарки чата с информацией о сообщении
/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { ChatAvatarRightSection } from './ChatAvatarRightSection'

// Пропсы компонента ChatAvatar
export interface ChatAvatarProps extends HTMLAttributes<HTMLDivElement> {
    src: string // URL изображения аватарки
    alt?: string // Alt текст для изображения
    name: string // Имя пользователя/чата
    messagePreview?: string // Предпросмотр последнего сообщения
    timestamp?: string // Время последнего сообщения
    unreadCount?: number // Количество непрочитанных сообщений
    selected?: boolean // Флаг выбранного элемента
    rightElement?: ReactNode // Дополнительный элемент справа
    className?: string // Дополнительные CSS классы
    notificationsEnabled?: boolean // Флаг включенных уведомлений
    messageStatus?: 'sent' | 'delivered' | 'read' | null // Статус сообщения
    isFavorite?: boolean // Флаг избранного чата
    isChatRead?: boolean // Флаг прочитанности
}

// Компонент аватарки чата с информацией о сообщении
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
        // Определяем, нужно ли показывать бейдж непрочитанных
        const showUnread =
            typeof unreadCount === 'number' &&
            unreadCount > 0

        // Определяем, есть ли правая секция (таймстамп, бейдж, статус)
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
                        'hover:bg-(--color-accent-violet-light)',
                    className,
                )}
                {...props}
            >
                {/* Контейнер аватарки */}
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

                {/* Основная информация (имя и предпросмотр сообщения) */}
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
                            {/* Иконка отключенных уведомлений */}
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
                                            ? 'brightness-0 invert'
                                            : 'opacity-70',
                                    )}
                                />
                            )}
                        </div>
                        {/* Предпросмотр последнего сообщения */}
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

                {/* Правая секция с дополнительной информацией */}
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
