'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import SentIcon from '@public/images/messageStatus/sent.svg'
import DeliveredIcon from '@public/images/messageStatus/delivered.svg'
import ReadIcon from '@public/images/messageStatus/read.svg'
import { MessageContextMenu } from './MessageContextMenu'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import Image from 'next/image'
import { useState, useCallback, useTransition } from 'react'
import { cn } from '@shared/lib/utils'
import { useWebSocket } from '@shared/context/websocketContext'

/**
 * Элемент списка сообщений — отображение одного сообщения с действиями.
 *
 * Поддерживает два режима взаимодействия:
 * 1. Обычный — правый клик открывает контекстное меню (MessageContextMenu),
 *    левый клик ничего не делает.
 * 2. Режим выбора (isSelectionMode) — любой клик переключает чекбокс,
 *    контекстное меню скрыто.
 *
 * Собственные сообщения (isOwn) выравниваются вправо и имеют другой цвет фона
 * (teal-secondary vs message-bg-other). Для них также доступна иконка статуса
 * прочтения (sent → delivered → read).
 *
 * Каждый MessageItem самостоятельно управляет своими модалками
 * (DeleteMessageModal, CopyToast), чтобы не усложнять родительский ChatRoom.
 */
interface MessageItemProps {
    readonly message: Message
    readonly onEdit?: (message: Message) => void
    readonly onReply?: (message: Message) => void
    readonly onSelect?: (message: Message) => void
    readonly onForward?: (message: Message) => void
    /** Режим множественного выбора: показывает чекбоксы, меняет поведение кликов */
    readonly isSelectionMode?: boolean
    readonly isSelected?: boolean
    /** Имя собеседника — для персонализации текста в модалке удаления */
    readonly chatName?: string
}

/** Статус прочтения исходящего сообщения */
type ReadStatus = 'sent' | 'delivered' | 'read'

/**
 * Определяет статус прочтения сообщения по временным меткам.
 * Возвращает null для входящих сообщений — статус прочтения
 * отображается только для собственных (исходящих) сообщений.
 */
function getReadStatus(
    message: Message,
    isOwn: boolean,
): ReadStatus | null {
    if (!isOwn) return null

    if (message.read_at) return 'read'
    if (message.delivered_at) return 'delivered'

    return 'sent'
}

/**
 * Иконка статуса прочтения: одна галочка (sent), двойная серая (delivered),
 * двойная фиолетовая (read). Для входящих сообщений не рендерится.
 */
function ReadCheckmark({
    status,
}: Readonly<{
    status: ReadStatus | null
}>) {
    if (!status) return null

    if (status === 'sent') {
        return (
            <SentIcon
                width={18}
                height={16}
                className="fill-text-gray"
            />
        )
    }

    if (status === 'delivered') {
        return (
            <DeliveredIcon
                width={18}
                height={12}
                className="fill-text-gray"
            />
        )
    }

    return (
        <ReadIcon
            width={18}
            height={11}
            className="fill-accent-violet-primary"
        />
    )
}

export default function MessageItem({
    message,
    onEdit,
    onReply,
    onSelect,
    onForward,
    isSelectionMode = false,
    isSelected = false,
    chatName,
}: MessageItemProps) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null

    const currentUserId =
        currentUser?.id || MOCK_CURRENT_USER_ID

    // Нестрогое сравнение (==) — from_user может быть числом, currentUserId — строкой
    const isOwn = message.from_user == currentUserId
    const readStatus = getReadStatus(message, isOwn)

    const { deleteMessage } = useWebSocket()

    // useTransition — Vercel best practice: встроенный isPending вместо ручного isLoading,
    // автоматический сброс при ошибке, UI остаётся отзывчивым во время удаления
    const [isDeleting, startDeleteTransition] =
        useTransition()

    // --- Локальные состояния UI ---
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    /** Позиция контекстного меню — координаты курсора при правом клике */
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ top: 0, left: 0 })
    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false)
    const [copyToastVisible, setCopyToastVisible] =
        useState(false)

    // Форматирование Unix-timestamp в строку времени (ЧЧ:ММ) по русской локали.
    // Умножение на 1000 — бэкенд отдаёт timestamp в секундах, Date ожидает миллисекунды.
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return ''
        return new Date(
            timestamp * 1000,
        ).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // ISO-строка для атрибута dateTime в <time> — a11y: скринридер озвучит полную дату
    const getISOTime = (timestamp?: number) => {
        if (!timestamp) return ''
        return new Date(timestamp * 1000).toISOString()
    }

    // Правый клик по сообщению: в режиме выбора — переключает чекбокс,
    // в обычном режиме — открывает контекстное меню в позиции курсора
    const handleContextMenu = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        e.preventDefault()
        if (isSelectionMode) {
            onSelect?.(message)
            return
        }
        setContextMenuPosition({
            top: e.clientY,
            left: e.clientX,
        })
        setContextMenuOpen(true)
    }

    // Левый клик: в обычном режиме ничего не делает,
    // в режиме выбора — переключает выделение сообщения
    const handleClick = () => {
        if (isSelectionMode) {
            onSelect?.(message)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopyToastVisible(true)
    }

    const handleHideCopyToast = useCallback(() => {
        setCopyToastVisible(false)
    }, [])

    const handleEdit = () => {
        onEdit?.(message)
    }

    const handleReply = () => {
        onReply?.(message)
    }

    const handleForward = () => {
        onForward?.(message)
    }

    const handleSelect = () => {
        onSelect?.(message)
    }

    const handleDelete = () => {
        setDeleteModalOpen(true)
    }

    // Подтверждение удаления через startTransition (Vercel best practice §6.9):
    // isPending (isDeleting) управляется автоматически, UI не блокируется
    const handleDeleteConfirm = (forAll: boolean) => {
        if (!message.uid || !message.chatKey) return

        startDeleteTransition(() => {
            deleteMessage({
                uid: message.uid!,
                chatKey: message.chatKey!,
                forAll,
            })
            setDeleteModalOpen(false)
        })
    }

    // Обёртка для пунктов контекстного меню: выполняет действие и закрывает меню
    const handleMenuItemClick = (handler?: () => void) => {
        handler?.()
        setContextMenuOpen(false)
    }

    return (
        <>
            <div
                className={`
                  flex items-center gap-3
                  ${isSelectionMode ? 'cursor-pointer' : ''}
                  ${
                      isSelected
                          ? 'rounded-lg bg-accent-violet-ultra-light'
                          : ''
                  }
                `}
                onClick={handleClick}
                // a11y: дублируем click через клавиатуру (Enter/Space) для режима выбора
                onKeyDown={(e) => {
                    if (
                        isSelectionMode &&
                        (e.key === 'Enter' || e.key === ' ')
                    ) {
                        e.preventDefault()
                        handleClick()
                    }
                }}
                // a11y: в режиме выбора div ведёт себя как кнопка — добавляем role и tabIndex
                role={
                    isSelectionMode ? 'button' : undefined
                }
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={isSelectionMode ? 0 : undefined}
            >
                {/* Чекбокс режима выбора: cursor-pointer для явного указания интерактивности */}
                {isSelectionMode && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelect?.(message)
                        }}
                        className={`
                          shrink-0 cursor-pointer transition-transform
                          active:scale-90
                        `}
                    >
                        <Image
                            src={
                                isSelected
                                    ? '/icons/message/selected.svg'
                                    : '/icons/message/not_selected.svg'
                            }
                            alt=""
                            width={22}
                            height={22}
                        />
                    </button>
                )}

                <div
                    className={`
                      flex flex-1
                      ${
                          isOwn
                              ? 'justify-end'
                              : 'justify-start'
                      }
                    `}
                >
                    {/* Пузырь сообщения: cursor-context-menu подсказывает о правом клике,
                        hover-подсветка даёт визуальную обратную связь */}
                    {/* Пузырь сообщения: opacity снижается при удалении (optimistic feedback) */}
                    <div
                        onContextMenu={handleContextMenu}
                        aria-label={
                            isOwn
                                ? `Ваше сообщение: ${message.content}`
                                : `Сообщение: ${message.content}`
                        }
                        style={{
                            maxWidth:
                                'var(--message-max-width)',
                        }}
                        className={cn(
                            `
                              cursor-context-menu rounded-lg px-4 py-2
                              text-text-black transition-shadow
                              hover:shadow-md
                            `,
                            isOwn
                                ? 'bg-teal-secondary'
                                : 'bg-message-bg-other',
                            isDeleting && 'opacity-50',
                        )}
                    >
                        <div className="flex items-end justify-between gap-2">
                            {/* cursor-text на тексте — пользователь видит I-beam при наведении на текст */}
                            <div
                                className={`
                                  cursor-text text-base font-normal
                                  wrap-break-word whitespace-pre-wrap
                                `}
                            >
                                {message.content}
                                {message.updated_at &&
                                    message.updated_at !==
                                        message.created_at && (
                                        <span
                                            className={`
                                              ml-1 text-xs text-text-gray
                                            `}
                                        >
                                            (изменено)
                                        </span>
                                    )}
                            </div>
                            {message.created_at && (
                                <div
                                    className={`
                                      flex shrink-0 items-center gap-1 text-sm
                                      whitespace-nowrap text-text-gray
                                    `}
                                >
                                    {/* a11y: <time> с dateTime — скринридер озвучит полную дату */}
                                    <time
                                        dateTime={getISOTime(
                                            message.created_at,
                                        )}
                                    >
                                        {formatTime(
                                            message.created_at,
                                        )}
                                    </time>
                                    <ReadCheckmark
                                        status={readStatus}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Контекстное меню: скрыто в режиме выбора,
                чтобы клики работали как toggle чекбокса */}
            {!isSelectionMode && (
                <MessageContextMenu
                    open={contextMenuOpen}
                    onOpenChange={setContextMenuOpen}
                    position={contextMenuPosition}
                    isOwnMessage={isOwn}
                    onReply={
                        onReply ? handleReply : undefined
                    }
                    onForward={
                        onForward
                            ? handleForward
                            : undefined
                    }
                    onCopy={handleCopy}
                    onSelect={
                        onSelect ? handleSelect : undefined
                    }
                    onEdit={isOwn ? handleEdit : undefined}
                    onDelete={handleDelete}
                    onMenuItemClick={handleMenuItemClick}
                />
            )}

            <DeleteMessageModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                isOwnMessage={isOwn}
                chatName={chatName}
            />

            <CopyToast
                visible={copyToastVisible}
                onHide={handleHideCopyToast}
            />
        </>
    )
}
