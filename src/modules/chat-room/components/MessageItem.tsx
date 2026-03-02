'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import Cookies from 'js-cookie'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import { MessageContextMenu } from './MessageContextMenu'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import MessageBubbleContent from './MessageBubbleContent'
import Image from 'next/image'
import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from 'react'
import { cn } from '@shared/lib/utils'
import { useWebSocket } from '@shared/context/websocketContext'
import { getReadStatus } from './messageUtils'

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
    readonly currentUserId?: string
    readonly peerUid?: string
    readonly onEdit?: (message: Message) => void
    readonly onReply?: (message: Message) => void
    readonly onSelect?: (message: Message) => void
    readonly onForward?: (message: Message) => void
    readonly onNavigateToMessage?: (uid: string) => void
    /** Режим множественного выбора: показывает чекбоксы, меняет поведение кликов */
    readonly isSelectionMode?: boolean
    readonly isSelected?: boolean
    /** Имя собеседника — для персонализации текста в модалке удаления */
    readonly chatName?: string
    /** Поисковый запрос для подсветки совпадений */
    readonly searchQuery?: string
    /** Флаг: данное сообщение является текущим результатом поиска */
    readonly isCurrentMatch?: boolean
    /** Map сообщений чата по uid — для O(1) обогащения replied-сообщений */
    readonly messagesMap?: Map<string, Message>
}

const MessageItem = memo(function MessageItem({
    message,
    currentUserId: currentUserIdOverride,
    peerUid,
    onEdit,
    onReply,
    onSelect,
    onForward,
    onNavigateToMessage,
    isSelectionMode = false,
    isSelected = false,
    chatName,
    searchQuery = '',
    isCurrentMatch = false,
    messagesMap,
}: MessageItemProps) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null

    // Мемоизация userId — getUserIdFromToken парсит JWT на каждый вызов,
    // пересчитываем только при смене currentUser
    const derivedUserId = useMemo(
        () =>
            currentUser?.id ||
            getUserIdFromToken(
                localStorage.getItem('access_token') ||
                    Cookies.get('access_token'),
            ) ||
            MOCK_CURRENT_USER_ID,
        [currentUser?.id],
    )

    const currentUserId =
        currentUserIdOverride || derivedUserId

    // Нестрогое сравнение (==) — from_user может быть числом, currentUserId — строкой
    // Если не удалось определить currentUserId, в личном чате считаем все сообщения
    // НЕ от peerUid своими (fallback для корректного выравнивания)
    const isOwn =
        currentUserId === MOCK_CURRENT_USER_ID && peerUid
            ? message.from_user != peerUid
            : message.from_user == currentUserId
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

    // --- Ref для скроллинга к результату поиска ---
    /**
     * Ref на DOM-элемент пузыря сообщения для программного скроллинга.
     *
     * Vercel pattern (rerender-use-ref-transient-values):
     * - useRef вместо useState для значений без необходимости re-render
     * - Обновление ref не вызывает перерисовку компонента
     * - Используется только для прямых DOM-манипуляций (скроллинг)
     */
    const messageRef = useRef<HTMLDivElement>(null)

    /**
     * Автоматический скроллинг к текущему результату поиска.
     *
     * Срабатывает когда:
     * - isCurrentMatch становится true (пользователь навигирует на это сообщение)
     * - messageRef.current доступен (DOM-элемент смонтирован)
     *
     * Параметры scrollIntoView:
     * - behavior: 'smooth' — плавная анимация скроллинга
     * - block: 'center' — позиционирование в центре экрана для лучшей видимости
     *
     * Зависимости: только [isCurrentMatch], чтобы избежать лишних скроллингов.
     */
    useEffect(() => {
        if (isCurrentMatch && messageRef.current) {
            messageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
    }, [isCurrentMatch])

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
                        ref={messageRef}
                        data-message-bubble
                        onContextMenu={handleContextMenu}
                        aria-label={
                            /**
                             * Формируем aria-label с учётом типа сообщения:
                             * - Обычное: «Ваше сообщение: текст» / «Сообщение: текст»
                             * - Пересланное без текста: «Пересланное сообщение»
                             */
                            message.content
                                ? isOwn
                                    ? `Ваше сообщение: ${message.content}`
                                    : `Сообщение: ${message.content}`
                                : message.forwardedMessages
                                        ?.length
                                  ? 'Пересланное сообщение'
                                  : 'Сообщение'
                        }
                        style={{
                            maxWidth:
                                'var(--message-max-width)',
                        }}
                        className={cn(
                            `
                              cursor-context-menu overflow-hidden rounded-lg
                              px-4 py-2 text-text-black transition-all
                              duration-300
                              hover:shadow-md
                            `,
                            isOwn
                                ? 'bg-teal-secondary'
                                : 'bg-message-bg-other',
                            isDeleting && 'opacity-50',
                            isCurrentMatch &&
                                `
                                  shadow-lg ring-2 shadow-system-blue/25
                                  ring-system-blue
                                `,
                        )}
                    >
                        <MessageBubbleContent
                            message={message}
                            readStatus={readStatus}
                            searchQuery={searchQuery}
                            messagesMap={messagesMap}
                            onNavigateToMessage={
                                onNavigateToMessage
                            }
                        />
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
})

export default MessageItem
