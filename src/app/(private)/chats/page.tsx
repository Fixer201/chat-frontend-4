'use client'

import ChatRoom from '@modules/chat-room/components/ChatRoom'
import ChatsList from '@modules/chats-list/components/ChatsList'
import { useChats } from '@shared/hooks/useChats'
import { useEffect } from 'react'

export default function ChatsPage() {
    // временно для проверки загружаем 1 чат
    const { chats, loadChats } = useChats()
    useEffect(() => {
        loadChats(1)
    }, [loadChats])

    return (
        <div className="flex h-screen gap-6 max-w-full">
            {/* Левая колонка - список чатов */}
            <div className="w-full h-11/12 bg-primary-foreground rounded-md md:w-80 lg:w-96 bg-gray-main">
                <ChatsList />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div className="hidden h-11/12 flex-1 md:block">
                {/* <EmptyChatState /> по умолчанию когда чат не выбран. Сейчас временно будет сразу отображаться чат */}
                {chats[0] && <ChatRoom chat={chats[0]} />}
            </div>
        </div>
    )
}
