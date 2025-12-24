'use client'

import { useEffect, useState } from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import Image from 'next/image'

import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'
import ChatListSearch from './ChatListSearch'

export default function ChatsList() {
    const [searchValue, setSearchValue] = useState('')
    const { chats, loadChats } = useChats()
    const [selectedChatId, setSelectedChatId] = useState<
        number | null | string
    >(null)
    useEffect(() => {
        loadChats(15)
    }, [loadChats])
    const messageStatuses: (
        | 'sent'
        | 'delivered'
        | 'read'
        | null
    )[] = ['sent', 'delivered', 'read', null]
    const { filteredValue } = useSearch(
        chats,
        searchValue,
        [
            'chat.firstName',
            'chat.lastName',
            (chat) =>
                `${chat.chat.firstName} ${chat.chat.lastName}`,
            'lastMessage.content',
        ],
    )
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
  console.log('Удалить чат:', chatId);
  // Здесь будет логика удаления чата
};

const handlePinChat = (chatId: number | string) => {
  console.log('Закрепить чат:', chatId);
};

const handleMuteChat = (chatId: number | string) => {
  console.log('Отключить уведомления для чата:', chatId);
  // Здесь будет логика отключения уведомлений
};


const handleMarkAsRead = (chatId: number | string) => {
    console.log('Пометить чат как прочитанный:', chatId);
    // Здесь будет логика пометки как прочитанного
};

const handleMarkAsUnread = (chatId: number | string) => {
    console.log('Пометить чат как непрочитанный:', chatId);
    // Здесь будет логика пометки как непрочитанного
};
    
    
    return (
        <div className="flex flex-col h-full">
           <ChatListSearch
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                clearSearchInput={clearSearchInput}
                placeholder={"Поиск..."}
           />
            <div className="flex-1 h-11/12 overflow-y-auto bg-[#F5F6F8]">
                <div className="flex flex-col">
                    {filteredValue?.map((chat, index) => (
                        <ChatListItem
                            src="/images/chatHeader/userAvatar.svg"
                            name={`${chat.chat.firstName} ${chat.chat.lastName}`}
                            messagePreview={
                                chat.lastMessage.content
                            }
                            timestamp={formatLastSeen(
                                chat.lastActivityAt * 1000,
                            )}
                            unreadCount={
                                chat.newMessageCount
                            }
                            key={chat.id}
                            selected={
                                chat.id === selectedChatId
                            }
                            onClick={() =>
                                toSelectChat(chat.id)
                            }
                            notificationsEnabled={
                                chat.notifications
                            }
                            messageStatus={
                                messageStatuses[
                                    index %
                                        messageStatuses.length
                                ]
                            }
                            onDeleteChat={() =>
                                handleDeleteChat(chat.id)
                            }
                            onPinChat={() =>
                                handlePinChat(chat.id)
                            }
                            onMuteChat={() =>
                                handleMuteChat(chat.id)
                            }
                            
                            onMarkAsRead={() => handleMarkAsRead(chat.id)}
                            onMarkAsUnread={() => handleMarkAsUnread(chat.id)}
                            
                            isPinned={index % 3 === 0} 
                            isChatRead={index % 2 === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
