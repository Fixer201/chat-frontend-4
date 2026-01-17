// Компонент правой секции аватарки чата (таймстамп, бейдж, статус)
'use client'

import { Badge } from '@shared/ui/badge/Badge'
import { cn } from '@shared/lib/utils'
import type { ReactNode } from 'react'
import { MessageStatusIcon } from '@shared/ui/messageStatusIcon/MessageStatusIcon'
import Image from 'next/image'

// Пропсы компонента ChatAvatarRightSection
interface ChatAvatarRightSectionProps {
    timestamp?: string // Время последнего сообщения - форматированная строка
    showUnread: boolean // Флаг показа бейджа непрочитанных - вычисляется в родителе
    unreadCount?: number | undefined // Количество непрочитанных сообщений для бейджа
    messageStatus?: 'sent' | 'delivered' | 'read' | null // Статус последнего сообщения
    rightElement?: ReactNode // Дополнительный элемент (кнопки, меню и т.д.)
    selected?: boolean // Флаг выбранного элемента - влияет на стили
    isFavorite?: boolean // Флаг избранного чата - показывает иконку закрепления вместо бейджа
    isChatRead?: boolean // Флаг прочитанности - влияет на логику отображения бейджа
}

// Компонент правой секции аватарки с дополнительной информацией
// Вынесен в отдельный компонент для чистоты кода и переиспользования
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
            {/* Рендерится если есть хотя бы один из элементов: timestamp, showUnread или messageStatus */}
            {(timestamp || showUnread || messageStatus) && (
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        {/* Иконка статуса сообщения */}
                        {/* Показывается только если messageStatus не null */}
                        {messageStatus &&
                            messageStatus !== null && (
                                <div
                                    className={cn(
                                        // Контейнер для центрирования иконки
                                        `
                                          flex h-4 w-4 items-center
                                          justify-center
                                        `,
                                        selected &&
                                            'opacity-80', // Легкая прозрачность при выбранном состоянии
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
                                    'text-xs whitespace-nowrap', // Маленький шрифт, запрет переноса
                                    selected
                                        ? 'text-white-bg opacity-80' // Белый с прозрачностью при selected
                                        : 'text-text-gray', // Серый по умолчанию
                                )}
                            >
                                {timestamp}
                            </span>
                        )}
                    </div>
                    {/* Отображение иконки закрепления или бейджа непрочитанных */}
                    {/* Условие: если чат в избранном - показываем иконку закрепления */}
                    {/* Иначе если чат не прочитан - показываем бейдж (даже если showUnread false) */}
                    {isFavorite ? (
                        // Иконка закрепленного чата
                        // Показывается вместо бейджа для избранных чатов
                        <Image
                            src="/images/chatList/pin.svg"
                            alt={'Закреплено'}
                            width={16}
                            height={16}
                            className={cn(
                                selected
                                    ? 'brightness-0 invert' // Инвертируем цвета для контраста на selected
                                    : 'opacity-70', // Легкая прозрачность по умолчанию
                            )}
                        />
                    ) : (
                        // Бейдж непрочитанных сообщений
                        // Показывается только если чат не прочитан (isChatRead === false)
                        !isChatRead &&
                        (showUnread ? (
                            // Бейдж с числом непрочитанных
                            // Показывается если showUnread true (unreadCount > 0)
                            <Badge
                                variant="counter" // Стиль счетчика (круглый с числом)
                                color="primary" // Основной цвет (фиолетовый)
                                size="md" // Средний размер
                                className={
                                    selected
                                        ? `
                                          bg-white-bg text-accent-violet-primary
                                        ` // Белый фон, фиолетовый текст при selected
                                        : ''
                                }
                            >
                                {unreadCount}
                            </Badge>
                        ) : (
                            // Пустой бейдж
                            // Показывается если чат не прочитан, но нет непрочитанных сообщений
                            // Визуальный индикатор "непрочитанности" без числа
                            <Badge
                                variant="counter"
                                color="primary"
                                size="md"
                                className={
                                    selected
                                        ? `
                                          bg-white-bg text-accent-violet-primary
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
            {/* Передается из пропсов и рендерится как есть */}
            {rightElement}
        </div>
    )
}

// Отображаемое имя для отладки в React DevTools
ChatAvatarRightSection.displayName =
    'ChatAvatarRightSection'
