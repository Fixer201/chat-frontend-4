'use client'
// Указываем, что компонент является клиентским (использует хуки React)
// Это необходимо для Next.js, чтобы компонент рендерился только на клиенте
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
// Используем union type для type safety - TypeScript будет проверять, что мы обрабатываем все возможные варианты
type View =
    | 'chats'
    | 'create-group'
    | 'group-members'
    | 'create-channel'
    | 'channel-members'

// Основной компонент-обертка для управления отображением списка чатов и форм создания групп/каналов
// Работает как конечный автомат состояний (state machine) - управляет переходами между разными view
export default function ChatsListWrapper() {
    // Состояние для текущего активного представления (экрана)
    // Используем useState с явным указанием типа для предотвращения ошибок
    const [currentView, setCurrentView] =
        useState<View>('chats')
    // Состояние для хранения данных создаваемой группы
    // Используем null как начальное значение, так как данные могут отсутствовать
    const [groupData, setGroupData] =
        useState<onNextProps | null>(null)
    // Состояние для хранения данных создаваемого канала
    const [channelData, setChannelData] =
        useState<onNextProps | null>(null)
    // Состояние для хранения выбранных контактов (участников группы/канала)
    // Используем массив объектов Contact для хранения полной информации о контактах
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedContacts, setSelectedContacts] =
        useState<Contact[]>([])

    // Обработчики для группы
    // Обработчик перехода к форме создания группы
    // Просто меняем состояние view, не сбрасывая другие состояния для сохранения данных при возврате
    const handleCreateGroup = () => {
        setCurrentView('create-group')
    }

    // Обработчик возврата из формы создания группы к списку чатов
    // Сбрасываем данные группы при возврате, так как пользователь отменил создание
    const handleBackFromCreateGroup = () => {
        setCurrentView('chats')
        setGroupData(null)
    }

    // Обработчик возврата из списка участников группы к форме создания группы
    // Не сбрасываем groupData, чтобы пользователь мог вернуться и изменить настройки
    const handleBackFromGroupMembers = () => {
        setCurrentView('create-group')
    }

    // Обработчики для канала
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
    // Используем type guard (typeof payload === 'object') для определения типа данных
    const handleNextFromCreateGroup = (
        payload: onNextProps | string,
    ) => {
        if (typeof payload === 'object') {
            // Сохраняем все данные группы из формы
            // payload содержит name, description, type, photo
            setGroupData(payload)
        } else {
            // Для обратной совместимости со старым кодом, который передавал только строку
            // Создаем минимальный объект с данными
            setGroupData({
                name: payload,
                description: '',
                type: '',
                photo: null,
            })
        }
        // Переключаемся на экран выбора участников
        setCurrentView('group-members')
    }
    // Обработчик перехода от формы создания канала к выбору участников
    // Аналогичен handleNextFromCreateGroup, но для каналов
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
    // Обработчик возврата из списка участников канала к форме создания канала
    const handleBackFromChannelMembers = () => {
        setCurrentView('create-channel')
    }
    // Обработчик завершения создания группы
    // Принимает массив выбранных контактов
    // Этот обработчик собирает все данные и "отправляет" их (пока в alert)
    const handleFinishGroupCreation = (
        contacts: Contact[],
    ) => {
        // Сохраняем выбранные контакты в состояние (хотя уже переданы как аргумент)
        // Это нужно для сброса состояния позже
        setSelectedContacts(contacts)

        // Собираем все данные для создания группы
        // Используем non-null assertion (!) так как уверены, что groupData не null на этом этапе
        const groupInfo = {
            ...groupData!, // Все данные из формы
            members: contacts, // Выбранные участники
            membersCount: contacts.length, // Количество участников для быстрого доступа
        }

        // Формируем имена участников для отображения в alert
        const memberNames = contacts
            .map(
                (contact) =>
                    `${contact.firstName} ${contact.lastName}`,
            )
            .join(', ')
        // Показываем алерт со всеми данными (временное решение для демонстрации)
        // В реальном приложении здесь был бы API вызов
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
        // console.log используется для отладки в dev-режиме
        console.log(
            'Данные для создания группы:',
            groupInfo,
        )

        // Сбрасываем все состояния к начальным значениям
        // Это важно для корректной работы при повторном создании группы
        setCurrentView('chats')
        setGroupData(null)
        setSelectedContacts([])
    }

    // Обработчик завершения создания канала
    // Аналогичен handleFinishGroupCreation, но для каналов
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

    // Рендерим соответствующий компонент в зависимости от текущего представления
    // Используем switch statement для явного определения всех возможных состояний
    // TypeScript будет проверять, что мы обработали все варианты из типа View
    switch (currentView) {
        case 'chats':
            // Основной экран со списком чатов
            return (
                <ChatsList
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )

        case 'create-group':
            // Форма создания группы
            return (
                <CreateGroupForm
                    onBack={handleBackFromCreateGroup}
                    onNext={handleNextFromCreateGroup}
                />
            )

        case 'group-members':
            // Проверяем, что данные группы существуют перед рендером списка участников
            // Это защита от рендера с неполными данными
            return groupData ? (
                <GroupMembersList
                    groupData={groupData} // Передаем все данные группы
                    onBack={handleBackFromGroupMembers}
                    onFinish={handleFinishGroupCreation}
                />
            ) : (
                // Fallback UI на случай ошибки (данные не найдены)
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
            // Fallback на случай, если currentView имеет неожиданное значение
            // Возвращаем основной экран для безопасности
            return (
                <ChatsList
                    onCreateGroup={handleCreateGroup}
                    onCreateChannel={handleCreateChannel}
                />
            )
    }
}
