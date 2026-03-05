'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { transformFromApi } from '@shared/lib/transformChatData'
import { ApiChatItem, ChatItem } from '@shared/types/chat'
import GroupInfoSidebar from '@modules/groupInfo/GroupInfoSidebar'
import ChannelInfoSidebar from '@modules/groupInfo/ChannelInfoSidebar'
import { useChats } from '@shared/hooks/useChats'
import { useProfile } from '@shared/hooks/useProfile'

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

interface ChatInfoSidebarProps {
    onClose?: () => void
}

export default function ChatInfoSidebar({
    onClose,
}: ChatInfoSidebarProps) {
    const selectedChatId = useSelector(
        (state: RootState) => state.chats.selectedChatId,
    )
    const chats = useSelector(
        (state: RootState) => state.chats.items,
    )
    const { profile } = useProfile()
    const fetchData = useApiFetcher()

    const {
        chatSettings,
        toggleNotifications,
        deleteChat,
        leaveChat,
        loadChats,
        selectChat,
    } = useChats()

    const [chatData, setChatData] =
        useState<ChatItem | null>(null)
    const [loading, setLoading] = useState(false)
    const [isCurrentUserOwner, setIsCurrentUserOwner] =
        useState(false)

    // Загрузка данных чата с сервера по chatKey
    useEffect(() => {
        if (!selectedChatId) {
            setChatData(null)
            return
        }

        // Ищем чат в Redux, чтобы получить chatKey
        const localChat = chats.find(
            (c) => c.id === selectedChatId,
        )
        if (!localChat || !localChat.chatKey) {
            console.warn(
                'Chat not found or missing chatKey',
            )
            setChatData(null)
            return
        }

        const loadChatFromApi = async () => {
            setLoading(true)
            try {
                const response: ApiChatItem =
                    await fetchData(
                        `/api/v1/chat/list/groups_or_channels/${localChat.chatKey}/`,
                        { method: 'GET' },
                    )
                const transformed =
                    transformFromApi<ApiChatItem>(
                        response,
                    ) as ChatItem
                setChatData(transformed)

                // Определяем, является ли текущий пользователь владельцем
                if (
                    transformed.chatType.includes(
                        'group',
                    ) ||
                    transformed.chatType.includes('channel')
                ) {
                    // В ответе есть поле created_by (uid создателя) или можно использовать owner_full_name
                    const ownerUid = response.created_by
                    setIsCurrentUserOwner(
                        ownerUid === profile?.uid,
                    )
                } else {
                    setIsCurrentUserOwner(false)
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
        }

        loadChatFromApi()
    }, [selectedChatId, chats, fetchData, profile])

    const handleGroupUpdated = useCallback(() => {
        // После обновления группы (например, редактирования) можно перезапросить данные
        if (selectedChatId) {
            const localChat = chats.find(
                (c) => c.id === selectedChatId,
            )
            if (localChat?.chatKey) {
                fetchData(
                    `/api/v1/chat/list/groups_or_channels/${localChat.chatKey}/`,
                    { method: 'GET' },
                )
                    .then((response) => {
                        const transformed =
                            transformFromApi<ApiChatItem>(
                                response,
                            ) as ChatItem
                        setChatData(transformed)
                    })
                    .catch(console.error)
            }
        }
        loadChats('', 15)
    }, [selectedChatId, chats, fetchData, loadChats])

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
            // TODO
        },
        [],
    )

    const handleCloseSidebar = useCallback(() => {
        selectChat(null)
        onClose?.()
    }, [selectChat, onClose])

    const handleLeaveChat = useCallback(async () => {
        if (selectedChatId) {
            await leaveChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, leaveChat, handleCloseSidebar])

    const handleDeleteChat = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId)
            handleCloseSidebar()
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

    if (!selectedChatId) return <EmptyPlaceholder />
    if (loading)
        return (
            <div
                className={`
      flex h-full items-center justify-center p-4 text-text-gray
    `}
            >
                Загрузка...
            </div>
        )
    if (!chatData)
        return (
            <div
                className={`
      flex h-full items-center justify-center p-4 text-text-gray
    `}
            >
                Чат не найден
            </div>
        )

    const { chatType } = chatData
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

    if (chatType === 'chat') return <UserInfoPlaceholder />
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
