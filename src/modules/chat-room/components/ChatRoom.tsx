'use client'

import ChatHeader from './ChatHeader'
import CallModal from './CallModal'
import MessagesList from './MessagesList'
import SelectionToolbar from './SelectionToolbar'
import ForwardMessageModal from './ForwardMessageModal'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import MessageComposer from '@modules/message-composer/components/MessageComposer'
import { ChatItem } from '@shared/types/chat'
import { Message } from '@shared/types/message'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useWebSocket } from '@shared/context/websocketContext'
import { useCurrentUserId } from '@shared/hooks/useCurrentUserId'
import { useMessages } from '@shared/hooks/useMessages'
import { cn } from '@shared/lib/utils'
import Cookies from 'js-cookie'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import { Spinner } from '@shared/ui/Spinner'
import { useChats } from '@shared/hooks/useChats'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'

/**
 * Корневой компонент комнаты чата — оркестратор взаимодействия.
 *
 * Управляет состоянием всех режимов работы с сообщениями:
 * - Режим редактирования (editingMessage) — редактирование собственного сообщения
 * - Режим ответа (replyingMessage) — ответ на любое сообщение
 * - Режим выбора (selectedMessages) — множественный выбор для пересылки/копирования/удаления
 * - Режим поиска (isSearchOpen) — поиск по содержимому сообщений с навигацией по результатам
 *
 * Режимы взаимоисключающие: при активации редактирования сбрасывается ответ и наоборот.
 * Режим выбора заменяет MessageComposer на SelectionToolbar в нижней части.
 *
 * Паттерн key на MessageComposer: при смене editingMessage/replyingMessage
 * React пересоздаёт компонент, сбрасывая внутренний state поля ввода.
 */
export default function ChatRoom({
    chat,
    onBack,
}: Readonly<{
    chat: ChatItem
    onBack?: () => void
}>) {
    const currentUser = useAppSelector(
        (state) => state.user.currentUser,
    ) as { id?: string } | null
    const currentUserId =
        currentUser?.id ||
        getUserIdFromToken(
            localStorage.getItem('access_token') ||
                Cookies.get('access_token'),
        ) ||
        MOCK_CURRENT_USER_ID

    // --- Состояние режимов работы с сообщениями ---
    /** Сообщение в режиме редактирования (null = режим неактивен) */
    const [editingMessage, setEditingMessage] =
        useState<Message | null>(null)
    /** Сообщение, на которое отвечает пользователь (null = режим неактивен) */
    const [replyingMessage, setReplyingMessage] =
        useState<Message | null>(null)
    /** Массив выбранных сообщений (пустой = режим выбора неактивен) */
    const [selectedMessages, setSelectedMessages] =
        useState<Message[]>([])

    // --- Состояние модальных окон ---
    const [forwardModalOpen, setForwardModalOpen] =
        useState(false)
    /** Сообщения для пересылки — может быть одно (из контекстного меню) или несколько (из тулбара) */
    const [messagesToForward, setMessagesToForward] =
        useState<Message[]>([])
    const [copyToastVisible, setCopyToastVisible] =
        useState(false)
    const [
        deleteSelectedModalOpen,
        setDeleteSelectedModalOpen,
    ] = useState(false)
    const [isCallModalOpen, setIsCallModalOpen] =
        useState(false)
    // ВРЕМЕННО: модалка выбора типа звонка для тестов UI.
    const [
        isCallTypeSelectorOpen,
        setIsCallTypeSelectorOpen,
    ] = useState(false)
    // ВРЕМЕННО: выбранный тип звонка для тестов UI.
    const [callVariant, setCallVariant] = useState<
        'outgoing' | 'incoming'
    >('outgoing')

    // --- Состояние режима поиска ---
    /** Флаг активности режима поиска. При true ChatHeader показывает InChatSearch. */
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    /** Поисковый запрос для фильтрации сообщений (case-insensitive) */
    const [searchQuery, setSearchQuery] = useState('')
    /**
     * Индекс текущего результата поиска в массиве совпадений (0-based).
     * null = нет активного результата, 0 = первый результат (нижний/последний по времени).
     */
    const [currentMatchIndex, setCurrentMatchIndex] =
        useState<number | null>(null)
    /** Общее количество найденных результатов. Обновляется через handleSearchMatchesFound. */
    const [totalSearchResults, setTotalSearchResults] =
        useState(0)

    const { sendMessage, deleteMessage, markMessagesRead } =
        useWebSocket()
    const { markAsRead, markAsReadOnServer } = useChats()

    /** Флаг режима выбора: активируется при первом выбранном сообщении */
    const isSelectionMode = selectedMessages.length > 0

    // Переход в режим редактирования: сбрасываем ответ,
    // чтобы одновременно не было двух режимов
    const handleEditMessage = (message: Message) => {
        setEditingMessage(message)
        setReplyingMessage(null)
    }

    // Переход в режим ответа: сбрасываем редактирование
    const handleReplyMessage = (message: Message) => {
        setReplyingMessage(message)
        setEditingMessage(null)
    }

    // Переключение выбора сообщения: toggle-логика (повторный клик снимает выделение)
    const handleSelectMessage = (message: Message) => {
        setSelectedMessages((prev) => {
            const isSelected = prev.some(
                (m) => m.uid === message.uid,
            )
            if (isSelected) {
                return prev.filter(
                    (m) => m.uid !== message.uid,
                )
            }
            return [...prev, message]
        })
    }

    // Пересылка одного сообщения из контекстного меню
    const handleForwardMessage = (message: Message) => {
        setMessagesToForward([message])
        setForwardModalOpen(true)
    }

    // Пересылка выбранных сообщений из тулбара
    const handleForwardSelected = () => {
        setMessagesToForward(selectedMessages)
        setForwardModalOpen(true)
    }

    /**
     * Подтверждение пересылки: отправляем каждое сообщение в каждый выбранный чат.
     *
     * Для каждого пересылаемого сообщения формируем объект ForwardedMessage
     * с метаданными автора (from_user, first_name, last_name), чтобы
     * компонент ForwardedMessage мог корректно отобразить источник.
     *
     * content корневого сообщения остаётся пустым — бэкенд берёт
     * текст из forwardedMessages[].content.
     */
    const handleForwardConfirm = (
        selectedChatKeys: string[],
    ) => {
        messagesToForward.forEach((msg) => {
            selectedChatKeys.forEach((chatKey) => {
                sendMessage({
                    chatKey,
                    content: '',
                    status: 'publish',
                    // uid оригинального сообщения — бэкенд сам
                    // подтянет контент и метаданные по UID
                    forwardedMessages: [
                        {
                            uid: msg.uid,
                            content: msg.content,
                            from_user: msg.from_user,
                        },
                    ],
                })
            })
        })

        setForwardModalOpen(false)
        setMessagesToForward([])
        setSelectedMessages([])
    }

    // Копирование выбранных сообщений из тулбара
    const handleCopySelected = () => {
        const text = selectedMessages
            .map((m) => m.content)
            .join('\n')
        navigator.clipboard.writeText(text)
        setCopyToastVisible(true)
        setSelectedMessages([])
    }

    const handleHideCopyToast = useCallback(() => {
        setCopyToastVisible(false)
    }, [])

    // Открытие модалки удаления для выбранных сообщений
    const handleDeleteSelected = () => {
        setDeleteSelectedModalOpen(true)
    }

    // Подтверждение удаления выбранных сообщений: отправляем запрос
    // на удаление каждого сообщения через WebSocket. Проверяем наличие uid и chatKey,
    // так как локальные (ещё не отправленные) сообщения могут их не иметь.
    const handleDeleteSelectedConfirm = (
        forAll: boolean,
    ) => {
        selectedMessages.forEach((msg) => {
            if (msg.uid && msg.chatKey) {
                deleteMessage({
                    uid: msg.uid,
                    chatKey: msg.chatKey,
                    forAll,
                })
            }
        })
        setDeleteSelectedModalOpen(false)
        setSelectedMessages([])
    }

    const handleClearSelection = () => {
        setSelectedMessages([])
    }

    const handleCancelEdit = () => {
        setEditingMessage(null)
    }

    const handleCancelReply = () => {
        setReplyingMessage(null)
    }

    const isLocalChat = chat.isTemporary === true
    /**
     * Определяем, является ли чат локальным (созданным только на клиенте).
     *
     * Локальные чаты — группы/каналы, созданные офлайн до первой
     * синхронизации с сервером. Для них API-загрузка истории не нужна.
     *
     * Проверка: chatKey === 'chat_key_0' (дефолтный ключ до назначения
     * сервером) И НЕ временный (isTemporary).
     *
     * ⚠️ Важно: нельзя проверять по chat.id > 1e12, потому что
     * при переходе временного чата в реальный (после отправки первого
     * сообщения) isTemporary сбрасывается в false, но id остаётся
     * большим — такая проверка ошибочно классифицирует конвертированный
     * чат как «локальный», и useMessages очистит историю (setMessages([])).
     *
     * Три типа чатов:
     * 1. Временный (isTemporary=true, chatKey='chat_key_0') → загружать API-историю
     * 2. Конвертированный (isTemporary=false, chatKey='chat_3401') → загружать
     * 3. Локальный (isTemporary=false, chatKey='chat_key_0') → НЕ загружать
     */

    /**
     * Открытие режима поиска.
     * Очищаем все состояния поиска для чистого старта.
     * ChatHeader переключается в режим InChatSearch при isSearchOpen === true.
     *
     * Vercel pattern: useCallback без зависимостей для стабильной ссылки.
     */
    const handleSearchOpen = useCallback(() => {
        setIsSearchOpen(true)
        setSearchQuery('')
        setCurrentMatchIndex(null)
        setTotalSearchResults(0)
    }, [])

    const handleCallOpen = useCallback(() => {
        // ВРЕМЕННО: открываем модалку выбора типа звонка.
        setIsCallTypeSelectorOpen(true)
    }, [])

    const handleCallClose = useCallback(() => {
        setIsCallModalOpen(false)
    }, [])

    // ВРЕМЕННО: выбор типа звонка для тестов UI.
    const handleCallTypeSelect = useCallback(
        (variant: 'outgoing' | 'incoming') => {
            setCallVariant(variant)
            setIsCallTypeSelectorOpen(false)
            setIsCallModalOpen(true)
        },
        [],
    )

    /**
     * Закрытие режима поиска.
     * Полностью очищаем состояние поиска и возвращаемся к обычному виду шапки.
     * ChatHeader автоматически переключится обратно в обычный режим.
     */
    const handleSearchClose = useCallback(() => {
        setIsSearchOpen(false)
        setSearchQuery('')
        setCurrentMatchIndex(null)
        setTotalSearchResults(0)
    }, [])

    /**
     * Изменение поискового запроса.
     * При вводе нового текста сбрасываем currentMatchIndex в null,
     * чтобы MessagesList пересчитал совпадения и установил индекс на первый результат (снизу).
     *
     * Также сбрасываем totalSearchResults в 0, чтобы избежать показа "0 из N"
     * в момент между вводом и пересчётом результатов.
     *
     */
    const handleSearchQueryChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            // Сброс индекса и счётчика: новый поиск начинается заново
            setCurrentMatchIndex(null)
            setTotalSearchResults(0)
        },
        [],
    )

    /**
     * Callback вызываемый MessagesList когда пересчитаны совпадения.
     * Обновляем totalSearchResults и при первом результате устанавливаем индекс.
     *
     * Логика инициализации индекса:
     * - Если найдены результаты (count > 0)
     * - И текущий индекс не установлен (currentMatchIndex === null)
     * - И есть активный поисковый запрос
     * → Устанавливаем индекс 0, который соответствует последнему (нижнему) результату
     *
     * Почему 0 = нижний результат:
     * MessagesList возвращает индексы в порядке снизу вверх согласно дизайну.
     */
    const handleSearchMatchesFound = useCallback(
        (count: number) => {
            setTotalSearchResults(count)

            // Автоматическая установка индекса при первом результате
            if (
                count > 0 &&
                currentMatchIndex === null &&
                searchQuery
            ) {
                setCurrentMatchIndex(0)
            }
        },
        [currentMatchIndex, searchQuery],
    )

    /**
     * Навигация по результатам поиска.
     *
     * matchingMessageIndices упорядочен сверху вниз (индекс 0 = самый старый/верхний).
     *
     * Направления:
     * - 'up' → переход к более старым сообщениям (индекс уменьшается)
     * - 'down' → переход к более новым сообщениям (индекс увеличивается)
     *
     * Циклическая навигация (wrap around):
     * - При достижении верха → переход к самому новому (индекс totalSearchResults - 1)
     * - При достижении низа → переход к самому старому (индекс 0)
     *
     */
    const handleSearchNavigate = useCallback(
        (direction: 'up' | 'down') => {
            if (totalSearchResults === 0) return

            setCurrentMatchIndex((prev) => {
                // Граничный случай: индекс не установлен
                if (prev === null) return 0

                if (direction === 'up') {
                    // Навигация вверх: к более старым сообщениям (меньший индекс)
                    // Если достигли верха → переход к самому новому (циклическая навигация)
                    return prev - 1 < 0
                        ? totalSearchResults - 1
                        : prev - 1
                } else {
                    // Навигация вниз: к более новым сообщениям (больший индекс)
                    // Если достигли низа → переход к самому старому (циклическая навигация)
                    return prev + 1 >= totalSearchResults
                        ? 0
                        : prev + 1
                }
            })
        },
        [totalSearchResults],
    )

    const chatName = chat.name
    // Загрузка сообщений из API
    const {
        messages: apiMessages,
        loading: messagesLoading,
        reloadMessages,
    } = useMessages(chat.chat.uid, isLocalChat)

    const readMessageUidsRef = useRef(new Set<string>())
    const lastSeenRef = useRef<string | null>(null)

    useEffect(() => {
        if (!isLocalChat) {
            reloadMessages()
        }
    }, [chat.chatKey, isLocalChat, reloadMessages])

    // Оптимистично считаем свои сообщения прочитанными, чтобы галочки не сбрасывались после перезагрузки
    const optimisticApiMessages = useMemo(() => {
        return apiMessages.map((message) => {
            if (
                message.from_user == currentUserId &&
                !message.read_at
            ) {
                const readAt =
                    message.created_at ||
                    message.delivered_at

                if (!readAt) {
                    return message
                }

                return {
                    ...message,
                    delivered_at:
                        message.delivered_at || readAt,
                    read_at: readAt,
                }
            }

            return message
        })
    }, [apiMessages, currentUserId])

    useEffect(() => {
        if (!chat?.id) return
        if (apiMessages.length === 0) return

        // Обновляем локальный state чатов, чтобы в списке не было непрочитанных
        markAsRead(chat.id)

        if (chat.lastMessage?.id) {
            const lastSeenKey = `${chat.id}:${chat.lastMessage.id}`
            if (lastSeenRef.current !== lastSeenKey) {
                lastSeenRef.current = lastSeenKey
                // Фиксируем на сервере last_seen_message, чтобы статус сохранялся после перезагрузки
                markAsReadOnServer(
                    chat.id,
                    chat.lastMessage.id,
                )
            }
        }

        const unreadIncoming = apiMessages
            .filter(
                (message) =>
                    message.uid &&
                    !message.read_at &&
                    message.from_user &&
                    message.from_user !== currentUserId,
            )
            .map((message) => message.uid!)
            .filter(
                (uid) =>
                    !readMessageUidsRef.current.has(uid),
            )

        if (unreadIncoming.length) {
            unreadIncoming.forEach((uid) =>
                readMessageUidsRef.current.add(uid),
            )
            markMessagesRead({
                chatKey: chat.chatKey,
                messageUids: unreadIncoming,
            })
        }
    }, [
        apiMessages,
        chat.chatKey,
        chat.id,
        chat.lastMessage?.id,
        currentUserId,
        markAsRead,
        markAsReadOnServer,
        markMessagesRead,
    ])

    return (
        <div className="relative flex h-full flex-col rounded-md bg-gray-light">
            <ChatHeader
                chat={chat || null}
                onBack={onBack}
                onSearchOpen={handleSearchOpen}
                onCall={handleCallOpen}
                isSearchOpen={isSearchOpen}
                searchQuery={searchQuery}
                onSearchQueryChange={
                    handleSearchQueryChange
                }
                onSearchNavigate={handleSearchNavigate}
                onSearchClose={handleSearchClose}
                currentMatchIndex={currentMatchIndex}
                totalSearchResults={totalSearchResults}
            />

            <CallModal
                open={isCallModalOpen}
                onClose={handleCallClose}
                chat={chat}
                variant={callVariant}
            />

            {/* ВРЕМЕННО: модалка выбора типа звонка для тестов UI. */}
            {isCallTypeSelectorOpen && (
                <div
                    className={cn(
                        'fixed',
                        'inset-0',
                        'z-[60]',
                        'flex',
                        'items-center',
                        'justify-center',
                        'bg-black/40',
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Выбор типа звонка"
                >
                    <div
                        className={cn(
                            'w-[320px]',
                            'rounded-xl',
                            'bg-white',
                            'px-6',
                            'py-5',
                            'text-center',
                            'shadow-lg',
                        )}
                    >
                        <p className="text-base font-semibold text-text-black">
                            Тесты звонков
                        </p>
                        <div className="mt-5 flex flex-col gap-3">
                            <button
                                type="button"
                                className={cn(
                                    'rounded-lg',
                                    'bg-accent-violet-primary',
                                    'px-4',
                                    'py-2',
                                    'text-sm',
                                    'font-semibold',
                                    'text-white',
                                )}
                                onClick={() =>
                                    handleCallTypeSelect(
                                        'incoming',
                                    )
                                }
                            >
                                Тебе звонят
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'rounded-lg',
                                    'border',
                                    'border-accent-violet-primary',
                                    'px-4',
                                    'py-2',
                                    'text-sm',
                                    'font-semibold',
                                    'text-accent-violet-primary',
                                )}
                                onClick={() =>
                                    handleCallTypeSelect(
                                        'outgoing',
                                    )
                                }
                            >
                                Ты звонишь
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-text-gray">
                            Только для тестов звонков
                        </p>
                    </div>
                </div>
            )}

            <div
                role="presentation"
                className="flex-1 overflow-y-auto"
                onClick={() => {
                    if (isSearchOpen) {
                        handleSearchClose()
                    }
                }}
            >
                {messagesLoading &&
                apiMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <MessagesList
                        chatKey={chat.chatKey}
                        apiMessages={optimisticApiMessages}
                        contactUid={
                            chat.tempContactUid ||
                            chat.chat.uid
                        }
                        isTemporary={chat.isTemporary}
                        currentUserId={currentUserId}
                        peerUid={
                            chat.chatType === 'chat'
                                ? chat.chat.uid
                                : undefined
                        }
                        onEditMessage={handleEditMessage}
                        onReplyMessage={handleReplyMessage}
                        onSelectMessage={
                            handleSelectMessage
                        }
                        onForwardMessage={
                            handleForwardMessage
                        }
                        isSelectionMode={isSelectionMode}
                        selectedMessages={selectedMessages}
                        chatName={chatName}
                        searchQuery={
                            isSearchOpen ? searchQuery : ''
                        }
                        currentMatchIndex={
                            currentMatchIndex
                        }
                        onSearchMatchesFound={
                            handleSearchMatchesFound
                        }
                        onSearchNavigate={
                            setCurrentMatchIndex
                        }
                    />
                )}
            </div>

            {/* Нижняя панель: в режиме выбора — тулбар с действиями,
                иначе — поле ввода сообщения (MessageComposer) */}
            {isSelectionMode ? (
                <SelectionToolbar
                    selectedMessages={selectedMessages}
                    onClose={handleClearSelection}
                    onForward={handleForwardSelected}
                    onCopy={handleCopySelected}
                    onDelete={handleDeleteSelected}
                />
            ) : (
                <MessageComposer
                    key={`${chat.chatKey}-${
                        editingMessage?.uid ??
                        replyingMessage?.uid ??
                        'new'
                    }`}
                    toUserId={chat.chat.uid}
                    chatKey={chat.chatKey}
                    editingMessage={editingMessage}
                    replyingMessage={replyingMessage}
                    onCancelEdit={handleCancelEdit}
                    onCancelReply={handleCancelReply}
                />
            )}

            <ForwardMessageModal
                open={forwardModalOpen}
                onClose={() => {
                    setForwardModalOpen(false)
                    setMessagesToForward([])
                }}
                onConfirm={handleForwardConfirm}
            />

            <DeleteMessageModal
                open={deleteSelectedModalOpen}
                onClose={() =>
                    setDeleteSelectedModalOpen(false)
                }
                onConfirm={handleDeleteSelectedConfirm}
                isOwnMessage={selectedMessages.every(
                    (m) => m.from_user === currentUserId,
                )}
                chatName={chatName}
            />

            <CopyToast
                visible={copyToastVisible}
                onHide={handleHideCopyToast}
            />
        </div>
    )
}
