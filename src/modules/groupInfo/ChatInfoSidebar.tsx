'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { getChatByIdFromStorage } from '@shared/lib/localStorageChats'
import { findGroupParticipantsByChatKey } from '@shared/lib/localStorageGroupParticipants'
import { transformFromApi } from '@shared/lib/transformChatData'
import { ApiChatItem, ChatItem } from '@shared/types/chat'
import GroupInfoSidebar from '@modules/groupInfo/GroupInfoSidebar'
import ChannelInfoSidebar from '@modules/groupInfo/ChannelInfoSidebar' // импортируем новый компонент
import { useChats } from '@shared/hooks/useChats'

// Временные заглушки для других типов чатов
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
interface ChatInfoSidebarProps {
    onClose?: () => void
}

export default function ChatInfoSidebar({
    onClose,
}: ChatInfoSidebarProps) {
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

                    // Для групп и каналов проверяем, является ли текущий пользователь владельцем
                    if (
                        transformed.chatType.includes(
                            'group',
                        ) ||
                        transformed.chatType.includes(
                            'channel',
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
        setUpdateTrigger((prev) => prev + 1)
        loadChats(15)
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
            // TODO: реализовать очистку чата
        },
        [],
    )

    const handleCloseSidebar = useCallback(() => {
        selectChat(null)
        onClose?.()
    }, [selectChat, onClose])

    const handleLeaveChat = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

    const handleDeleteChat = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

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

    const { chatType } = chatData

    // Общие вычисляемые значения
    const participantsCount =
        chatData.participants?.length || 0
    const inviteLink = chatData.chatKey
        ? `https://a-chat.su/invite/${chatData.chatKey}`
        : undefined
    const currentNotifications = selectedChatId
        ? (chatSettings[selectedChatId]
              ?.notificationsEnabled ?? true)
        : true

    if (chatType.includes('group')) {
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
                onLeaveGroup={handleLeaveChat}
                onDeleteGroup={handleDeleteChat}
                avatarUrl={chatData.chat.avatarUrl}
                onGroupUpdated={handleGroupUpdated}
                isCurrentUserOwner={isCurrentUserOwner}
            />
        )
    }

    if (chatType.includes('channel')) {
        return (
            <ChannelInfoSidebar
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
                onLeaveChannel={handleLeaveChat}
                onDeleteChannel={handleDeleteChat}
                avatarUrl={chatData.chat.avatarUrl}
                onChannelUpdated={handleGroupUpdated}
                isCurrentUserOwner={isCurrentUserOwner}
            />
        )
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
