'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'
import ChatListSearch from './ChatListSearch'
import ChatDeleteModal from './ChatDeleteModal'
import ChatSuccessToast from './ChatSuccessToast'
import EmptySearchState from './EmptySearchState'
import EmptyChatsState from './EmptyChatsState' // ДОБАВИЛ импорт

interface IchatSettings {
    isPinned: boolean
    isChatRead: boolean
    notificationsEnabled: boolean
    isDeleted: boolean
    isInContacts: boolean
    originalUnreadCount:number
}
type TchatSettings = Record<string | number, IchatSettings>

export default function ChatsList() {
    const [searchValue, setSearchValue] = useState('')
    const { chats, loadChats } = useChats()
    const [selectedChatId, setSelectedChatId] = useState<number | null | string>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [successToastOpen, setSuccessToastOpen] = useState(false)
    const [addedContactName, setAddedContactName] = useState('')
    const [chatToDelete, setChatToDelete] = useState<{
        id: number | string;
        name: string;
    } | null>(null)
    const [chatSettings, setChatSettings] = useState<TchatSettings>({})
    const [isLoading, setIsLoading] = useState(true) // ДОБАВИЛ состояние загрузки

    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    useEffect(() => {
        if (chats !== undefined) {
            setIsLoading(false) // ДОБАВИЛ: завершаем загрузку когда chats загружены
            const initialSettings: TchatSettings = {}
            chats.forEach((chat) => {
                initialSettings[chat.id] = {
                    isPinned: false,
                    isChatRead: chat.newMessageCount === 0,
                    notificationsEnabled: true,
                    isDeleted: false,
                    isInContacts: chat.chat.isInContacts || false, 
                    originalUnreadCount:chat.newMessageCount
                }
            })
            setChatSettings(initialSettings)
        }
    }, [chats])

    // ДОБАВИЛ функцию для кнопки "Начать чат"
    const handleStartChat = useCallback(() => {
        console.log('Начать новый чат')
        // В реальном приложении здесь будет переход к поиску контактов или созданию чата
        alert('Функция начала нового чата будет реализована позже')
    }, [])

    const messageStatuses: ('sent' | 'delivered' | 'read' | null)[] = ['sent', 'delivered', 'read', null]

    const { filteredValue } = useSearch(
        chats?.filter((chat) => !chatSettings[chat.id]?.isDeleted) || [],
        searchValue,
        [
            'chat.firstName',
            'chat.lastName',
            (chat) => `${chat.chat.firstName} ${chat.chat.lastName}`,
            'lastMessage.content',
        ],
    )

    const sortedChats = [...filteredValue].sort((a, b) => {
        const aPinned = chatSettings[a.id]?.isPinned || false
        const bPinned = chatSettings[b.id]?.isPinned || false

        if (aPinned && !bPinned) return -1
        if (!aPinned && bPinned) return 1
        return 0
    })

    const clearSearchInput = () => {
        setSearchValue('')
    }

    const toSelectChat = (id: number | string): void => {
        if (id === selectedChatId) {
            setSelectedChatId(null)
        } else {
            setSelectedChatId(id)
        }
    }

    const handleDeleteClick = useCallback((chatId: number | string, chatName: string) => {
        setChatToDelete({ id: chatId, name: chatName })
        setDeleteModalOpen(true)
    }, [])

    const handleDeleteConfirm = useCallback(async () => {
        if (!chatToDelete || isDeleting) return
        
        setIsDeleting(true)
        
        try {
            // Имитация задержки сети
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            console.log('Удалить чат:', chatToDelete.id)
            
            setChatSettings(prev => ({
                ...prev,
                [chatToDelete.id]: {
                    ...prev[chatToDelete.id],
                    isDeleted: true,
                },
            }))
            
            setDeleteModalOpen(false)
            setChatToDelete(null)
        } catch (error) {
            console.error('Ошибка при удалении:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [chatToDelete, isDeleting])

    const handleDeleteCancel = useCallback(() => {
        setDeleteModalOpen(false)
        setChatToDelete(null)
    }, [])

    const handlePinChat = (chatId: number | string) => {
        console.log('Закрепить чат:', chatId)
        setChatSettings((prev) => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                isPinned: !prev[chatId]?.isPinned,
            },
        }))
    }

    const handleMuteChat = (chatId: number | string) => {
        console.log('Отключить уведомления для чата:', chatId)
        setChatSettings((prev) => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                notificationsEnabled: !prev[chatId]?.notificationsEnabled,
            },
        }))
    }

    // ДОБАВИЛ: условие для отображения состояния пустого поиска
    const showEmptySearchState = useMemo(() => {
        return searchValue.trim() !== '' && filteredValue && filteredValue.length === 0
    }, [searchValue, filteredValue])

    // ДОБАВИЛ: условие для отображения состояния отсутствия чатов
    const showEmptyChatsState = useMemo(() => {
        return !isLoading && chats && chats.length === 0 && searchValue.trim() === ''
    }, [isLoading, chats, searchValue])

    const handleMarkAsRead = (chatId: number | string) => {
    console.log('Пометить чат как прочитанный:', chatId)
    setChatSettings((prev) => ({
        ...prev,
        [chatId]: {
            ...prev[chatId],
            isChatRead: true,
            // Для пустого кружка: сохраняем оригинальный счетчик
            originalUnreadCount: prev[chatId]?.originalUnreadCount ?? chat.newMessageCount,
        },
    }))
}

    const handleMarkAsUnread = (chatId: number | string) => {
    console.log('Пометить чат как непрочитанный:', chatId)
    setChatSettings((prev) => ({
        ...prev,
        [chatId]: {
            ...prev[chatId],
            isChatRead: false,
            // При повторной пометке как непрочитанного всегда показываем 0
            originalUnreadCount: 0,
        },
    }))
}

    const handleAddToContacts = useCallback((chatId: number | string, firstName: string, lastName: string) => {
        const fullName = `${firstName} ${lastName}`
        
        setAddedContactName(fullName)
        
        setChatSettings(prev => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                isInContacts: true,
            },
        }))
        
        setSuccessToastOpen(true)
    }, [])

    const handleSuccessToastClose = useCallback(() => {
        setSuccessToastOpen(false)
    }, [])
    
    return (
        <>
            <div className="flex flex-col h-full">
                <ChatListSearch
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    clearSearchInput={clearSearchInput}
                    placeholder={'Поиск...'}
                />
                <div className="flex-1 h-11/12 overflow-y-auto bg-[#F5F6F8] custom-scroll">
                    {isLoading ? ( // ДОБАВИЛ: состояние загрузки
                        <div className="flex items-center justify-center h-full">
                            <div className="text-text-gray">Загрузка...</div>
                        </div>
                    ) : showEmptySearchState ? ( // ИЗМЕНИЛ: переименовал showEmptyState на showEmptySearchState
                        <div className="flex-1 flex items-center justify-center p-4">
                            <EmptySearchState />
                        </div>
                    ) : showEmptyChatsState ? ( // ДОБАВИЛ: состояние отсутствия чатов
                        <div className="flex-1 flex items-center justify-center p-4">
                            <EmptyChatsState onStartChat={handleStartChat} />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {sortedChats?.map((chat, index) => {
                                const settings = chatSettings[chat.id] || {
                                    isPinned: false,
                                    isChatRead: chat.newMessageCount === 0,
                                    notificationsEnabled: true,
                                    isDeleted: false,
                                    isInContacts: chat.chat.isInContacts || false,
                                }
                                if (settings.isDeleted) return null
                                let badgeCount: number | undefined = undefined
                                    if (!settings.isChatRead) {
                                        // Если есть сохраненный оригинальный счетчик и он > 0, используем его
                                        // Иначе показываем 0 (пустой кружок)
                                        badgeCount = (settings.originalUnreadCount && settings.originalUnreadCount > 0) 
                                            ? settings.originalUnreadCount 
                                            : 0
                                    }
                                return (
                                    <ChatListItem
                                        src="/images/chatHeader/userAvatar.svg"
                                        name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                                        messagePreview={chat.lastMessage.content}
                                        timestamp={formatLastSeen(chat.lastActivityAt * 1000)}
                                        unreadCount={badgeCount}
                                        key={chat.id}
                                        selected={chat.id === selectedChatId}
                                        onClick={() => toSelectChat(chat.id)}
                                        notificationsEnabled={settings.notificationsEnabled}
                                        messageStatus={messageStatuses[index % messageStatuses.length]}
                                        onDeleteChat={() => handleDeleteClick(chat.id, `${chat.chat.firstName} ${chat.chat.lastName}`)} 
                                        onPinChat={() => handlePinChat(chat.id)}
                                        onMuteChat={() => handleMuteChat(chat.id)}
                                        onMarkAsRead={() => handleMarkAsRead(chat.id)}
                                        onMarkAsUnread={() => handleMarkAsUnread(chat.id)}
                                        onAddToContacts={() => handleAddToContacts(chat.id, chat.chat.firstName, chat.chat.lastName)}
                                        isPinned={settings.isPinned}
                                        isChatRead={settings.isChatRead}
                                        isInContacts={settings.isInContacts}
                                    />
                                )
                            })}
                        </div>
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