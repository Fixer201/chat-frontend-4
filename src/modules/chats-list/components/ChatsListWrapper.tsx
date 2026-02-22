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
    const [successMessage, setSuccessMessage] = useState<
        string | null
    >(null) // для уведомления

    useEffect(() => {
        loadChats(15)
    }, [loadChats])

    // Сброс ошибки при переходе между представлениями
    useEffect(() => {
        setCreateError(null)
    }, [currentView])

    const handleCreateGroup = () =>
        setCurrentView('create-group')
    const handleCreateChannel = () =>
        setCurrentView('create-channel')

    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupData(null)
    }

    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelData(null)
    }

    const handleBackFromGroupMembers = () =>
        setCurrentView('create-group')
    const handleBackFromChannelMembers = () =>
        setCurrentView('create-channel')

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

    const handleFinishGroupCreation = async (
        contacts: Contact[],
    ) => {
        if (!groupData) return

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            await createGroup(groupData, contacts).unwrap()
            setSuccessMessage(
                `Группа "${groupData.name}" успешно создана!`,
            )
            setCurrentView('chats')
            setGroupData(null)
            setSelectedContacts([])
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании группы'
            setCreateError(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    const handleFinishChannelCreation = async (
        contacts: Contact[],
    ) => {
        if (!channelData) return

        setIsCreating(true)
        setCreateError(null)
        setSelectedContacts(contacts)

        try {
            await createChannel(
                channelData,
                contacts,
            ).unwrap()
            setSuccessMessage(
                `Канал "${channelData.name}" успешно создан!`,
            )
            setCurrentView('chats')
            setChannelData(null)
            setSelectedContacts([])
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при создании канала'
            setCreateError(errorMessage)
        } finally {
            setIsCreating(false)
        }
    }

    const handleCloseToast = () => setSuccessMessage(null)

    // Рендеринг представлений
    const renderView = () => {
        switch (currentView) {
            case 'chats':
                return (
                    <ChatsList
                        onCreateGroup={handleCreateGroup}
                        onCreateChannel={
                            handleCreateChannel
                        }
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
                        <p>
                            Ошибка: данные группы не найдены
                        </p>
                        <button
                            onClick={() =>
                                setCurrentView('chats')
                            }
                            className={`mt-4 rounded bg-gray-main px-4 py-2`}
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
                        onBack={
                            handleBackFromChannelMembers
                        }
                        onFinish={
                            handleFinishChannelCreation
                        }
                        isCreating={isCreating}
                        error={createError}
                    />
                ) : (
                    <div className="p-4">
                        <p>
                            Ошибка: название канала не
                            найдено
                        </p>
                        <button
                            onClick={() =>
                                setCurrentView('chats')
                            }
                            className={`mt-4 rounded bg-gray-main px-4 py-2`}
                        >
                            Вернуться к чатам
                        </button>
                    </div>
                )

            default:
                return (
                    <ChatsList
                        onCreateGroup={handleCreateGroup}
                        onCreateChannel={
                            handleCreateChannel
                        }
                    />
                )
        }
    }

    return (
        <>
            {renderView()}

            {/* Временное уведомление об успехе. В будущем заменить на компонент уведомлений */}
            {successMessage && (
                <div
                    className={`
                      fixed right-4 bottom-4 z-50 rounded-lg bg-green-500 p-4
                      text-white shadow-lg
                    `}
                >
                    <div className="flex items-center gap-2">
                        <span>{successMessage}</span>
                        <button
                            onClick={handleCloseToast}
                            className={`
                              ml-2 text-white
                              hover:text-gray-200
                            `}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
