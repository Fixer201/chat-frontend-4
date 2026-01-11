'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'

export default function ChatsPage() {
    return (
        <div className="flex h-screen max-w-full gap-6">
            {/* Левая колонка - список чатов */}
            <div
                className={`
                  h-11/12 w-full rounded-md border border-gray-200 bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ChatsListWrapper />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden h-11/12 flex-1 rounded-md border border-gray-200
                  bg-gray-main
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
