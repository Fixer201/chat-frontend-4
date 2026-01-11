// src/modules/chats-list/components/ChatsListWrapper.tsx
'use client'

import { useState } from 'react'
import ChatsList from './ChatsList'
import CreateGroupForm from '@modules/groups/components/CreateGroupForm'
import GroupMembersList from '@modules/groups/components/GroupMembersList'
import ChannelMembersList from '@modules/channels/components/ChannelMembersList'
import CreateChannelForm from '@modules/channels/components/CreateChannelForm'

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
    const [channelName, setChannelName] =
        useState<string>('')

    // Обработчики для группы
    const handleCreateGroup = () => {
        setCurrentView('create-group')
    }

    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupName('')
    }

    const handleNextFromCreateGroup = (name: string) => {
        setGroupName(name)
        setCurrentView('group-members')
    }

    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
    }

    const handleFinishGroupCreation = () => {
        setCurrentView('chats')
        console.log(`Группа "${groupName}" создана!`)
        setGroupName('')
    }

    // Обработчики для канала
    const handleCreateChannel = () => {
        setCurrentView('create-channel')
    }

    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelName('')
    }

    const handleNextFromCreateChannel = (name: string) => {
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
            return groupName ? (
                <GroupMembersList
                    groupName={groupName}
                    onBack={handleBackFromGroupMembers}
                    onFinish={handleFinishGroupCreation}
                />
            ) : (
                <div className="p-4">
                    <p>
                        Ошибка: название группы не найдено
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
