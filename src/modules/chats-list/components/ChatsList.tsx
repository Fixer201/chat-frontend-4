'use client'

import { useEffect, useState } from 'react'
import { useChats } from '@shared/hooks/useChats'
import { formatLastSeen } from '@shared/lib/formatLastSeen'
import Image from 'next/image'

import { useSearch } from '@shared/hooks/useSearch'
import { ChatListItem } from './ChatListItem'

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
            <div className="h-1/12 min-h-[60px] bg-[#F5F6F8] flex items-center px-4">
                <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                            viewBox="0 0 17.4883 17.4883"
                            xmlns="http://www.w3.org/2000/svg"
                            width="17.488281"
                            height="17.488281"
                            fill="none"
                        >
                            <path
                                id="Vector"
                                d="M12.5 11L11.71 11L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 
                            2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 
                            13C8.11 13 9.59 12.41 10.73 11.43L11 11.71L11 12.5L16 17.49L17.49 
                            16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 
                            2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"
                                fill={'#747474'}
                                fillRule="nonzero"
                            />
                        </svg>
                    </div>

                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchValue}
                        onChange={(e) =>
                            setSearchValue(e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white border-[#EEEEEE]
        focus:outline-none focus:border-[#EEEEEE] focus:ring-0
        placeholder:text-gray-400 text-sm transition-all duration-200 box-border"
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={clearSearchInput}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                            p-1 hover:bg-gray-100 rounded-full transition-all duration-200"
                            aria-label="Очистить поиск"
                        >
                            <Image
                                src="/images/chatHeader/closeSearch.svg" // Укажите путь к вашей иконке крестика
                                alt="Clear search"
                                width={14}
                                height={14}
                                className="opacity-60 hover:opacity-100 transition-opacity"
                            />
                        </button>
                    )}
                </div>
            </div>
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
