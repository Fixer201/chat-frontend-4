'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { getChatByIdFromStorage } from '@shared/lib/localStorageChats'
import { findGroupParticipantsByChatKey } from '@shared/lib/localStorageGroupParticipants'
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

// Временный UID текущего пользователя (должен браться из стора/контекста)
const CURRENT_USER_UID = 'current-user-uid'

export default function ChatInfoSidebar() {
    const selectedChatId = useSelector(
        (state: RootState) => state.chats.selectedChatId,
    )
    const {
        chatSettings,
        toggleNotifications,
        deleteChat,
        loadChats,
        selectChat,
    } = useChats()
    const [chatData, setChatData] =
        useState<ChatItem | null>(null)
    const [loading, setLoading] = useState(false)
    const [updateTrigger, setUpdateTrigger] = useState(0)
    const [isCurrentUserOwner, setIsCurrentUserOwner] =
        useState(false)

    // Загрузка данных из localStorage (добавляем updateTrigger в зависимости)
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

                    // Для групп проверяем, является ли текущий пользователь владельцем
                    if (
                        transformed.chatType.includes(
                            'group',
                        )
                    ) {
                        const participants =
                            findGroupParticipantsByChatKey(
                                transformed.chatKey,
                            )
                        const owner = participants?.find(
                            (p) => p.isOwner,
                        )
                        setIsCurrentUserOwner(
                            owner?.uid === CURRENT_USER_UID,
                        )
                    } else {
                        setIsCurrentUserOwner(false)
                    }
                } else {
                    setChatData(null)
                    setIsCurrentUserOwner(false)
                }
            } catch (error) {
                console.error(
                    'Ошибка загрузки данных чата:',
                    error,
                )
                setChatData(null)
                setIsCurrentUserOwner(false)
            } finally {
                setLoading(false)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [selectedChatId, updateTrigger])

    const handleGroupUpdated = useCallback(() => {
        setUpdateTrigger((prev) => prev + 1) // для перезагрузки данных текущего чата
        loadChats(15) // перезагружаем весь список чатов
    }, [loadChats])

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
                chatId={chatData.id}
                chatType={chatData.chatType}
                chatKey={chatData.chatKey}
                chatUid={chatData.chat.uid}
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
                avatarUrl={chatData.chat.avatarUrl}
                onGroupUpdated={handleGroupUpdated}
                isCurrentUserOwner={isCurrentUserOwner} // <-- новый пропс
            />
        )
    }

    if (chatType.includes('channel')) {
        return <ChannelInfoPlaceholder />
    }

    if (chatType === 'chat') {
        return <UserInfoPlaceholder />
    }

    return (
        <div
            className={`
          flex h-full items-center justify-center p-4 text-text-gray
        `}
        >
            Неизвестный тип чата
        </div>
    )
}
