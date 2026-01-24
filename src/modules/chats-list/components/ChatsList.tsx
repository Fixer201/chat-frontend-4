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

    // Состояния для управления UI
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

    // Хук для работы с чатами
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

    // Навигация к странице контактов
    const handleStartChat = useCallback(() => {
        router.push('/contacts')
    }, [router])

    // Статусы сообщений для отображения в списке чатов
    const messageStatuses: (
        | 'sent'
        | 'delivered'
        | 'read'
        | null
    )[] = ['sent', 'delivered', 'read', null]

    // Фильтрация чатов - исключаем удаленные
    const filteredChats =
        chats?.filter(
            (chat) => !chatSettings[chat.id]?.isDeleted,
        ) || []

    // Поиск по чатам с использованием хука useSearch
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

    // Сортировка чатов: избранные в начале списка
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

    // Выбор/отмена выбора чата
    const toSelectChat = (id: number): void => {
        if (id === selectedChatId) {
            selectChat(null)
        } else {
            selectChat(id)
        }
    }

    // Обработчик нажатия кнопки удаления чата
    const handleDeleteClick = useCallback(
        (chatId: number, chatName: string) => {
            setChatToDelete({ id: chatId, name: chatName })
            setDeleteModalOpen(true)
        },
        [],
    )

    // Подтверждение удаления чата
    const handleDeleteConfirm = useCallback(async () => {
        if (!chatToDelete || isDeleting) return

        setIsDeleting(true)

        try {
            // Имитация задержки для UX
            await new Promise<void>((resolve) =>
                setTimeout(resolve, 1000),
            )

            deleteChat(chatToDelete.id)
            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при удалении чата'
        } finally {
            setIsDeleting(false)
        }
    }, [chatToDelete, isDeleting, deleteChat])

    // Отмена удаления чата
    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false)
        setChatToDelete(null)
    }, [])

    // Добавление контакта в список контактов
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

    // Закрытие тоста об успешном добавлении
    const handleSuccessToastClose = useCallback(() => {
        setSuccessToastOpen(false)
    }, [])

    // Определение необходимости показа состояния пустого поиска
    const showEmptySearchState = useMemo(() => {
        return (
            searchValue.trim() !== '' &&
            filteredValue &&
            filteredValue.length === 0
        )
    }, [searchValue, filteredValue])

    // Определение необходимости показа состояния отсутствия чатов
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
                        `max-h-(--screen-112)`,
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

                                        // Пропускаем удаленные чаты
                                        if (
                                            settings.isDeleted
                                        ) {
                                            return null
                                        }

                                        // Расчет количества непрочитанных сообщений
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

                                        // Определение URL аватарки с fallback
                                        let avatarSrc =
                                            chat.chat
                                                .avatarUrl ||
                                            chat.chat
                                                .avatar ||
                                            '/images/chatHeader/userAvatar.svg'

                                        // Формирование превью сообщения в зависимости от типа чата
                                        let messagePreview =
                                            ''
                                        if (
                                            chat.chatType.includes(
                                                'group',
                                            )
                                        ) {
                                            // Для групп: отображаем отправителя и сообщение
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
                                            // Для каналов: отображаем описание канала
                                            messagePreview =
                                                chat.description ||
                                                ''
                                        } else {
                                            // Для личных чатов: отображаем текст последнего сообщения
                                            messagePreview =
                                                chat
                                                    .lastMessage
                                                    .content ||
                                                ''
                                        }

                                        // Проверка валидности URL аватарки
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
                                            // Используем стандартную аватарку для некорректных URL
                                            avatarSrc =
                                                '/images/chatHeader/userAvatar.svg'
                                        }

                                        // Использование специальных иконок для групп и каналов
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

            {/* Модальное окно подтверждения удаления чата */}
            <ChatDeleteModal
                open={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                chatName={chatToDelete?.name || ''}
            />

            {/* Тост об успешном добавлении в контакты */}
            <ChatSuccessToast
                open={successToastOpen}
                onClose={handleSuccessToastClose}
                userName={addedContactName}
            />
        </>
    )
}
