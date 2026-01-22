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
    src: string // URL изображения аватарки - обязательное поле
    alt?: string // Alt текст для изображения - опционально, по умолчанию используется name
    name: string // Имя пользователя/чата для отображения и alt текста
    messagePreview?: string // Предпросмотр последнего сообщения - показывается под именем
    timestamp?: string // Время последнего сообщения - форматированная строка времени
    unreadCount?: number // Количество непрочитанных сообщений - отображается как бейдж
    selected?: boolean // Флаг выбранного элемента - меняет стили для визуального выделения
    rightElement?: ReactNode // Дополнительный элемент справа - например, кнопка меню
    className?: string // Дополнительные CSS классы для кастомизации
    notificationsEnabled?: boolean // Флаг включенных уведомлений - показывает/скрывает иконку уведомлений
    chatType?:
        | 'chat'
        | 'public-group'
        | 'private-group'
        | 'public-channel'
        | 'private-channel'
    messageStatus?: 'sent' | 'delivered' | 'read' | null // Статус последнего сообщения
    isFavorite?: boolean // Флаг избранного чата - показывает иконку закрепления
    isChatRead?: boolean // Флаг прочитанности - влияет на отображение бейджа
}

// Компонент аватарки чата с информацией о сообщении
// Использует forwardRef для передачи ref родительскому компоненту
// Это позволяет управлять фокусом, позиционированием и другими DOM-операциями
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
            chatType,
            messageStatus,
            isFavorite,
            isChatRead,
            ...props
        },
        ref,
    ) => {
        // Определяем, нужно ли показывать бейдж непрочитанных
        // Проверяем что unreadCount определен и больше 0
        const showUnread =
            typeof unreadCount === 'number' &&
            unreadCount > 0

        // Определяем, есть ли правая секция (таймстамп, бейдж, статус)
        // Если хотя бы один из элементов присутствует - рендерим правую секцию
        const hasRightSection =
            timestamp ||
            showUnread ||
            messageStatus ||
            rightElement

        return (
            <div
                ref={ref}
                className={cn(
                    // Базовые стили контейнера
                    // flex с gap для горизонтального расположения элементов
                    // cursor-pointer указывает на кликабельность
                    // transition-colors для плавной смены цветов при hover/selected
                    `
                      flex cursor-pointer gap-3 rounded-md px-3 py-2
                      transition-colors duration-200 select-none
                    `,
                    // Цвета по умолчанию и при наведении
                    // bg-white-bg - белый фон
                    // hover:bg-gray-light - светло-серый при наведении
                    `
                      bg-white-bg
                      hover:bg-gray-light
                    `,
                    'relative rounded-none', // rounded-none отменяет скругления по умолчанию
                    selected &&
                        'hover:bg-accent-violet-light', // Другой цвет при наведении на выбранный элемент
                    className, // Пользовательские классы из пропсов
                )}
                {...props} // Распространяем все остальные HTML атрибуты
            >
                {/* Контейнер аватарки */}
                {/* relative positioning для корректного отображения Image с fill */}
                {/* h-15 w-15 - фиксированные размеры (60px) */}
                {/* overflow-hidden и rounded-full создают круглую маску для изображения */}
                <div
                    className={`
                      relative h-15 w-15 shrink-0 overflow-hidden rounded-full
                      bg-gray-main
                    `}
                >
                    <Image
                        src={src}
                        alt={alt ?? name} // Используем alt из пропсов или name как fallback
                        width={60}
                        height={60}
                        className="object-cover" // object-cover заполняет контейнер с сохранением пропорций
                    />
                </div>

                {/* Основная информация (имя и предпросмотр сообщения) */}
                {/* min-w-0 предотвращает overflow flex-элемента */}
                {/* flex-1 позволяет контейнеру занимать все доступное пространство */}
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                            {/* Имя пользователя/чата */}
                            {/* truncate обрезает текст с многоточием если не помещается */}
                            <p
                                className={cn(
                                    'truncate text-base font-medium',
                                    selected
                                        ? 'text-white-bg' // Белый текст на выбранном элементе
                                        : 'text-text-black', // Черный текст по умолчанию
                                )}
                            >
                                {name}
                            </p>
                            {/* Иконка отключенных уведомлений */}
                            {/* Показывается только если notificationsEnabled === false */}
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
                                            ? 'brightness-0 invert' // Инвертируем цвета для выбранного состояния
                                            : 'opacity-70', // Легкая прозрачность по умолчанию
                                    )}
                                />
                            )}
                        </div>
                        {/* Предпросмотр последнего сообщения */}
                        {/* Показывается только если messagePreview передан */}
                        {messagePreview && (
                            <p
                                className={cn(
                                    'truncate text-sm', // Меньший шрифт чем у имени
                                    selected
                                        ? `
                                              text-white-bg opacity-80
                                            ` // Белый с небольшой прозрачностью
                                        : 'text-text-gray', // Серый цвет по умолчанию
                                )}
                            >
                                {messagePreview}
                            </p>
                        )}
                    </div>
                </div>

                {/* Правая секция с дополнительной информацией */}
                {/* Рендерится только если есть хотя бы один элемент правой секции */}
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

// Отображаемое имя для компонента в React DevTools
// Важно для отладки, особенно при использовании forwardRef
ChatAvatar.displayName = 'ChatAvatar'
