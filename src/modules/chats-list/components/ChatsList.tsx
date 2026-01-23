// ChatsList.tsx
'use client'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'
import ChatDeleteModal from './ChatDeleteModal'
import ChatSuccessToast from './ChatSuccessToast'
import EmptySearchState from '../../../shared/ui/emptySearchState/EmptySearchState'
import EmptyChatsState from './emptyChatsState/EmptyChatsState'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import { useRouter } from 'next/navigation'
import Search from '@shared/ui/Search'
import CreateMenuButton from './CreateMenuButton'
import { cn } from '@shared/lib/utils'
import { Contact } from '@shared/types/contact'

interface ChatsListProps {
    onCreateGroup?: () => void
    onCreateChannel?: () => void
}

export default function ChatsList({
    onCreateGroup,
    onCreateChannel,
}: ChatsListProps) {
    const router = useRouter()
    const [searchValue, setSearchValue] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [successToastOpen, setSuccessToastOpen] =
        useState(false)
    const [addedContactName, setAddedContactName] =
        useState('')
    const [chatToDelete, setChatToDelete] = useState<{
        id: number
        name: string
    } | null>(null)

    const {
        chats,
        loading,
        loadChats,
        chatSettings,
        toggleFavorite: handleFavoriteChat,
        toggleNotifications: handleMuteChat,
        markAsRead: handleMarkAsRead,
        markAsUnread: handleMarkAsUnread,
        deleteChat,
        addToContacts,
        selectedChatId,
        selectChat,
        createGroup,
        createChannel,
    } = useChats()

    // Добавим отладочное логирование
    useEffect(() => {
        console.log('🔍 ChatsList - текущие чаты:', {
            totalChats: chats?.length || 0,
            chats: chats?.map((chat) => ({
                id: chat.id,
                name: chat.name,
                type: chat.chatType,
                isDeleted: chatSettings[chat.id]?.isDeleted,
                hasSettings: !!chatSettings[chat.id],
            })),
            chatSettingsKeys: Object.keys(chatSettings),
        })
    }, [chats, chatSettings])

    const handleStartChat = useCallback(() => {
        router.push('/contacts')
    }, [router])

    const messageStatuses: (
        | 'sent'
        | 'delivered'
        | 'read'
        | null
    )[] = ['sent', 'delivered', 'read', null]

    // ВАЖНО: Проблема может быть здесь в фильтрации!
    const filteredChats =
        chats?.filter(
            (chat) => !chatSettings[chat.id]?.isDeleted,
        ) || []

    // Добавим логирование для каждого чата
    filteredChats.forEach((chat) => {
        const settings = chatSettings[chat.id]
        console.log(`🔍 Чат ${chat.id} "${chat.name}":`, {
            isDeleted: settings?.isDeleted,
            hasSettings: !!settings,
            chatType: chat.chatType,
        })
    })

    const { filteredValue } = useSearch(
        filteredChats,
        searchValue,
        [
            'chat.firstName',
            'chat.lastName',
            (chat) =>
                `${chat.chat.firstName} ${chat.chat.lastName}`,
            'lastMessage.content',
            'name',
        ],
    )

    const sortedChats = [...(filteredValue || [])].sort(
        (a, b) => {
            const aIsFavorite =
                chatSettings[a.id]?.isFavorite || false
            const bIsFavorite =
                chatSettings[b.id]?.isFavorite || false
            if (aIsFavorite && !bIsFavorite) return -1
            if (!aIsFavorite && bIsFavorite) return 1
            return 0
        },
    )

    console.log('🔍 ChatsList - отсортированные чаты:', {
        sortedCount: sortedChats.length,
        sortedNames: sortedChats.map((c) => c.name),
    })

    const toSelectChat = (id: number): void => {
        if (id === selectedChatId) {
            selectChat(null)
        } else {
            selectChat(id)
        }
    }

    const handleDeleteClick = useCallback(
        (chatId: number, chatName: string) => {
            setChatToDelete({ id: chatId, name: chatName })
            setDeleteModalOpen(true)
        },
        [],
    )

    const handleDeleteConfirm = useCallback(async () => {
        if (!chatToDelete || isDeleting) return

        setIsDeleting(true)

        try {
            await new Promise<void>((resolve) =>
                setTimeout(resolve, 1000),
            )
            console.log('Удалить чат:', chatToDelete.id)
            deleteChat(chatToDelete.id)
            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при удалении чата'
            console.error(
                'Ошибка при удалении:',
                errorMessage,
            )
        } finally {
            setIsDeleting(false)
        }
    }, [chatToDelete, isDeleting, deleteChat])

    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false)
        setChatToDelete(null)
    }, [])

    const handleAddToContacts = useCallback(
        (
            chatId: number,
            firstName: string,
            lastName: string,
        ) => {
            const fullName = `${firstName} ${lastName}`
            setAddedContactName(fullName)
            addToContacts(chatId)
            setSuccessToastOpen(true)
        },
        [addToContacts],
    )

    const handleSuccessToastClose = useCallback(() => {
        setSuccessToastOpen(false)
    }, [])

    const showEmptySearchState = useMemo(() => {
        return (
            searchValue.trim() !== '' &&
            filteredValue &&
            filteredValue.length === 0
        )
    }, [searchValue, filteredValue])

    const showEmptyChatsState = useMemo(() => {
        return (
            !loading &&
            chats &&
            chats.length === 0 &&
            searchValue.trim() === ''
        )
    }, [loading, chats, searchValue])

    return (
        <>
            <div className="flex h-(--screen-height-list) min-h-0 flex-col">
                {/* Верхняя панель с поиском и кнопкой создания */}
                <div className="flex h-19 w-full items-center gap-2.5 p-4">
                    <Search
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder={'Поиск'}
                        clearIconSrc="/images/search/closeSearch.svg"
                        showClearButton={true}
                    />

                    <CreateMenuButton
                        onSelectGroup={
                            onCreateGroup ||
                            (() => alert('Создать группу'))
                        }
                        onSelectChannel={
                            onCreateChannel ||
                            (() => alert('Создать канал'))
                        }
                    />
                </div>

                {/* Основная область со списком чатов */}
                <div
                    className={cn(
                        'min-h-0 flex-1 overflow-auto',
                        `
                  max-h-(--screen-112)
                `,
                    )}
                >
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-text-gray">
                                Загрузка...
                            </div>
                        </div>
                    ) : showEmptySearchState ? (
                        <div
                            className={`
                          flex flex-1 items-center justify-center p-4
                        `}
                        >
                            <EmptySearchState />
                        </div>
                    ) : showEmptyChatsState ? (
                        <div
                            className={`
                          flex flex-1 items-center justify-center p-4
                        `}
                        >
                            <EmptyChatsState
                                onStartChat={
                                    handleStartChat
                                }
                            />
                        </div>
                    ) : (
                        <CustomScrollbar>
                            <div className="flex flex-col">
                                {sortedChats?.map(
                                    (chat, index) => {
                                        const settings =
                                            chatSettings[
                                                chat.id
                                            ] || {
                                                isFavorite:
                                                    chat.isFavorite ||
                                                    false,
                                                isChatRead:
                                                    chat.newMessageCount ===
                                                    0,
                                                notificationsEnabled:
                                                    chat.notifications ??
                                                    true,
                                                isDeleted: false,
                                                isInContacts:
                                                    chat
                                                        .chat
                                                        .isInContacts ||
                                                    false,
                                                originalUnreadCount:
                                                    chat.newMessageCount ||
                                                    0,
                                            }

                                        if (
                                            settings.isDeleted
                                        ) {
                                            console.log(
                                                `❌ Пропускаем удаленный чат ${chat.id}`,
                                            )
                                            return null
                                        }

                                        let badgeCount:
                                            | number
                                            | undefined =
                                            undefined
                                        if (
                                            !settings.isChatRead
                                        ) {
                                            badgeCount =
                                                settings.originalUnreadCount &&
                                                settings.originalUnreadCount >
                                                    0
                                                    ? settings.originalUnreadCount
                                                    : 0
                                        }

                                        // Определяем URL аватарки
                                        let avatarSrc =
                                            chat.chat
                                                .avatarUrl ||
                                            chat.chat
                                                .avatar ||
                                            '/images/chatHeader/userAvatar.svg'
                                        let messagePreview =
                                            ''
                                        if (
                                            chat.chatType.includes(
                                                'group',
                                            )
                                        ) {
                                            // Для групп: 'пользователь от которого последнее сообщение: последнее сообщение пользователя группы'
                                            const senderName =
                                                chat
                                                    .lastMessage
                                                    .fromUser ||
                                                'Пользователь'
                                            messagePreview = `${senderName}: ${chat.lastMessage.content}`
                                        } else if (
                                            chat.chatType.includes(
                                                'channel',
                                            )
                                        ) {
                                            // Для каналов: описание канала
                                            messagePreview =
                                                chat.description ||
                                                ''
                                        } else {
                                            // Для чатов: последнее сообщение
                                            messagePreview =
                                                chat
                                                    .lastMessage
                                                    .content ||
                                                ''
                                        }
                                        // Проверяем, валидный ли URL (добавим дополнительную проверку)
                                        if (
                                            !avatarSrc ||
                                            avatarSrc.trim() ===
                                                '' ||
                                            (avatarSrc.startsWith(
                                                'http',
                                            ) &&
                                                !avatarSrc.includes(
                                                    'randomuser.me',
                                                ))
                                        ) {
                                            // Если это внешний URL, который не randomuser.me, используем локальную
                                            if (
                                                chat.chatType.includes(
                                                    'group',
                                                )
                                            ) {
                                                avatarSrc =
                                                    '/images/chatHeader/userAvatar.svg'
                                            } else if (
                                                chat.chatType.includes(
                                                    'channel',
                                                )
                                            ) {
                                                avatarSrc =
                                                    '/images/chatHeader/userAvatar.svg'
                                            } else {
                                                avatarSrc =
                                                    '/images/chatHeader/userAvatar.svg'
                                            }
                                        }

                                        // Для групп и каналов можно использовать специальные иконки
                                        if (
                                            chat.chatType.includes(
                                                'group',
                                            ) &&
                                            avatarSrc ===
                                                '/images/chatHeader/userAvatar.svg'
                                        ) {
                                            avatarSrc =
                                                '/images/chatHeader/userAvatar.svg'
                                        } else if (
                                            chat.chatType.includes(
                                                'channel',
                                            ) &&
                                            avatarSrc ===
                                                '/images/chatHeader/userAvatar.svg'
                                        ) {
                                            avatarSrc =
                                                '/images/chatHeader/userAvatar.svg'
                                        }

                                        return (
                                            <ChatListItem
                                                src={
                                                    avatarSrc
                                                }
                                                name={
                                                    chat.name
                                                }
                                                messagePreview={
                                                    messagePreview
                                                }
                                                chatType={
                                                    chat.chatType
                                                }
                                                timestamp={
                                                    chat
                                                        .chat
                                                        .isOnline
                                                        ? ''
                                                        : formatLastSeen(
                                                              chat
                                                                  .chat
                                                                  .wasOnlineAt *
                                                                  1000,
                                                          )
                                                }
                                                unreadCount={
                                                    badgeCount
                                                }
                                                key={
                                                    chat.id
                                                }
                                                selected={
                                                    chat.id ===
                                                    selectedChatId
                                                }
                                                onClick={() =>
                                                    toSelectChat(
                                                        chat.id,
                                                    )
                                                }
                                                notificationsEnabled={
                                                    settings.notificationsEnabled
                                                }
                                                messageStatus={
                                                    messageStatuses[
                                                        index %
                                                            messageStatuses.length
                                                    ]
                                                }
                                                onDeleteChat={() =>
                                                    handleDeleteClick(
                                                        chat.id,
                                                        `${chat.chat.firstName} ${chat.chat.lastName}`,
                                                    )
                                                }
                                                onFavoriteChat={() =>
                                                    handleFavoriteChat(
                                                        chat.id,
                                                    )
                                                }
                                                onMuteChat={() =>
                                                    handleMuteChat(
                                                        chat.id,
                                                    )
                                                }
                                                onMarkAsRead={() =>
                                                    handleMarkAsRead(
                                                        chat.id,
                                                    )
                                                }
                                                onMarkAsUnread={() =>
                                                    handleMarkAsUnread(
                                                        chat.id,
                                                    )
                                                }
                                                onAddToContacts={() =>
                                                    handleAddToContacts(
                                                        chat.id,
                                                        chat
                                                            .chat
                                                            .firstName,
                                                        chat
                                                            .chat
                                                            .lastName,
                                                    )
                                                }
                                                isFavorite={
                                                    settings.isFavorite
                                                }
                                                isChatRead={
                                                    settings.isChatRead
                                                }
                                                isInContacts={
                                                    chat
                                                        .chat
                                                        .isInContacts
                                                }
                                            />
                                        )
                                    },
                                )}
                            </div>
                        </CustomScrollbar>
                    )}
                </div>
            </div>

            <ChatDeleteModal
                open={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                chatName={chatToDelete?.name || ''}
            />

            <ChatSuccessToast
                open={successToastOpen}
                onClose={handleSuccessToastClose}
                userName={addedContactName}
            />
        </>
    )
}
