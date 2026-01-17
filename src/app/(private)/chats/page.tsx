'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import { useChats } from '@shared/hooks/useChats'
import ChatRoom from '@modules/chat-room/components/ChatRoom'
import { useEffect } from 'react'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'

export default function ChatsPage() {
    const { chats, selectedChatId, loadChats } = useChats()

    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    // Найти чат по ID
    const selectedChat = chats.find(
        (chat) => chat.id === selectedChatId,
    )

    return (
        <div className="flex h-screen max-w-full gap-6">
            {/* Левая колонка - список чатов */}
            <div
                className={`
                  w-full rounded-md border border-app-divider bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                {/* Обертка для списка чатов и форм создания групп/каналов */}
                <ChatsListWrapper />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden flex-1 rounded-md border border-app-divider
                  bg-gray-main
                  md:block
                `}
            >
                {selectedChat ? (
                    <ChatRoom chat={selectedChat} />
                ) : (
                    <EmptyChatState />
                )}
            </div>
        </div>
    )
}
