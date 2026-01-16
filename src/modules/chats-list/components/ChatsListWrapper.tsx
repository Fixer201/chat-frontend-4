// src/modules/chats-list/components/ChatsListWrapper.tsx
'use client'

import { useState } from 'react'
import ChatsList from './ChatsList'
import CreateGroupForm from '@modules/groups/components/CreateGroupForm'
import GroupMembersList from '@modules/groups/components/GroupMembersList'
import ChannelMembersList from '@modules/channels/components/ChannelMembersList'
import CreateChannelForm from '@modules/channels/components/CreateChannelForm'
import { onNextProps } from '@shared/types/createGroup'
import { Contact } from '@shared/types/contact'

type View =
    | 'chats'
    | 'create-group'
    | 'group-members'
    | 'create-channel'
    | 'channel-members'

export default function ChatsListWrapper() {
    const [currentView, setCurrentView] =
        useState<View>('chats')
    const [groupName, setGroupName] = useState<string>('')
    const [groupData, setGroupData] =
        useState<onNextProps | null>(null)
    const [channelName, setChannelName] =
        useState<string>('')
    const [selectedContacts, setSelectedContacts] =
        useState<Contact[]>([])
    // Обработчики для группы
    const handleCreateGroup = () => {
        setCurrentView('create-group')
    }

    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupName('')
    }

    const handleNextFromCreateGroup = (
        payload: onNextProps | string,
    ) => {
        if (typeof payload === 'object') {
            // Сохраняем все данные группы
            setGroupData(payload)
        } else {
            // Для обратной совместимости
            setGroupData({
                name: payload,
                description: '',
                type: '',
                photo: null,
            })
        }
        setCurrentView('group-members')
    }

    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
    }

    const handleFinishGroupCreation = (
        contacts: Contact[],
    ) => {
        setSelectedContacts(contacts)

        // Собираем все данные для создания группы
        const groupInfo = {
            ...groupData!,
            members: contacts,
            membersCount: contacts.length,
        }

        // Показываем алерт со всеми данными
        const memberNames = contacts
            .map(
                (contact) =>
                    `${contact.firstName} ${contact.lastName}`,
            )
            .join(', ')

        alert(
            `Создана группа:\n\n` +
                `Название: ${groupData?.name}\n` +
                `Описание: ${groupData?.description}\n` +
                `Тип: ${groupData?.type}\n` +
                `Фото: ${groupData?.photo ? 'Есть' : 'Нет'}\n` +
                `Участники (${contacts.length}): ${memberNames}\n\n` +
                `Объект данных для отправки на сервер:\n` +
                JSON.stringify(groupInfo, null, 2),
        )

        // Здесь можно добавить API вызов для создания группы
        console.log(
            'Данные для создания группы:',
            groupInfo,
        )

        // Сбрасываем состояния
        setCurrentView('chats')
        setGroupData(null)
        setSelectedContacts([])
    }

    // Обработчики для канала
    const handleCreateChannel = () => {
        setCurrentView('create-channel')
    }

    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelName('')
    }

    const handleNextFromCreateChannel = (
        payload: string | onNextProps,
    ) => {
        const name =
            typeof payload === 'string'
                ? payload
                : (payload?.name ?? '')
        setChannelName(name)
        setCurrentView('channel-members')
    }

    const handleBackFromChannelMembers = () => {
        setCurrentView('create-channel')
    }

    const handleFinishChannelCreation = () => {
        setCurrentView('chats')
        console.log(`Канал "${channelName}" создан!`)
        setChannelName('')
    }

    // Рендерим соответствующий компонент
    switch (currentView) {
        case 'chats':
            return (
                <ChatsList
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )

        case 'create-group':
            return (
                <CreateGroupForm
                    onBack={handleBackFromCreateGroup}
                    onNext={handleNextFromCreateGroup}
                />
            )

        case 'group-members':
            return groupData ? (
                <GroupMembersList
                    groupData={groupData} // Передаем все данные группы
                    onBack={handleBackFromGroupMembers}
                    onFinish={handleFinishGroupCreation}
                />
            ) : (
                <div className="p-4">
                    <p>Ошибка: данные группы не найдены</p>
                    <button
                        onClick={() =>
                            setCurrentView('chats')
                        }
                        className="mt-4 rounded bg-gray-200 px-4 py-2"
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
                />
            )

        case 'channel-members':
            return channelName ? (
                <ChannelMembersList
                    channelName={channelName}
                    onBack={handleBackFromChannelMembers}
                    onFinish={handleFinishChannelCreation}
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
                        className="mt-4 rounded bg-gray-200 px-4 py-2"
                    >
                        Вернуться к чатам
                    </button>
                </div>
            )

        default:
            return (
                <ChatsList
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )
    }
}
