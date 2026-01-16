'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'

export default function ChatsPage() {
    return (
        <div className="flex min-h-dvh max-w-full gap-6">
            {/* Левая колонка - список чатов */}
            <div
                className={`
                  w-full rounded-md border border-gray-200 bg-gray-main
                  md:w-80
                  lg:w-96
                `}
            >
                <ChatsListWrapper />
            </div>

            {/* Правая колонка - пустой state (скрыт на mobile) */}
            <div
                className={`
                  hidden flex-1 rounded-md border border-gray-200 bg-gray-main
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
