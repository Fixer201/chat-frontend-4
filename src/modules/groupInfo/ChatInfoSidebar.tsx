// src/modules/chat-info/components/ChatInfoSidebar.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { getChatByIdFromStorage } from '@shared/lib/localStorageChats'
import { transformFromApi } from '@shared/lib/transformChatData'
import { ApiChatItem, ChatItem } from '@shared/types/chat'
import GroupInfoSidebar from '@modules/groupInfo/GroupInfoSidebar'
import { useChats } from '@shared/hooks/useChats'

// Временные заглушки для других типов чатов
const ChannelInfoPlaceholder = () => (
    <div className="flex h-full items-center justify-center p-4 text-text-gray">
        Информация о канале (в разработке)
    </div>
)

const UserInfoPlaceholder = () => (
    <div className="flex h-full items-center justify-center p-4 text-text-gray">
        Информация о пользователе (в разработке)
    </div>
)

const EmptyPlaceholder = () => (
    <div className="flex h-full items-center justify-center p-4 text-text-gray">
        Выберите чат
    </div>
)

export default function ChatInfoSidebar() {
    const selectedChatId = useSelector(
        (state: RootState) => state.chats.selectedChatId,
    )
    const {
        chatSettings,
        toggleNotifications,
        deleteChat,
        selectChat,
    } = useChats()
    const [chatData, setChatData] =
        useState<ChatItem | null>(null)
    const [loading, setLoading] = useState(false)

    // // Загрузка данных при изменении selectedChatId
    // useEffect(() => {
    //   if (!selectedChatId) {
    //     setChatData(null)
    //     return
    //   }

    //   setLoading(true)
    //   // Имитация асинхронной загрузки (setTimeout, но можно и синхронно)
    //   const loadData = () => {
    //     try {
    //       const rawData: ApiChatItem | null = getChatByIdFromStorage(selectedChatId)
    //       if (rawData) {
    //         const transformed = transformFromApi<ApiChatItem>(rawData) as ChatItem
    //         setChatData(transformed)
    //       } else {
    //         setChatData(null)
    //       }
    //     } catch (error) {
    //       console.error('Ошибка загрузки данных чата:', error)
    //       setChatData(null)
    //     } finally {
    //       setLoading(false)
    //     }
    //   }

    //   // Можно выполнить синхронно, но для единообразия используем setTimeout
    //   const timer = setTimeout(loadData, 0)
    //   return () => clearTimeout(timer)
    // }, [selectedChatId])

    // Загрузка данных из localStorage
    useEffect(() => {
        if (!selectedChatId) {
            setChatData(null)
            return
        }
        setLoading(true)
        const timer = setTimeout(() => {
            try {
                const rawData =
                    getChatByIdFromStorage(selectedChatId)
                if (rawData) {
                    const transformed =
                        transformFromApi<ApiChatItem>(
                            rawData,
                        ) as ChatItem
                    setChatData(transformed)
                } else {
                    setChatData(null)
                }
            } catch (error) {
                console.error(
                    'Ошибка загрузки данных чата:',
                    error,
                )
                setChatData(null)
            } finally {
                setLoading(false)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [selectedChatId])
    const handleNotificationsChange = useCallback(
        (enabled: boolean) => {
            if (selectedChatId) {
                toggleNotifications(selectedChatId)
            }
        },
        [selectedChatId, toggleNotifications],
    )

    const handleClearChat = useCallback(
        (deleteForEveryone: boolean) => {
            console.log('Очистка чата', deleteForEveryone)
            // TODO: реализовать очистку чата, когда появится экшен
        },
        [],
    )
    const handleCloseSidebar = useCallback(() => {
        selectChat(null)
    }, [selectChat])
    const handleLeaveGroup = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

    const handleDeleteGroup = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

    // Обработка состояний загрузки/отсутствия выбранного чата
    if (!selectedChatId) {
        return <EmptyPlaceholder />
    }

    if (loading) {
        return (
            <div
                className={`
        flex h-full items-center justify-center p-4 text-text-gray
      `}
            >
                Загрузка...
            </div>
        )
    }

    if (!chatData) {
        return (
            <div
                className={`
        flex h-full items-center justify-center p-4 text-text-gray
      `}
            >
                Чат не найден
            </div>
        )
    }

    // Определяем тип чата и рендерим соответствующий компонент
    const { chatType } = chatData

    if (chatType.includes('group')) {
        const participantsCount =
            chatData.participants?.length || 0
        const inviteLink = chatData.chatKey
            ? `https://a-chat.su/invite/${chatData.chatKey}`
            : undefined
        const currentNotifications = selectedChatId
            ? (chatSettings[selectedChatId]
                  ?.notificationsEnabled ?? true)
            : true

        return (
            <GroupInfoSidebar
                chatKey={chatData.chatKey}
                name={chatData.name}
                participantsCount={participantsCount}
                description={chatData.description}
                inviteLink={inviteLink}
                notificationsEnabled={currentNotifications}
                onNotificationsChange={
                    handleNotificationsChange
                }
                onClose={handleCloseSidebar}
                onClearChat={handleClearChat}
                onLeaveGroup={handleLeaveGroup}
                onDeleteGroup={handleDeleteGroup}
            />
        )
    }

    if (chatType.includes('channel')) {
        return <ChannelInfoPlaceholder />
    }

    if (chatType === 'chat') {
        return <UserInfoPlaceholder />
    }

    // На случай неизвестного типа
    return (
        <div className="flex h-full items-center justify-center p-4 text-text-gray">
            Неизвестный тип чата
        </div>
    )
}
