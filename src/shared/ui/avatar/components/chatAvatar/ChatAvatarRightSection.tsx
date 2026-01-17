// Компонент правой секции аватарки чата (таймстамп, бейдж, статус)
'use client'

import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import type { ReactNode } from 'react'
import { MessageStatusIcon } from '@shared/ui/messageStatusIcon/MessageStatusIcon'
import Image from 'next/image'

// Пропсы компонента ChatAvatarRightSection
interface ChatAvatarRightSectionProps {
    timestamp?: string // Время последнего сообщения
    showUnread: boolean // Флаг показа бейджа непрочитанных
    unreadCount?: number | undefined // Количество непрочитанных сообщений
    messageStatus?: 'sent' | 'delivered' | 'read' | null // Статус сообщения
    rightElement?: ReactNode // Дополнительный элемент
    selected?: boolean // Флаг выбранного элемента
    isFavorite?: boolean // Флаг избранного чата
    isChatRead?: boolean // Флаг прочитанности
}

// Компонент правой секции аватарки с дополнительной информацией
export const ChatAvatarRightSection = ({
    timestamp,
    showUnread,
    unreadCount,
    messageStatus,
    rightElement,
    selected,
    isFavorite,
    isChatRead,
}: ChatAvatarRightSectionProps) => {
    return (
        <div className="ml-auto flex items-start gap-2">
            {/* Секция с временем, статусом и бейджами */}
            {(timestamp || showUnread || messageStatus) && (
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        {/* Иконка статуса сообщения */}
                        {messageStatus &&
                            messageStatus !== null && (
                                <div
                                    className={cn(
                                        `
                                          flex h-4 w-4 items-center
                                          justify-center
                                        `,
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
                        {/* Время последнего сообщения */}
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
                    {/* Отображение иконки закрепления или бейджа непрочитанных */}
                    {isFavorite ? (
                        // Иконка закрепленного чата
                        <Image
                            src="/images/chatList/pin.svg"
                            alt={'Закреплено'}
                            width={16}
                            height={16}
                            className={cn(
                                selected
                                    ? 'brightness-0 invert'
                                    : 'opacity-70',
                            )}
                        />
                    ) : (
                        // Бейдж непрочитанных сообщений
                        !isChatRead &&
                        (showUnread ? (
                            <Badge
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
                        ) : (
                            // Пустой бейдж (если чат не прочитан, но нет непрочитанных)
                            <Badge
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
                                {null}
                            </Badge>
                        ))
                    )}
                </div>
            )}
            {/* Дополнительный элемент справа (например, меню действий) */}
            {rightElement}
        </div>
    )
}

ChatAvatarRightSection.displayName =
    'ChatAvatarRightSection'
