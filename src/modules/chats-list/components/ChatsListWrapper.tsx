'use client'
// Импортируем компоненты для различных представлений
import { useState } from 'react'
import ChatsList from './ChatsList'
import CreateGroupForm from '@modules/groups/components/CreateGroupForm'
import GroupMembersList from '@modules/groups/components/GroupMembersList'
import ChannelMembersList from '@modules/channels/components/ChannelMembersList'
import CreateChannelForm from '@modules/channels/components/CreateChannelForm'
import { onNextProps } from '@shared/types/createGroup'
import { Contact } from '@shared/types/contact'

// Определяем типы возможных представлений (экранов) внутри компонента
type View =
    | 'chats'
    | 'create-group'
    | 'group-members'
    | 'create-channel'
    | 'channel-members'

// Основной компонент-обертка для управления отображением списка чатов
// и форм создания групп/каналов
export default function ChatsListWrapper() {
    // Состояние для текущего активного представления (экрана)
    const [currentView, setCurrentView] =
        useState<View>('chats')
    // Состояние для хранения данных создаваемой группы
    const [groupData, setGroupData] =
        useState<onNextProps | null>(null)
    // Состояние для хранения данных создаваемого канала
    const [channelData, setChannelData] =
        useState<onNextProps | null>(null)
    // Состояние для хранения выбранных контактов (участников группы/канала)
    const [selectedContacts, setSelectedContacts] =
        useState<Contact[]>([])

    // Обработчик перехода к форме создания группы
    const handleCreateGroup = () => {
        setCurrentView('create-group')
    }

    // Обработчик возврата из формы создания группы к списку чатов
    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupData(null)
    }

    // Обработчик возврата из списка участников группы к форме создания группы
    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
    }

    // Обработчик перехода к форме создания канала
    const handleCreateChannel = () => {
        setCurrentView('create-channel')
    }
    // Обработчик возврата из формы создания канала к списку чатов
    const handleBackFromCreateChannel = () => {
        setCurrentView('chats')
        setChannelData(null)
    }
    // Обработчик перехода от формы создания группы к выбору участников
    // Принимает либо строку (для обратной совместимости), либо объект с данными группы
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
    // Обработчик перехода от формы создания канала к выбору участников
    const handleNextFromCreateChannel = (
        payload: string | onNextProps,
    ) => {
        if (typeof payload === 'object') {
            // Сохраняем все данные группы
            setChannelData(payload)
        } else {
            // Для обратной совместимости
            setChannelData({
                name: payload,
                description: '',
                type: '',
                photo: null,
            })
        }

        setCurrentView('channel-members')
    }
    // Обработчик возврата из списка участников канала к форме создания канала
    const handleBackFromChannelMembers = () => {
        setCurrentView('create-channel')
    }
    // Обработчик завершения создания группы
    // Принимает массив выбранных контактов
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
    // Обработчик завершения создания канала
    const handleFinishChannelCreation = (
        contacts: Contact[],
    ) => {
        // Собираем все данные для создания группы
        const channelInfo = {
            ...channelData!,
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
            `Создан канал:\n\n` +
                `Название: ${channelData?.name}\n` +
                `Описание: ${channelData?.description}\n` +
                `Тип: ${channelData?.type}\n` +
                `Фото: ${channelData?.photo ? 'Есть' : 'Нет'}\n` +
                `Участники (${contacts.length}): ${memberNames}\n\n` +
                `Объект данных для отправки на сервер:\n` +
                JSON.stringify(channelInfo, null, 2),
        )

        // Здесь можно добавить API вызов для создания группы
        console.log(
            'Данные для создания группы:',
            channelInfo,
        )
        // Сбрасываем состояния
        setCurrentView('chats')
        setChannelData(null)
        setSelectedContacts([])
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
                />
            )

        case 'channel-members':
            return channelData ? (
                <ChannelMembersList
                    channelData={channelData}
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
                        className="mt-4 rounded bg-gray-main px-4 py-2"
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
