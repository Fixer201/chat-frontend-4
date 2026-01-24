// ChatsListWrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import ChatsList from './ChatsList'
import CreateGroupForm from '@modules/groups/components/CreateGroupForm'
import GroupMembersList from '@modules/groups/components/GroupMembersList'
import ChannelMembersList from '@modules/channels/components/ChannelMembersList'
import CreateChannelForm from '@modules/channels/components/CreateChannelForm'
import { onNextProps } from '@shared/types/createGroup'
import { Contact } from '@shared/types/contact'
import { useChats } from '@shared/hooks/useChats'

type View =
    | 'chats'
    | 'create-group'
    | 'group-members'
    | 'create-channel'
    | 'channel-members'

export default function ChatsListWrapper() {
    const { createGroup, createChannel, loadChats } =
        useChats()
    const [currentView, setCurrentView] =
        useState<View>('chats')
    const [groupData, setGroupData] =
        useState<onNextProps | null>(null)
    const [channelData, setChannelData] =
        useState<onNextProps | null>(null)
    const [selectedContacts, setSelectedContacts] =
        useState<Contact[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState<
        string | null
    >(null)
    const [chatsListKey, setChatsListKey] = useState(0) // Ключ для принудительного обновления ChatsList

    // Загружаем чаты при монтировании
    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    // Обработчики навигации
    const handleCreateGroup = () => {
        setCurrentView('create-group')
        setCreateError(null)
    }

    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupData(null)
        setCreateError(null)
        setChatsListKey((prev) => prev + 1) // Принудительное обновление
    }

    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
        setCreateError(null)
    }

    const handleCreateChannel = () => {
        setCurrentView('create-channel')
        setCreateError(null)
    }

    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelData(null)
        setCreateError(null)
        setChatsListKey((prev) => prev + 1) // Принудительное обновление
    }

    const handleNextFromCreateGroup = (
        payload: onNextProps | string,
    ) => {
        if (typeof payload === 'object') {
            setGroupData(payload)
        } else {
            setGroupData({
                name: payload,
                description: '',
                type: '',
                photo: null,
            })
        }
        setCurrentView('group-members')
    }

    const handleNextFromCreateChannel = (
        payload: string | onNextProps,
    ) => {
        if (typeof payload === 'object') {
            setChannelData(payload)
        } else {
            setChannelData({
                name: payload,
                description: '',
                type: '',
                photo: null,
            })
        }
        setCurrentView('channel-members')
    }

    const handleBackFromChannelMembers = () => {
        setCurrentView('create-channel')
        setCreateError(null)
    }

    // Обработчик завершения создания группы
    const handleFinishGroupCreation = async (
        contacts: Contact[],
    ) => {
        if (!groupData) return

        console.log('🚀 Начало создания группы:', {
            name: groupData.name,
            contactsCount: contacts.length,
        })

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            console.log(
                '📤 Вызов createGroup с данными:',
                groupData,
            )
            const result = await createGroup(
                groupData,
                contacts,
            ).unwrap()

            // Показываем успешное сообщение
            const memberNames = contacts
                .map(
                    (contact) =>
                        `${contact.firstName} ${contact.lastName}`,
                )
                .join(', ')

            alert(
                `Создана группа:\n\n` +
                    `Название: ${groupData.name}\n` +
                    `Описание: ${groupData.description}\n` +
                    `Тип: ${groupData.type}\n` +
                    `Фото: ${groupData.photo ? 'Есть' : 'Нет'}\n` +
                    `Участники (${contacts.length}): ${memberNames}\n\n` +
                    `Группа успешно создана и добавлена в список чатов!`,
            )

            // Сбрасываем состояния и возвращаемся к списку чатов
            setCurrentView('chats')
            setGroupData(null)
            setSelectedContacts([])
            setChatsListKey((prev) => prev + 1) // ОЧЕНЬ ВАЖНО: принудительное обновление

            console.log(
                '🔄 Возврат к списку чатов, ключ обновлен:',
                chatsListKey + 1,
            )
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании группы'
            console.error(
                '❌ Ошибка при создании группы:',
                error,
            )
            setCreateError(errorMessage)
            alert(
                `Ошибка при создании группы: ${errorMessage}`,
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Обработчик завершения создания канала
    const handleFinishChannelCreation = async (
        contacts: Contact[],
    ) => {
        if (!channelData) return

        console.log('🚀 Начало создания канала:', {
            name: channelData.name,
            contactsCount: contacts.length,
        })

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            console.log(
                '📤 Вызов createChannel с данными:',
                channelData,
            )
            const result = await createChannel(
                channelData,
                contacts,
            ).unwrap()

            console.log('✅ Канал создан в Redux:', {
                id: result.chat.id,
                name: result.chat.name,
                type: result.chat.chatType,
            })

            const memberNames = contacts
                .map(
                    (contact) =>
                        `${contact.firstName} ${contact.lastName}`,
                )
                .join(', ')

            alert(
                `Создан канал:\n\n` +
                    `Название: ${channelData.name}\n` +
                    `Описание: ${channelData.description}\n` +
                    `Тип: ${channelData.type}\n` +
                    `Фото: ${channelData.photo ? 'Есть' : 'Нет'}\n` +
                    `Участники (${contacts.length}): ${memberNames}\n\n` +
                    `Канал успешно создан и добавлен в список чатов!`,
            )

            setCurrentView('chats')
            setChannelData(null)
            setSelectedContacts([])
            setChatsListKey((prev) => prev + 1) // ОЧЕНЬ ВАЖНО: принудительное обновление

            console.log(
                '🔄 Возврат к списку чатов, ключ обновлен:',
                chatsListKey + 1,
            )
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании канала'
            console.error(
                '❌ Ошибка при создании канала:',
                error,
            )
            setCreateError(errorMessage)
            alert(
                `Ошибка при создании канала: ${errorMessage}`,
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Рендерим соответствующий компонент
    switch (currentView) {
        case 'chats':
            return (
                <ChatsList
                    key={`chats-list-${chatsListKey}`} // Ключ для принудительного обновления
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )

        case 'create-group':
            return (
                <CreateGroupForm
                    onBack={handleBackFromCreateGroup}
                    onNext={handleNextFromCreateGroup}
                    initialData={groupData}
                />
            )

        case 'group-members':
            return groupData ? (
                <GroupMembersList
                    groupData={groupData}
                    onBack={handleBackFromGroupMembers}
                    onFinish={handleFinishGroupCreation}
                    isCreating={isCreating}
                    error={createError}
                />
            ) : (
                <div className="p-4">
                    <p>Ошибка: данные группы не найдены</p>
                    <button
                        onClick={() =>
                            setCurrentView('chats')
                        }
                        className="mt-4 rounded bg-gray-main px-4 py-2"
                    >
                        Вернуться к чатам
                    </button>
                </div>
            )

        case 'create-channel':
            return (
                <CreateChannelForm
                    onBack={handleBackFromCreateChannel}
                    onNext={handleNextFromCreateChannel}
                    initialData={channelData}
                />
            )

        case 'channel-members':
            return channelData ? (
                <ChannelMembersList
                    channelData={channelData}
                    onBack={handleBackFromChannelMembers}
                    onFinish={handleFinishChannelCreation}
                    isCreating={isCreating}
                    error={createError}
                />
            ) : (
                <div className="p-4">
                    <p>
                        Ошибка: название канала не найдено
                    </p>
                    <button
                        onClick={() =>
                            setCurrentView('chats')
                        }
                        className="mt-4 rounded bg-gray-main px-4 py-2"
                    >
                        Вернуться к чатам
                    </button>
                </div>
            )

        default:
            return (
                <ChatsList
                    key={`chats-list-default-${chatsListKey}`}
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )
    }
}
