'use client'

import ChatHeader from './ChatHeader'
import CallModal from './CallModal'
import CallTypeSelectorModal from './CallTypeSelectorModal'
import MessagesList from './MessagesList'
import SelectionToolbar from './SelectionToolbar'
import ForwardMessageModal from './ForwardMessageModal'
import DeleteMessageModal from './DeleteMessageModal'
import CopyToast from './CopyToast'
import MessageComposer from '@modules/message-composer/components/MessageComposer'
import { ChatItem } from '@shared/types/chat'
import { useCallback, useRef, useState } from 'react'
import { useWebSocket } from '@shared/context/websocketContext'
import { useMessages } from '@shared/hooks/useMessages'
import { cn } from '@shared/lib/utils'
import { useFloatingDate } from './useFloatingDate'
import { formatDividerDate } from './DateDivider'
import Cookies from 'js-cookie'
import { getUserIdFromToken } from '@shared/lib/getUserIdFromToken'
import { Spinner } from '@shared/ui/Spinner'
import { useChats } from '@shared/hooks/useChats'
import { useAppSelector } from '@redux/store'
import { MOCK_CURRENT_USER_ID } from '@shared/mocks/messages'
import PersonalChatSidebar from './PersonalChatSidebar'
import { useScrollToUnread } from '../hooks/useScrollToUnread'
import { useMessageActions } from '../hooks/useMessageActions'
import { useInChatSearch } from '../hooks/useInChatSearch'
import { useMarkAsRead } from '../hooks/useMarkAsRead'
import { useChatSidebar } from '../hooks/useChatSidebar'

/**
 * Корневой компонент комнаты чата — оркестратор взаимодействия.
 *
 * Делегирует бизнес-логику специализированным хукам:
 * - useMessageActions — редактирование, ответ, выбор, пересылка, удаление, копирование
 * - useInChatSearch — поиск по сообщениям с навигацией по результатам
 * - useMarkAsRead — пометка сообщений прочитанными + вычисление firstUnreadUid
 * - useChatSidebar — открытие/закрытие правой панели контакта
 *
 * Сам компонент отвечает только за:
 * - Определение currentUserId и параметров чата
 * - Загрузку сообщений (useMessages)
 * - Скролл и floating date pill
 * - Композицию JSX-layout из дочерних компонентов
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

    const isLocalChat = chat.isTemporary === true
    const chatName = chat.name

    // --- Подключение контекстов и хуков данных ---
    const { sendMessage, deleteMessage, markMessagesRead } =
        useWebSocket()
    const { chats, markAsRead, markAsReadOnServer } =
        useChats()

    // --- Делегирование бизнес-логики хукам ---
    const {
        editingMessage,
        replyingMessage,
        selectedMessages,
        isSelectionMode,
        forwardModalOpen,
        copyToastVisible,
        deleteSelectedModalOpen,
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
    } = useMessageActions({
        sendMessage,
        deleteMessage,
        chats,
    })

    const {
        isSearchOpen,
        searchQuery,
        currentMatchIndex,
        totalSearchResults,
        setCurrentMatchIndex,
        handleSearchOpen,
        handleSearchClose,
        handleSearchQueryChange,
        handleSearchMatchesFound,
        handleSearchNavigate,
    } = useInChatSearch()

    const {
        isSidebarOpen,
        sidebarContact,
        handleOpenSidebar,
        handleCloseSidebar,
        handleClearChat,
        handleNotificationsChange,
    } = useChatSidebar()

    // --- ВРЕМЕННО: состояние звонков для тестов UI ---
    const [isCallModalOpen, setIsCallModalOpen] =
        useState(false)
    const [
        isCallTypeSelectorOpen,
        setIsCallTypeSelectorOpen,
    ] = useState(false)
    const [callVariant, setCallVariant] = useState<
        'outgoing' | 'incoming'
    >('outgoing')

    const handleCallOpen = useCallback(() => {
        setIsCallTypeSelectorOpen(true)
    }, [])

    const handleCallClose = useCallback(() => {
        setIsCallModalOpen(false)
    }, [])

    const handleCallTypeSelect = useCallback(
        (variant: 'outgoing' | 'incoming') => {
            setCallVariant(variant)
            setIsCallTypeSelectorOpen(false)
            setIsCallModalOpen(true)
        },
        [],
    )

    // --- Загрузка сообщений ---
    const {
        messages: apiMessages,
        loading: messagesLoading,
    } = useMessages(chat.chat.uid, isLocalChat)

    // read_at приходит только от сервера через change_status_read_message —
    // не подставляем его оптимистично, чтобы галочки отражали реальный статус
    const optimisticApiMessages = apiMessages

    // --- Mark-as-read + firstUnreadUid ---
    const { firstUnreadUid, messagesReady } = useMarkAsRead(
        {
            chat,
            apiMessages,
            messagesLoading,
            currentUserId,
            markAsRead,
            markAsReadOnServer,
            markMessagesRead,
        },
    )

    // --- Скролл и floating date ---
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const activeTimestamp = useFloatingDate(
        scrollContainerRef,
    )

    useScrollToUnread(
        scrollContainerRef,
        firstUnreadUid,
        chat.chatKey,
        messagesReady,
    )

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
                onSidebarOpen={handleOpenSidebar}
            />

            <CallModal
                open={isCallModalOpen}
                onClose={handleCallClose}
                chat={chat}
                variant={callVariant}
            />

            <CallTypeSelectorModal
                open={isCallTypeSelectorOpen}
                onSelect={handleCallTypeSelect}
            />

            {/* Основной контент с адаптивной шириной */}
            <div
                className={cn(
                    `
                      relative flex min-h-0 flex-1 flex-col transition-all
                      duration-300 ease-in-out
                    `,
                    isSidebarOpen ? 'mr-80' : 'mr-0',
                )}
            >
                {/* Оверлей для мобильных устройств */}
                {isSidebarOpen && (
                    <div
                        className={`
                          absolute inset-0 z-40 bg-black/20
                          md:hidden
                        `}
                        onKeyDown={(e) => {
                            if (
                                e.key === 'Enter' ||
                                e.key === ' '
                            ) {
                                handleCloseSidebar()
                            }
                        }}
                        onClick={handleCloseSidebar}
                        role="button"
                        tabIndex={0}
                        aria-label="Закрыть sidebar"
                    />
                )}

                {/* Контейнер для MessagesList с floating date pill */}
                <div
                    ref={scrollContainerRef}
                    role="presentation"
                    className="flex-1 overflow-y-auto"
                    onClick={() => {
                        if (isSearchOpen) {
                            handleSearchClose()
                        }
                    }}
                >
                    {/* Floating date pill */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none sticky top-0 z-20 h-0"
                    >
                        <div
                            className={cn(
                                `
                                  flex justify-center pt-2 transition-opacity
                                  duration-200
                                `,
                                activeTimestamp
                                    ? 'opacity-100'
                                    : 'opacity-0',
                            )}
                        >
                            <time
                                className={cn(
                                    'rounded-lg',
                                    'bg-accent-violet-dark/60',
                                    'px-2',
                                    'py-0.5',
                                    'text-sm',
                                    'leading-[120%]',
                                    'font-medium',
                                    'text-white',
                                    'backdrop-blur-[4px]',
                                )}
                            >
                                {activeTimestamp
                                    ? formatDividerDate(
                                          activeTimestamp,
                                      )
                                    : ''}
                            </time>
                        </div>
                    </div>

                    {messagesLoading &&
                    apiMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <MessagesList
                            chatKey={chat.chatKey}
                            apiMessages={
                                optimisticApiMessages
                            }
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
                            onEditMessage={
                                handleEditMessage
                            }
                            onReplyMessage={
                                handleReplyMessage
                            }
                            onSelectMessage={
                                handleSelectMessage
                            }
                            onForwardMessage={
                                handleForwardMessage
                            }
                            isSelectionMode={
                                isSelectionMode
                            }
                            selectedMessages={
                                selectedMessages
                            }
                            chatName={chatName}
                            firstUnreadUid={firstUnreadUid}
                            searchQuery={
                                isSearchOpen
                                    ? searchQuery
                                    : ''
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
                        key={`${chat.id}-${
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
            </div>

            <ForwardMessageModal
                open={forwardModalOpen}
                onClose={handleForwardModalClose}
                onConfirm={handleForwardConfirm}
            />

            <DeleteMessageModal
                open={deleteSelectedModalOpen}
                onClose={handleDeleteModalClose}
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

            {/* Сайдбар информации о контакте */}
            {isSidebarOpen && sidebarContact && (
                <div
                    className={cn(
                        'absolute top-0 right-0 h-full w-80',
                        'z-50 shadow-xl',
                        'rounded-l-md bg-gray-main',
                        'border-l border-gray-border',
                        'transition-all duration-300 ease-in-out',
                    )}
                >
                    <PersonalChatSidebar
                        contact={sidebarContact}
                        chatKey={chat.chatKey}
                        chatUid={chat.chat.uid}
                        notificationsEnabled={false}
                        onNotificationsChange={
                            handleNotificationsChange
                        }
                        onClose={handleCloseSidebar}
                        onClearChat={handleClearChat}
                    />
                </div>
            )}
        </div>
    )
}
