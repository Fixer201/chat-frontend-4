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

// Типы для представлений компонента
type View =
    | 'chats'
    | 'create-group'
    | 'group-members'
    | 'create-channel'
    | 'channel-members'

export default function ChatsListWrapper() {
    // Хуки для работы с чатами
    const { createGroup, createChannel, loadChats } =
        useChats()

    // Состояния для управления представлениями и данными
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

    // Ключ для принудительного обновления ChatsList при создании нового чата
    const [chatsListKey, setChatsListKey] = useState(0)

    // Загрузка чатов при монтировании компонента
    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    // Обработчик перехода к созданию группы
    const handleCreateGroup = () => {
        setCurrentView('create-group')
        setCreateError(null)
    }

    // Обработчик возврата из формы создания группы
    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupData(null)
        setCreateError(null)
        setChatsListKey((prev) => prev + 1) // Принудительное обновление списка чатов
    }

    // Обработчик возврата из списка участников группы
    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
        setCreateError(null)
    }

    // Обработчик перехода к созданию канала
    const handleCreateChannel = () => {
        setCurrentView('create-channel')
        setCreateError(null)
    }

    // Обработчик возврата из формы создания канала
    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelData(null)
        setCreateError(null)
        setChatsListKey((prev) => prev + 1) // Принудительное обновление списка чатов
    }

    // Обработчик перехода от создания группы к выбору участников
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

    // Обработчик перехода от создания канала к выбору участников
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

    // Обработчик возврата из списка участников канала
    const handleBackFromChannelMembers = () => {
        setCurrentView('create-channel')
        setCreateError(null)
    }

    // Создание группы с выбранными участниками
    const handleFinishGroupCreation = async (
        contacts: Contact[],
    ) => {
        if (!groupData) return

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            const result = await createGroup(
                groupData,
                contacts,
            ).unwrap()

            // Формирование строки с именами участников для отображения
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

            // Сброс состояний и возврат к списку чатов
            setCurrentView('chats')
            setGroupData(null)
            setSelectedContacts([])
            setChatsListKey((prev) => prev + 1)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании группы'
            setCreateError(errorMessage)
            alert(
                `Ошибка при создании группы: ${errorMessage}`,
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Создание канала с выбранными участниками
    const handleFinishChannelCreation = async (
        contacts: Contact[],
    ) => {
        if (!channelData) return

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            const result = await createChannel(
                channelData,
                contacts,
            ).unwrap()

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
            setChatsListKey((prev) => prev + 1)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании канала'
            setCreateError(errorMessage)
            alert(
                `Ошибка при создании канала: ${errorMessage}`,
            )
        } finally {
            setIsCreating(false)
        }
    }

    // Рендеринг соответствующего компонента в зависимости от текущего представления
    switch (currentView) {
        case 'chats':
            return (
                <ChatsList
                    key={`chats-list-${chatsListKey}`}
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
