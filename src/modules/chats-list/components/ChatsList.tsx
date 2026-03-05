// ChatsList.tsx
'use client'
import React, {
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
import { useContactsMap } from '@shared/hooks/useContactsMap'
import Search from '@shared/ui/Search'
import CreateMenuButton from './CreateMenuButton'
import { cn } from '@shared/lib/utils'
import { Spinner } from '@shared/ui/Spinner'
import { toast } from 'react-hot-toast'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { useAddContact } from '@shared/hooks/useAddContact'
import { useAppDispatch } from '@redux/store' // или useDispatch, в зависимости от проекта
import { addToContacts } from '@redux/slices/chatsSlice'
import { Contact } from '@shared/types/contact'
import { useContactData } from '@shared/hooks/useContactData'

interface ChatsListProps {
    onCreateGroup?: () => void
    onCreateChannel?: () => void
    onOpenInfoPanel?: (chatId: number) => void
}
type ChatListItemBaseProps = Omit<
    React.ComponentProps<typeof ChatListItem>,
    'name'
>
// Для временных чатов берём имя из contact API (как в шапке),
// чтобы никнейм не перебивал реальное имя в списке.
function ChatListItemWithContactName({
    baseName,
    contactUid,
    isTempChat,
    ...props
}: ChatListItemBaseProps & {
    baseName: string
    contactUid: string
    isTempChat: boolean
}) {
    const { data: contactData } = useContactData(
        isTempChat ? contactUid : '',
    )
    const contactFirstName =
        contactData?.firstName?.trim() || ''
    const displayName = isTempChat
        ? contactFirstName || baseName
        : baseName

    return <ChatListItem {...props} name={displayName} />
}
export default React.memo(function ChatsList({
    onCreateGroup,
    onCreateChannel,
    onOpenInfoPanel,
}: ChatsListProps) {
    const router = useRouter()
    const contactsMap = useContactsMap()

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
        error,
        chatSettings,
        toggleFavorite: handleFavoriteChat,
        toggleNotifications: handleMuteChat,
        markAsRead: handleMarkAsRead,
        markAsUnread: handleMarkAsUnread,
        deleteChat,
        addToContacts,
        selectedChatId,
        selectChat,
    } = useChats()

    const dispatch = useAppDispatch()
    const { addContact } = useAddContact()
    // Навигация к странице контактов
    const handleStartChat = useCallback(() => {
        router.push('/contacts')
    }, [router])

    // TODO: статус сообщений (sent/delivered/read) отключён — бэкенд не возвращает
    // delivered_at/read_at в lastMessage. Для реализации нужно расширить API чатов.

    // Фильтрация чатов - исключаем удаленные и чаты с невалидными ID
    const filteredChats =
        chats?.filter(
            (chat) =>
                !chatSettings[chat.id]?.isDeleted &&
                typeof chat.id === 'number' &&
                !isNaN(chat.id),
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

    // Сортировка чатов: избранные в начале списка (без закрепления выбранного чата)
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
            console.info('[Chats][Delete] confirm', {
                chatId: chatToDelete.id,
                chatName: chatToDelete.name,
            })
            await deleteChat(chatToDelete.id)
            console.info('[Chats][Delete] dispatched', {
                chatId: chatToDelete.id,
            })
            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при удалении чата'
            toast.error(errorMessage)
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
        async (
            chatId: number,
            firstName: string,
            lastName: string,
        ) => {
            // Находим чат по ID
            const chat = chats.find((c) => c.id === chatId)
            if (!chat || chat.chatType !== 'chat') return // только для личных чатов

            // Формируем объект Contact из данных чата
            const contactToAdd: Contact = {
                uid: chat.chat.uid,
                userUid: chat.chat.uid,
                firstName: chat.chat.firstName || firstName,
                lastName: chat.chat.lastName || lastName,
                nickname: chat.chat.nickname || '',
                phone: chat.chat.username || '',
                username: '',
                patronymic: '',
                avatar: chat.chat.avatar,
                avatarUrl: chat.chat.avatarUrl,
                avatarWebp: chat.chat.avatarWebp,
                avatarWebpUrl: chat.chat.avatarWebpUrl,
                additionalInformation: '',
                birthday: 0,
                chatId: 0,
                isOnline: chat.chat.isOnline,
                wasOnlineAt: chat.chat.wasOnlineAt,
            }

            try {
                // Вызов реального API через хук
                await addContact(contactToAdd)

                // После успеха обновляем флаг isInContacts у чата
                addToContacts(chatId) // функция из useChats (диспатчит экшен)

                // Показываем кастомный тост
                const fullName =
                    `${chat.chat.firstName || firstName} ${chat.chat.lastName || lastName}`.trim() ||
                    'Контакт'
                setAddedContactName(fullName)
                setSuccessToastOpen(true)
            } catch (error) {
                // Ошибка уже обработана в useAddContact (показан toast.error)
                // Дополнительных действий не требуется
            }
        },
        [chats, addContact, addToContacts],
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
            filteredChats.length === 0 &&
            searchValue.trim() === ''
        )
    }, [loading, filteredChats.length, searchValue])

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
                            <Spinner />
                        </div>
                    ) : error ? (
                        (() => {
                            if (
                                error.includes(
                                    'RefreshTokenExpired',
                                ) ||
                                error.includes(
                                    'AccessTokenNotFound',
                                )
                            ) {
                                router.push('/auth/login')
                            } else if (
                                error.includes('414')
                            ) {
                                toast.error(
                                    'Поисковый запрос слишком длинный. Укоротите его.',
                                )
                            } else {
                                toast.error(error)
                            }
                            return (
                                <div
                                    className={`
                                      flex h-full items-center justify-center
                                    `}
                                >
                                    Ошибка загрузки чатов
                                </div>
                            )
                        })()
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
                                    (chat) => {
                                        const contactMatch =
                                            chat.chatType ===
                                            'chat'
                                                ? contactsMap.get(
                                                      chat
                                                          .chat
                                                          .uid,
                                                  )
                                                : undefined
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
                                        )
                                            return null

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
                                        const avatarSrc =
                                            contactMatch
                                                ? getAvatarSrc(
                                                      contactMatch,
                                                  )
                                                : getAvatarSrc(
                                                      chat.chat,
                                                  )

                                        let displayName =
                                            'Неизвестный чат'
                                        if (
                                            chat.chatType.includes(
                                                'group',
                                            ) ||
                                            chat.chatType.includes(
                                                'channel',
                                            )
                                        ) {
                                            displayName =
                                                chat.name ||
                                                'Без названия'
                                        } else {
                                            const isTempChat =
                                                chat.isTemporary ||
                                                chat.tempContactUid ||
                                                chat.chatKey ===
                                                    'chat_key_0'
                                            if (
                                                isTempChat
                                            ) {
                                                const contactFirstName =
                                                    contactMatch?.firstName?.trim() ||
                                                    ''
                                                const chatFirstName =
                                                    chat.chat.firstName?.trim() ||
                                                    ''
                                                const normalizedNickname =
                                                    contactMatch?.nickname?.trim()
                                                const candidateFirstName =
                                                    contactFirstName ||
                                                    chatFirstName
                                                const isNicknameValue =
                                                    normalizedNickname &&
                                                    candidateFirstName &&
                                                    candidateFirstName.toLowerCase() ===
                                                        normalizedNickname.toLowerCase()
                                                const safeFirstName =
                                                    candidateFirstName &&
                                                    !isNicknameValue
                                                        ? candidateFirstName
                                                        : ''
                                                displayName =
                                                    safeFirstName ||
                                                    contactMatch?.phone ||
                                                    'Новый чат'
                                            } else {
                                                const contactName =
                                                    contactMatch
                                                        ? `${contactMatch.firstName || ''} ${contactMatch.lastName || ''}`.trim() ||
                                                          contactMatch.nickname ||
                                                          contactMatch.phone ||
                                                          chat
                                                              .chat
                                                              .nickname ||
                                                          chat
                                                              .chat
                                                              .username
                                                        : ''
                                                const fallbackChatName =
                                                    `${chat.chat.firstName || ''} ${chat.chat.lastName || ''}`.trim() ||
                                                    chat
                                                        .chat
                                                        .nickname ||
                                                    chat
                                                        .chat
                                                        .username
                                                displayName =
                                                    contactName ||
                                                    fallbackChatName ||
                                                    chat.name ||
                                                    'Неизвестный чат'
                                            }
                                        }
                                        const contactLastSeenMs =
                                            contactMatch?.wasOnlineAt
                                                ? typeof contactMatch.wasOnlineAt ===
                                                  'number'
                                                    ? contactMatch.wasOnlineAt *
                                                      1000
                                                    : new Date(
                                                          contactMatch.wasOnlineAt,
                                                      ).getTime()
                                                : undefined
                                        const fallbackLastSeenMs =
                                            chat.chat
                                                .wasOnlineAt
                                                ? chat.chat
                                                      .wasOnlineAt *
                                                  1000
                                                : undefined
                                        const isContactOnline =
                                            contactMatch?.isOnline ??
                                            chat.chat
                                                .isOnline

                                        // Формирование превью сообщения в зависимости от типа чата
                                        let messagePreview =
                                            ''
                                        if (
                                            chat.chatType.includes(
                                                'group',
                                            )
                                        ) {
                                            const senderName =
                                                chat
                                                    .lastMessage
                                                    ?.fromUser ||
                                                'Пользователь'
                                            messagePreview =
                                                chat.lastMessage
                                                    ? `${senderName}: ${chat.lastMessage.content}`
                                                    : 'Нет сообщений'
                                        } else if (
                                            chat.chatType.includes(
                                                'channel',
                                            )
                                        ) {
                                            const lastContent =
                                                chat
                                                    .lastMessage
                                                    ?.content ||
                                                ''
                                            if (
                                                lastContent &&
                                                !lastContent.startsWith(
                                                    'Создана',
                                                )
                                            ) {
                                                messagePreview =
                                                    lastContent
                                            } else {
                                                messagePreview =
                                                    chat.description ||
                                                    'Нет сообщений'
                                            }
                                        } else {
                                            const lastContent =
                                                chat
                                                    .lastMessage
                                                    ?.content ||
                                                ''
                                            messagePreview =
                                                lastContent.startsWith(
                                                    'Создана',
                                                )
                                                    ? 'Нет сообщений'
                                                    : lastContent ||
                                                      'Нет сообщений'
                                        }

                                        return (
                                            <ChatListItemWithContactName
                                                key={
                                                    chat.id
                                                }
                                                src={
                                                    avatarSrc
                                                }
                                                baseName={
                                                    displayName
                                                }
                                                contactUid={
                                                    chat
                                                        .chat
                                                        .uid
                                                }
                                                isTempChat={
                                                    !!(
                                                        chat.isTemporary ||
                                                        chat.tempContactUid ||
                                                        chat.chatKey ===
                                                            'chat_key_0'
                                                    )
                                                }
                                                messagePreview={
                                                    messagePreview
                                                }
                                                chatType={
                                                    chat.chatType
                                                }
                                                timestamp={
                                                    isContactOnline
                                                        ? 'в сети'
                                                        : contactLastSeenMs
                                                          ? formatLastSeen(
                                                                contactLastSeenMs,
                                                            )
                                                          : fallbackLastSeenMs
                                                            ? formatLastSeen(
                                                                  fallbackLastSeenMs,
                                                              )
                                                            : ''
                                                }
                                                unreadCount={
                                                    badgeCount
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
                                                    null
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
                                                onOpenInfoPanel={() =>
                                                    onOpenInfoPanel?.(
                                                        chat.id,
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
})
