// ChatInfoSidebar.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { getChatByIdFromStorage } from '@shared/lib/localStorageChats' // Получение чата по ID из localStorage
import { findGroupParticipantsByChatKey } from '@shared/lib/localStorageGroupParticipants' // Поиск участников группы
import { transformFromApi } from '@shared/lib/transformChatData' // Трансформация данных чата из API-формата
import { ApiChatItem, ChatItem } from '@shared/types/chat' // Типы чатов
import GroupInfoSidebar from '@modules/groupInfo/GroupInfoSidebar' // Компонент информации о группе
import ChannelInfoSidebar from '@modules/groupInfo/ChannelInfoSidebar' // Компонент информации о канале
import { useChats } from '@shared/hooks/useChats' // Хук для работы с чатами
import { useProfile } from '@shared/hooks/useProfile'
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

// Интерфейс пропсов компонента
interface ChatInfoSidebarProps {
    onClose?: () => void // Функция закрытия сайдбара
}

export default function ChatInfoSidebar({
    onClose,
}: ChatInfoSidebarProps) {
    // Получаем ID выбранного чата из Redux
    const selectedChatId = useSelector(
        (state: RootState) => state.chats.selectedChatId,
    )
    const { profile } = useProfile()
    // Хук для работы с чатами
    const {
        chatSettings,
        toggleNotifications,
        deleteChat,
        leaveChat,
        loadChats,
        selectChat,
    } = useChats()

    const [chatData, setChatData] =
        useState<ChatItem | null>(null) // Данные чата
    const [loading, setLoading] = useState(false) // Состояние загрузки
    const [updateTrigger, setUpdateTrigger] = useState(0) // Триггер для обновления данных
    const [isCurrentUserOwner, setIsCurrentUserOwner] =
        useState(false) // Флаг, является ли текущий пользователь владельцем

    // Загрузка данных из localStorage при изменении selectedChatId или updateTrigger
    useEffect(() => {
        if (!selectedChatId) {
            setChatData(null)
            setLoading(false)
            return
        }

        setLoading(true)
        setChatData(null)
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

                    // Определяем, является ли текущий пользователь владельцем
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
                        if (participants) {
                            const owner = participants.find(
                                (p) => p.isOwner,
                            )
                            // Сравниваем с реальным uid из профиля (или с плейсхолдером, если профиль ещё не загружен)
                            if (profile?.uid) {
                                setIsCurrentUserOwner(
                                    owner?.uid ===
                                        profile.uid ||
                                        owner?.uid ===
                                            'current-user-uid',
                                )
                            } else {
                                // Если профиль не загружен, считаем владельцем только если uid === плейсхолдер
                                setIsCurrentUserOwner(
                                    owner?.uid ===
                                        'current-user-uid',
                                )
                            }
                        } else {
                            setIsCurrentUserOwner(false)
                        }
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
    }, [selectedChatId, updateTrigger, profile?.uid])

    // Обработчик обновления группы/канала
    const handleGroupUpdated = useCallback(() => {
        setUpdateTrigger((prev) => prev + 1) // Увеличиваем триггер для перезагрузки данных
        loadChats(15) // Перезагружаем список чатов
    }, [loadChats])

    // Обработчик изменения уведомлений
    const handleNotificationsChange = useCallback(
        (enabled: boolean) => {
            if (selectedChatId) {
                toggleNotifications(selectedChatId) // Переключаем уведомления
            }
        },
        [selectedChatId, toggleNotifications],
    )

    // Обработчик очистки чата
    const handleClearChat = useCallback(
        (deleteForEveryone: boolean) => {
            console.log('Очистка чата', deleteForEveryone)
            // TODO: реализовать очистку чата
        },
        [],
    )

    // Обработчик закрытия сайдбара
    const handleCloseSidebar = useCallback(() => {
        selectChat(null) // Сбрасываем выбранный чат в Redux
        onClose?.() // Вызываем внешний колбэк
    }, [selectChat, onClose])

    // Обработчик выхода из чата/группы/канала
    const handleLeaveChat = useCallback(async () => {
        if (selectedChatId) {
            await leaveChat(selectedChatId) // Выходим из чата через WebSocket
            handleCloseSidebar() // Закрываем сайдбар
        }
    }, [selectedChatId, leaveChat, handleCloseSidebar])

    // Обработчик удаления чата (для групп/каналов, где пользователь владелец)
    const handleDeleteChat = useCallback(async () => {
        if (selectedChatId) {
            await deleteChat(selectedChatId) // Удаляем чат
            handleCloseSidebar() // Закрываем сайдбар
        }
    }, [selectedChatId, deleteChat, handleCloseSidebar])

    // Если нет выбранного чата
    if (!selectedChatId) {
        return <EmptyPlaceholder />
    }

    // Состояние загрузки
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

    // Если чат не найден
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
        chatData.participants?.length || 0 // Количество участников
    const inviteLink = chatData.chatKey
        ? `https://a-chat.su/invite/${chatData.chatKey}`
        : undefined // Ссылка-приглашение
    const currentNotifications = selectedChatId
        ? (chatSettings[selectedChatId]
              ?.notificationsEnabled ?? true)
        : true // Текущий статус уведомлений

    // В зависимости от типа чата рендерим соответствующий компонент
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

    // Неизвестный тип чата
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
