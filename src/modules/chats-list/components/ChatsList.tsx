'use client'

import { useEffect, useState } from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'

import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'
import ChatListSearch from './ChatListSearch'
interface IchatSettings {
    isPinned: boolean
    isChatRead: boolean
    notificationsEnabled: boolean
    isDeleted: boolean
}
type TchatSettings = Record<string | number, IchatSettings>
export default function ChatsList() {
    const [searchValue, setSearchValue] = useState('')
    const { chats, loadChats } = useChats()
    const [selectedChatId, setSelectedChatId] = useState<
        number | null | string
    >(null)
    const [chatSettings, setChatSettings] =
        useState<TchatSettings>({})

    useEffect(() => {
        loadChats(15)
    }, [loadChats])
    useEffect(() => {
        if (chats) {
            const initialSettings: TchatSettings = {}
            chats.forEach((chat) => {
                initialSettings[chat.id] = {
                    isPinned: false, // По умолчанию не закреплен
                    isChatRead: chat.newMessageCount === 0, // Если нет непрочитанных, считаем прочитанным
                    notificationsEnabled: true, // По умолчанию уведомления включены
                    isDeleted: false, // По умолчанию не удален
                }
            })
            setChatSettings(initialSettings)
        }
       
    }, [chats])
    // useEffect(() => {
    //     const savedSettings =
    //         localStorage.getItem('chatSettings')
    //     if (savedSettings) {
    //         setChatSettings(JSON.parse(savedSettings))
    //     }
    // }, [])
    // useEffect(() => {
    //     localStorage.setItem(
    //         'chatSettings',
    //         JSON.stringify(chatSettings),
    //     )
    // }, [chatSettings])
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
        const aPinned =
            chatSettings[a.id]?.isPinned || false
        const bPinned =
            chatSettings[b.id]?.isPinned || false

        if (aPinned && !bPinned) return -1
        if (!aPinned && bPinned) return 1
        return 0
    })
    const clearSearchInput = () => {
        setSearchValue('')
    }
    const toSelectChat = (id: number | string): void => {
        if (id === selectedChatId) {
            console.log(id)
            console.log(selectedChatId)
            console.log(id === selectedChatId)
            setSelectedChatId(null)
        } else {
            setSelectedChatId(id)
        }
    }

    const handleDeleteChat = (chatId: number | string) => {
        // Сначала показываем подтверждение
        if (
            window.confirm(
                'Вы уверены, что хотите удалить чат?',
            )
        ) {
            // Добавляем анимацию или задержку перед удалением
            setTimeout(() => {
                setChatSettings((prev) => ({
                    ...prev,
                    [chatId]: {
                        ...prev[chatId],
                        isDeleted: true,
                    },
                }))
            }, 300) // Задержка для анимации
        }
    }

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
        console.log(
            'Отключить уведомления для чата:',
            chatId,
        )
        setChatSettings((prev) => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                notificationsEnabled:
                    !prev[chatId]?.notificationsEnabled,
            },
        }))
    }

    const handleMarkAsRead = (chatId: number | string) => {
        console.log('Пометить чат как прочитанный:', chatId)
        setChatSettings((prev) => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                isChatRead: true,
            },
        }))
    }

    const handleMarkAsUnread = (
        chatId: number | string,
    ) => {
        console.log(
            'Пометить чат как непрочитанный:',
            chatId,
        )
        setChatSettings((prev) => ({
            ...prev,
            [chatId]: {
                ...prev[chatId],
                isChatRead: false,
            },
        }))
    }

    return (
        <div className="flex flex-col h-full">
            <ChatListSearch
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                clearSearchInput={clearSearchInput}
                placeholder={'Поиск...'}
            />
            <div className="flex-1 h-11/12 overflow-y-auto bg-[#F5F6F8]">
                <div className="flex flex-col">
                    {sortedChats?.map((chat, index) => {
                        const settings = chatSettings[
                            chat.id
                        ] || {
                            isPinned: false,
                            isChatRead:
                                chat.newMessageCount === 0,
                            notificationsEnabled: true,
                            isDeleted: false,
                        }
                        // Пропускаем удаленные чаты
                        if (settings.isDeleted) return null
                        return (
                            <ChatListItem
                                src="/images/chatHeader/userAvatar.svg"
                                name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                                messagePreview={
                                    chat.lastMessage.content
                                }
                                timestamp={formatLastSeen(
                                    chat.lastActivityAt *
                                        1000,
                                )}
                                unreadCount={
                                    chat.newMessageCount
                                }
                                key={chat.id}
                                selected={
                                    chat.id ===
                                    selectedChatId
                                }
                                onClick={() =>
                                    toSelectChat(chat.id)
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
                                    handleDeleteChat(
                                        chat.id,
                                    )
                                }
                                onPinChat={() =>
                                    handlePinChat(chat.id)
                                }
                                onMuteChat={() =>
                                    handleMuteChat(chat.id)
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
                                isPinned={settings.isPinned}
                                isChatRead={
                                    settings.isChatRead
                                }
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
