'use client'

import { useEffect, useCallback, useState } from 'react'

import ChatRoom from '@modules/chat-room/components/ChatRoom'
import EmptyChatState from '@modules/chat-room/components/EmptyChatState'
import ChatsListWrapper from '@modules/chats-list/components/ChatsListWrapper'
import ChatInfoSidebar from '@modules/groupInfo/ChatInfoSidebar'
import { RootState } from '@redux/store'
import { useChats } from '@shared/hooks/useChats'
import { cn } from '@shared/lib/utils'

import { useSelector } from 'react-redux'

/** Количество чатов, загружаемых при первом рендере страницы */
const INITIAL_CHATS_COUNT = 15

/**
 * Главная страница чатов.
 *
 * Адаптивный макет с двумя колонками:
 * - Мобильные устройства: отображается либо список чатов, либо открытый чат (на весь экран).
 * - Десктоп (md+): обе колонки видны одновременно.
 */
export default function ChatsPage() {
    const { chats, selectedChatId, loadChats, selectChat } =
        useChats()

    /** Загрузка начального списка чатов при монтировании компонента */
    useEffect(() => {
        loadChats(INITIAL_CHATS_COUNT)
    }, [loadChats])

    /** Текущий выбранный чат (undefined - ни один чат не открыт) */
    const selectedChat = chats.find(
        (chat) => chat.id === selectedChatId,
    )

    /**
     * Флаг отображения чата на мобильных устройствах.
     * Когда чат выбран - на мобильном скрывается список и показывается комната чата.
     * На десктопе оба блока видны всегда, поэтому флаг влияет только на mobile-классы.
     */
    const isChatSelected = !!selectedChat

    /** Общие стили для обеих колонок макета */
    const panelStyles =
        'rounded-md border border-app-divider bg-gray-main'

    /**
     * Контент правой колонки:
     * - если чат выбран - отображаем комнату чата с кнопкой «Назад»;
     * - иначе - показываем заглушку с предложением выбрать собеседника.
     */
    const chatContent = selectedChat ? (
        <ChatRoom
            chat={selectedChat}
            onBack={() => selectChat(null)}
        />
    ) : (
        <EmptyChatState />
    )
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
        <div
            className={`
              flex h-full w-full gap-2
              md:gap-6
            `}
        >
            {/* Левая колонка - список чатов и формы создания групп/каналов */}
            <div
                className={cn(
                    panelStyles,
                    `
                      w-full
                      md:w-80
                      lg:w-96
                    `,
                    isChatSelected
                        ? `
                          hidden
                          md:block
                        `
                        : 'block',
                )}
            >
                {/* Обертка для списка чатов и форм создания групп/каналов */}
                <ChatsListWrapper
                    onOpenInfoPanel={handleOpenInfoPanel}
                />
            </div>

            {/* Правая колонка - комната чата или пустое состояние */}
            <div
                className={cn(
                    panelStyles,
                    'flex-1',
                    isChatSelected
                        ? 'block'
                        : `
                          hidden
                          md:block
                        `,
                )}
            >
                {chatContent}
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
