/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
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
import Image from 'next/image'

export default function ChatsList() {
    const router = useRouter()
    const [showFilterButton, setShowFilterButton] =
        useState(true)
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
        toggleFavorite,
        toggleNotifications,
        markAsRead,
        markAsUnread,
        deleteChat,
        addToContacts,
        selectedChatId,
        selectChat,
    } = useChats()

    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    const handleStartChat = useCallback(() => {
        router.push('/contacts')
    }, [router])

    const messageStatuses: (
        | 'sent'
        | 'delivered'
        | 'read'
        | null
    )[] = ['sent', 'delivered', 'read', null]

    const { filteredValue } = useSearch(
        chats?.filter(
            (chat) => !chatSettings[chat.id]?.isDeleted,
        ) || [],
        searchValue,
        [
            'chat.firstName',
            'chat.lastName',
            (chat) =>
                `${chat.chat.firstName} ${chat.chat.lastName}`,
            'lastMessage.content',
        ],
    )

    const sortedChats = [...filteredValue].sort((a, b) => {
        const aIsFavorite =
            chatSettings[a.id]?.isFavorite || false
        const bIsFavorite =
            chatSettings[b.id]?.isFavorite || false

        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        return 0
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
            await new Promise((resolve) =>
                setTimeout(resolve, 1000),
            )

            console.log('Удалить чат:', chatToDelete.id)

            deleteChat(chatToDelete.id)

            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            console.error('Ошибка при удалении:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [chatToDelete, isDeleting, deleteChat])

    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false)
        setChatToDelete(null)
    }, [])

    const handleFavoriteChat = (chatId: number) => {
        console.log('Закрепить чат:', chatId)
        toggleFavorite(chatId)
    }

    const handleMuteChat = (chatId: number) => {
        console.log(
            'Отключить уведомления для чата:',
            chatId,
        )
        toggleNotifications(chatId)
    }

    const handleMarkAsRead = (chatId: number) => {
        console.log('Пометить чат как прочитанный:', chatId)
        markAsRead(chatId)
    }

    const handleMarkAsUnread = (chatId: number) => {
        console.log(
            'Пометить чат как непрочитанный:',
            chatId,
        )
        markAsUnread(chatId)
    }

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
            <div className="flex h-full flex-col">
                <div
                    className={`flex h-19 w-full items-center gap-2.5 p-4`}
                >
                    <Search
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder={'Поиск'}
                        clearIconSrc="/images/search/closeSearch.svg"
                        showClearButton={true}
                    />
                    {showFilterButton && (
                        <button
                            type="button"
                            className={`
                              shrink-0 rounded-lg p-2 transition-colors
                              hover:bg-gray-200
                            `}
                            aria-label="Фильтр"
                        >
                            <Image
                                src="/icons/createCollab.svg"
                                alt="filter"
                                width={20}
                                height={20}
                            />
                        </button>
                    )}
                </div>
                <div className="h-11/12 flex-1 overflow-y-auto">
                    {/* ИЗМЕНЕНО: используем loading из Redux вместо isLoading */}
                    {loading ? (
                        <div
                            className={`flex h-full items-center justify-center`}
                        >
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
                                        // ИЗМЕНЕНО: получаем настройки из Redux вместо локального состояния
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
                                        )
                                            return null
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
                                        const avatarSrc =
                                            chat.chat.avatarUrl?.trim()
                                                ? chat.chat
                                                      .avatarUrl
                                                : '/images/chatHeader/userAvatar.svg'
                                        return (
                                            <ChatListItem
                                                src={
                                                    avatarSrc
                                                }
                                                name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                                                messagePreview={
                                                    chat
                                                        .lastMessage
                                                        .content
                                                }
                                                timestamp={formatLastSeen(
                                                    chat.lastActivityAt *
                                                        1000,
                                                )}
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
