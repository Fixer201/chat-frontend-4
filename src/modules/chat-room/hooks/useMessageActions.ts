import { useState, useCallback } from 'react'
import { Message } from '@shared/types/message'
import { ChatItem } from '@shared/types/chat'

interface UseMessageActionsParams {
    sendMessage: (message: Message) => void
    deleteMessage: (params: {
        uid: string
        chatKey: string
        forAll: boolean
    }) => void
    chats: ChatItem[]
}

/**
 * Хук управления действиями с сообщениями.
 *
 * Инкапсулирует все режимы работы с сообщениями:
 * - Редактирование и ответ (взаимоисключающие — активация одного сбрасывает другой)
 * - Множественный выбор (для пересылки, копирования, удаления)
 * - Пересылка (одно сообщение из контекстного меню или пакетно из тулбара)
 * - Копирование текста выбранных сообщений в буфер обмена
 * - Удаление выбранных сообщений через WebSocket
 *
 * Выделен из ChatRoom, чтобы оркестратор не содержал ~150 строк
 * бизнес-логики действий с сообщениями.
 */
export function useMessageActions({
    sendMessage,
    deleteMessage,
    chats,
}: UseMessageActionsParams) {
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

    /** Флаг режима выбора: активируется при первом выбранном сообщении */
    const isSelectionMode = selectedMessages.length > 0

    // Переход в режим редактирования: сбрасываем ответ,
    // чтобы одновременно не было двух режимов
    const handleEditMessage = useCallback(
        (message: Message) => {
            setEditingMessage(message)
            setReplyingMessage(null)
        },
        [],
    )

    // Переход в режим ответа: сбрасываем редактирование
    const handleReplyMessage = useCallback(
        (message: Message) => {
            setReplyingMessage(message)
            setEditingMessage(null)
        },
        [],
    )

    // Переключение выбора сообщения: toggle-логика (повторный клик снимает выделение)
    const handleSelectMessage = useCallback(
        (message: Message) => {
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
        },
        [],
    )

    // Пересылка одного сообщения из контекстного меню
    const handleForwardMessage = useCallback(
        (message: Message) => {
            setMessagesToForward([message])
            setForwardModalOpen(true)
        },
        [],
    )

    // Пересылка выбранных сообщений из тулбара
    const handleForwardSelected = useCallback(() => {
        setMessagesToForward(selectedMessages)
        setForwardModalOpen(true)
    }, [selectedMessages])

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
    const handleForwardConfirm = useCallback(
        (selectedChatKeys: string[]) => {
            messagesToForward.forEach((msg) => {
                selectedChatKeys.forEach((chatKey) => {
                    // WS API: для личных чатов — to_user_uid,
                    // для групп/каналов — chat_key.
                    // Ищем целевой чат, чтобы определить тип и получить uid собеседника.
                    const targetChat = chats.find(
                        (c) => c.chatKey === chatKey,
                    )
                    const toUserId =
                        targetChat?.chatType === 'chat'
                            ? targetChat.chat.uid
                            : undefined

                    sendMessage({
                        chatKey,
                        content: '',
                        status: 'publish',
                        toUserId,
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
        },
        [messagesToForward, chats, sendMessage],
    )

    // Копирование выбранных сообщений из тулбара
    const handleCopySelected = useCallback(() => {
        const text = selectedMessages
            .map((m) => m.content)
            .join('\n')
        navigator.clipboard.writeText(text)
        setCopyToastVisible(true)
        setSelectedMessages([])
    }, [selectedMessages])

    const handleHideCopyToast = useCallback(() => {
        setCopyToastVisible(false)
    }, [])

    // Открытие модалки удаления для выбранных сообщений
    const handleDeleteSelected = useCallback(() => {
        setDeleteSelectedModalOpen(true)
    }, [])

    // Подтверждение удаления выбранных сообщений: отправляем запрос
    // на удаление каждого сообщения через WebSocket. Проверяем наличие uid и chatKey,
    // так как локальные (ещё не отправленные) сообщения могут их не иметь.
    const handleDeleteSelectedConfirm = useCallback(
        (forAll: boolean) => {
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
        },
        [selectedMessages, deleteMessage],
    )

    const handleClearSelection = useCallback(() => {
        setSelectedMessages([])
    }, [])

    const handleCancelEdit = useCallback(() => {
        setEditingMessage(null)
    }, [])

    const handleCancelReply = useCallback(() => {
        setReplyingMessage(null)
    }, [])

    // Закрытие модалки пересылки без подтверждения
    const handleForwardModalClose = useCallback(() => {
        setForwardModalOpen(false)
        setMessagesToForward([])
    }, [])

    // Закрытие модалки удаления без подтверждения
    const handleDeleteModalClose = useCallback(() => {
        setDeleteSelectedModalOpen(false)
    }, [])

    return {
        // Состояние
        editingMessage,
        replyingMessage,
        selectedMessages,
        isSelectionMode,
        forwardModalOpen,
        copyToastVisible,
        deleteSelectedModalOpen,

        // Обработчики
        handleEditMessage,
        handleReplyMessage,
        handleSelectMessage,
        handleForwardMessage,
        handleForwardSelected,
        handleForwardConfirm,
        handleForwardModalClose,
        handleCopySelected,
        handleHideCopyToast,
        handleDeleteSelected,
        handleDeleteSelectedConfirm,
        handleDeleteModalClose,
        handleClearSelection,
        handleCancelEdit,
        handleCancelReply,
    }
}
