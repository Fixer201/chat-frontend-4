'use client'

import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'
import ChatInfoSidebar from '@modules/groupInfo/ChatInfoSidebar'
import { RootState } from '@redux/store'
import { useChats } from '@shared/hooks/useChats'
import { cn } from '@shared/lib/utils'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

export default function ChatsPage() {
    const { selectChat } = useChats()
    const [infoPanelChatId, setInfoPanelChatId] = useState<
        number | null
    >(null)
    const handleOpenInfoPanel = useCallback(
        (chatId: number) => {
            selectChat(chatId) // выделяем чат в списке
            setInfoPanelChatId(chatId) // открываем панель
        },
        [selectChat],
    )

    const handleCloseInfoPanel = useCallback(() => {
        setInfoPanelChatId(null)
        // можно оставить выделение или снять:
        // selectChat(null)
    }, [])

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
                <ChatsListWrapper
                    onOpenInfoPanel={handleOpenInfoPanel}
                />
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

            {/* Третий блок - информация о выбранном чате */}
            {infoPanelChatId !== null && (
                <div
                    className={cn(`
                  hidden h-(--screen-height-list) overflow-hidden rounded-md
                  border border-app-divider bg-gray-main
                  md:block md:w-80
                  lg:w-96
                `)}
                >
                    <ChatInfoSidebar
                        onClose={handleCloseInfoPanel}
                    />
                </div>
            )}
        </div>
    )
}
