'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'
import GroupInfoSidebar from '@modules/groupInfo/GroupInfoSidebar'

export default function ChatsPage() {
    return (
        <div className="flex min-h-11/12 max-w-full gap-6">
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
                <EmptyChatState />
                {/* по умолчанию когда чат не
                выбран. */}
            </div>

            <div
                className={`
                      hidden rounded-md border border-app-divider bg-gray-main
                      md:block md:w-80
                      lg:w-96
                    `}
            >
                <GroupInfoSidebar />
                {/* Третий блок - пока пустой */}
                {/* Содержимое будет добавлено позже */}
            </div>
        </div>
    )
}
