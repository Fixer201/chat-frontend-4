'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import { useChats } from '@shared/hooks/useChats'
import ChatRoom from '@modules/chat-room/components/ChatRoom'
import { useEffect } from 'react'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'

export default function ChatsPage() {
    const { chats, selectedChatId, loadChats, selectChat } =
        useChats()

    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    // Найти чат по ID
    const selectedChat = chats.find(
        (chat) => chat.id === selectedChatId,
    )

    // Mobile: show chat full-screen if selected, otherwise show sidebar
    // Desktop: always show both
    const showChatOnMobile = !!selectedChat

    return (
        <div
            className={`
          flex h-full w-full gap-2
          md:gap-6
        `}
        >
            {/* Левая колонка - список чатов */}
            <div
                className={`
                  w-full rounded-md border border-app-divider bg-gray-main
                  md:w-80
                  lg:w-96
                  ${
                      showChatOnMobile
                          ? `
                    hidden
                    md:block
                  `
                          : 'block'
                  }
                `}
            >
                {/* Обертка для списка чатов и форм создания групп/каналов */}
                <ChatsListWrapper />
            </div>

            {/* Правая колонка - чат или пустой state */}
            <div
                className={`
                  flex-1 rounded-md border border-app-divider bg-gray-main
                  ${
                      showChatOnMobile
                          ? 'block'
                          : `
                    hidden
                    md:block
                  `
                  }
                `}
            >
                {selectedChat ? (
                    <ChatRoom
                        chat={selectedChat}
                        onBack={() => selectChat(null)}
                    />
                ) : (
                    <EmptyChatState />
                )}
            </div>
        </div>
    )
}
