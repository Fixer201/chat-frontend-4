'use client'

import ChatHeader from './ChatHeader'
import MessagesList from './MessagesList'
import SelectionToolbar from './SelectionToolbar'
import ForwardMessageModal from './ForwardMessageModal'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import MessageComposer from '@modules/message-composer/components/MessageComposer'
import { ChatItem } from '@shared/types/chat'
import { Message } from '@shared/types/message'
import { useCallback, useState } from 'react'
import { useWebSocket } from '@shared/context/websocketContext'
import { useCurrentUserId } from '@shared/hooks/useCurrentUserId'
import { useMessages } from '@shared/hooks/useMessages'

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
    const currentUserId = useCurrentUserId()

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

    const { sendMessage, deleteMessage } = useWebSocket()

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
    const isLocalChat =
        chat.chatKey === 'chat_key_0' && !chat.isTemporary

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
    const { messages: apiMessages } = useMessages(
        chat.chat.uid,
        isLocalChat,
    )

    return (
        <div className="relative flex h-full flex-col rounded-md bg-gray-light">
            <ChatHeader
                chat={chat || null}
                onBack={onBack}
                onSearchOpen={handleSearchOpen}
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

            <div
                role="presentation"
                className="flex-1 overflow-y-auto"
                onClick={() => {
                    if (isSearchOpen) {
                        handleSearchClose()
                    }
                }}
            >
                <MessagesList
                    chatKey={chat.chatKey}
                    apiMessages={apiMessages}
                    contactUid={
                        chat.tempContactUid || chat.chat.uid
                    }
                    isTemporary={chat.isTemporary}
                    onEditMessage={handleEditMessage}
                    onReplyMessage={handleReplyMessage}
                    onSelectMessage={handleSelectMessage}
                    onForwardMessage={handleForwardMessage}
                    isSelectionMode={isSelectionMode}
                    selectedMessages={selectedMessages}
                    chatName={chatName}
                    searchQuery={
                        isSearchOpen ? searchQuery : ''
                    }
                    currentMatchIndex={currentMatchIndex}
                    onSearchMatchesFound={
                        handleSearchMatchesFound
                    }
                    onSearchNavigate={setCurrentMatchIndex}
                />
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
                    key={
                        editingMessage?.uid ??
                        replyingMessage?.uid ??
                        'new'
                    }
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
