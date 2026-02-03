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
import { useState, useCallback } from 'react'
import { useWebSocket } from '@shared/context/websocketContext'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'

/**
 * Корневой компонент комнаты чата — оркестратор взаимодействия.
 *
 * Управляет состоянием всех режимов работы с сообщениями:
 * - Режим редактирования (editingMessage) — редактирование собственного сообщения
 * - Режим ответа (replyingMessage) — ответ на любое сообщение
 * - Режим выбора (selectedMessages) — множественный выбор для пересылки/копирования/удаления
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
        currentUser?.id || MOCK_CURRENT_USER_ID

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

    // Подтверждение пересылки: отправляем каждое сообщение в каждый выбранный чат.
    // content пустой — бэкенд берёт текст из forwardedMessages.
    // После отправки сбрасываем все связанные состояния.
    const handleForwardConfirm = (
        selectedChatKeys: string[],
    ) => {
        messagesToForward.forEach((msg) => {
            selectedChatKeys.forEach((chatKey) => {
                sendMessage({
                    chatKey,
                    content: '',
                    status: 'publish',
                    forwardedMessages: [
                        { content: msg.content },
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

    const chatName = chat.name

    return (
        <div className="relative flex h-full flex-col rounded-md bg-gray-light">
            <ChatHeader
                chat={chat || null}
                onBack={onBack}
            />
            <div className="flex-1 overflow-y-auto">
                <MessagesList
                    chatKey={chat.chatKey}
                    onEditMessage={handleEditMessage}
                    onReplyMessage={handleReplyMessage}
                    onSelectMessage={handleSelectMessage}
                    onForwardMessage={handleForwardMessage}
                    isSelectionMode={isSelectionMode}
                    selectedMessages={selectedMessages}
                    chatName={chatName}
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
                    (m) => m.from_user == currentUserId,
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
