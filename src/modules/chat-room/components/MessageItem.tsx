'use client'

import { Message } from '@shared/types/message'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import Cookies from 'js-cookie'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import SentIcon from '@public/images/messageStatus/sent.svg'
import DeliveredIcon from '@public/images/messageStatus/delivered.svg'
import ReadIcon from '@public/images/messageStatus/read.svg'
import { MessageContextMenu } from './MessageContextMenu'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import ForwardedMessage from './ForwardedMessage'
import MessageFileAttachment from './MessageFileAttachment'
import RepliedMessage from './RepliedMessage'
import Image from 'next/image'
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useTransition,
} from 'react'
import { cn } from '@shared/lib/utils'
import { useWebSocket } from '@shared/context/websocketContext'
import { highlightText } from '@shared/lib/highlightText'

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
}: MessageItemProps) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null

    const derivedUserId =
        currentUser?.id ||
        getUserIdFromToken(
            localStorage.getItem('access_token') ||
                Cookies.get('access_token'),
        ) ||
        MOCK_CURRENT_USER_ID

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
                        {/*
                            Контент пузыря сообщения.

                            Пересылка и текст пользователя — взаимоисключающие:
                            - forwardedMessages → заголовок «Переслано от» + текст пересылки
                            - repliedMessages → карточка-цитата + текст ответа
                            - Обычное сообщение → только message.content

                            Ответ (reply) может сосуществовать с текстом пользователя:
                            карточка-цитата сверху + текст ответа снизу.
                        */}

                        {/* Цитаты: ответы на другие сообщения.
                            Карточка с фиолетовой полоской слева, имя автора + текст оригинала. */}
                        {message.repliedMessages &&
                        message.repliedMessages.length > 0
                            ? message.repliedMessages.map(
                                  (replied, idx) => (
                                      <RepliedMessage
                                          key={
                                              replied.uid ??
                                              `reply-${idx}`
                                          }
                                          repliedMessage={
                                              replied
                                          }
                                          onNavigateToOriginal={
                                              onNavigateToMessage
                                          }
                                      />
                                  ),
                              )
                            : null}

                        {message.forwardedMessages &&
                        message.forwardedMessages.length >
                            0 ? (
                            <>
                                {/*
                                    Пересланное сообщение: заголовок + текст.
                                    Заголовок: «Переслано от» + аватар + имя автора (фиолетовый).
                                    Текст: полный контент пересланного сообщения (без обрезки).
                                    message.content всегда пустой при наличии forwardedMessages.
                                */}
                                {message.forwardedMessages.map(
                                    (forwarded, idx) => (
                                        <ForwardedMessage
                                            key={
                                                forwarded.uid ??
                                                `fwd-${idx}`
                                            }
                                            forwardedMessage={
                                                forwarded
                                            }
                                        />
                                    ),
                                )}
                                {/* Текст пересланного сообщения — основной контент пузыря */}
                                {message.forwardedMessages.map(
                                    (forwarded, idx) =>
                                        forwarded.content ? (
                                            <div
                                                key={`fwd-text-${forwarded.uid ?? idx}`}
                                                className={`
                                                  cursor-text text-base
                                                  font-normal break-all
                                                  whitespace-pre-wrap
                                                `}
                                            >
                                                {
                                                    forwarded.content
                                                }
                                            </div>
                                        ) : null,
                                )}
                            </>
                        ) : null}

                        {/*
                            Файловые вложения.

                            Рендерятся перед текстом (как в Telegram), потому что
                            файл — основной контент сообщения, а текст — подпись (caption).

                            MessageComposer отправляет каждый файл отдельным сообщением,
                            поэтому на практике files.length обычно = 1, но массив
                            поддерживает и множественные вложения (на случай изменения
                            логики отправки или если бэкенд вернёт несколько файлов).

                            isSending определяется по message.status === 'sending' —
                            это optimistic-сообщение, файл ещё загружается на сервер.
                            В этом случае вместо миниатюры показывается спиннер.
                        */}
                        {/*
                            Файловые вложения.

                            Дизайн-референс: public/images_chat_block.jpg, public/files_sendigg.jpg

                            Когда сообщение содержит только файл (без текстовой подписи),
                            время и статус прочтения интегрируются прямо в строку файла:
                              [icon] [filename.............]
                                     [size       21:49  ✓✓]

                            Если есть и файл, и текст — время остаётся в текстовой области
                            ниже (как обычно), чтобы не дублировать.

                            hasTextContent проверяет trim(), потому что сервер ставит
                            content = " " (пробел) для файловых сообщений без подписи.
                        */}
                        {(() => {
                            const hasFiles =
                                message.files &&
                                message.files.length > 0
                            const hasTextContent =
                                !!message.content?.trim()

                            // Элемент «время + статус» — переиспользуется в файле или ниже
                            const timeElement =
                                message.created_at ? (
                                    <div
                                        className={`
                                          flex shrink-0 items-center gap-1
                                          text-sm whitespace-nowrap
                                          text-text-gray
                                        `}
                                    >
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
                                            status={
                                                readStatus
                                            }
                                        />
                                    </div>
                                ) : null

                            return (
                                <>
                                    {hasFiles ? (
                                        <div className="flex flex-col">
                                            {message.files!.map(
                                                (
                                                    file,
                                                    idx,
                                                ) => {
                                                    return (
                                                        <MessageFileAttachment
                                                            key={`file-${idx}`}
                                                            file={
                                                                file
                                                            }
                                                            isSending={
                                                                message.status ===
                                                                'sending'
                                                            }
                                                            onCancel={
                                                                undefined
                                                            }
                                                            timeSlot={
                                                                // Время встраивается в ПОСЛЕДНИЙ файл,
                                                                // только если нет текстовой подписи
                                                                !hasTextContent &&
                                                                idx ===
                                                                    message
                                                                        .files!
                                                                        .length -
                                                                        1
                                                                    ? timeElement
                                                                    : undefined
                                                            }
                                                        />
                                                    )
                                                },
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Текст + время: показываем только если есть текст,
                                        или если нет файлов (обычное текстовое сообщение) */}
                                    {(hasTextContent ||
                                        !hasFiles) && (
                                        <div
                                            className={`
                                              flex items-end justify-between
                                              gap-2
                                            `}
                                        >
                                            {message.content?.trim() ? (
                                                <div
                                                    className={`
                                                      cursor-text text-base
                                                      font-normal break-all
                                                      whitespace-pre-wrap
                                                    `}
                                                >
                                                    {searchQuery ? (
                                                        <>
                                                            {/*
                                                Подсветка совпадений поиска.

                                                highlightText() разбивает текст на сегменты:
                                                - isMatch: true → совпадение с поисковым запросом
                                                - isMatch: false → обычный текст

                                                Vercel pattern: highlightText использует module-level cache,
                                                поэтому useMemo здесь не нужен (избегаем двойной мемоизации).
                                            */}
                                                            {highlightText(
                                                                message.content,
                                                                searchQuery,
                                                            ).map(
                                                                (
                                                                    segment,
                                                                    i,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            i
                                                                        }
                                                                        className={
                                                                            segment.isMatch
                                                                                ? `
                                                                                  rounded-sm
                                                                                  bg-system-blue/20
                                                                                  font-semibold
                                                                                  text-system-blue
                                                                                `
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {
                                                                            segment.text
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </>
                                                    ) : (
                                                        message.content
                                                    )}
                                                    {/* Показываем «(изменено)» только для реально отредактированных сообщений.
                                                        Поле isEdited устанавливается клиентом при получении
                                                        action: update_message по WebSocket. Нельзя полагаться
                                                        на сравнение updated_at !== created_at — бэкенд обновляет
                                                        updated_at при любом изменении (прочтение, статус),
                                                        а не только при редактировании текста. */}
                                                    {message.isEdited && (
                                                        <span
                                                            className={`
                                                              ml-1 text-xs
                                                              text-text-gray
                                                            `}
                                                        >
                                                            (изменено)
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null}
                                            {message.created_at && (
                                                <div
                                                    className={`
                                                      flex shrink-0 items-center
                                                      gap-1 text-sm
                                                      whitespace-nowrap
                                                      text-text-gray
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
                                                        status={
                                                            readStatus
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )
                        })()}
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
