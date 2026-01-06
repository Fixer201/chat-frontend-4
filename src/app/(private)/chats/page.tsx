'use client'

import ChatsList from '@modules/chats-list/components/ChatsList'
import EmptyChatState from '@modules/chat-room/components/EmptyChatState'

export default function ChatsPage() {
    return (
        <div className="flex h-screen max-w-full gap-6">
            {/* Левая колонка - список чатов */}
            <div
                className={`
                  h-11/12 w-full rounded-md bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ChatsList />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden h-11/12 flex-1
                  md:block
                `}
            >
                <EmptyChatState />
                {/* по умолчанию когда чат не
                выбран. */}
            </div>
        </div>
    )
}
