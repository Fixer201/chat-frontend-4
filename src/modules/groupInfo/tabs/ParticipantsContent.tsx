// ParticipantsContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    findGroupParticipantsByChatKey, // Поиск участников группы в localStorage по ключу чата
    saveGroupParticipants, // Сохранение участников группы в localStorage
} from '@shared/lib/localStorageGroupParticipants'
import {
    GroupParticipant, // Тип участника группы
    Contact, // Тип контакта
} from '@shared/types/contact'
import { contactsToGroupParticipants } from '@shared/lib/participantUtils' // Конвертация контактов в участников группы
import ContactsListGroup from '@modules/contacts/components/ContactsListGroup' // Компонент списка участников группы
import InviteMembersContent from './InviteMembersContent' // Компонент приглашения участников
import {
    setParticipants, // Экшен для установки списка участников в Redux
    removeParticipant, // Экшен для удаления участника из Redux
} from '@redux/slices/groupParticipantsSlice'

// Тип для отображения: список участников или приглашение
type View = 'participants' | 'invite'

// Интерфейс пропсов компонента
interface ParticipantsContentProps {
    chatKey: string // Уникальный ключ чата
    onTitleChange?: (title: string | null) => void // Колбэк для изменения заголовка (родительский компонент)
    onParticipantsChange?: (count: number) => void // Колбэк при изменении количества участников
    isCurrentUserOwner?: boolean // Флаг, является ли текущий пользователь владельцем группы
}

export default function ParticipantsContent({
    chatKey,
    onTitleChange,
    onParticipantsChange,
    isCurrentUserOwner = false,
}: ParticipantsContentProps) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true) // Состояние загрузки
    const [owner, setOwner] =
        useState<GroupParticipant | null>(null) // Владелец группы
    const [participants, setParticipantsLocal] = useState<
        GroupParticipant[]
    >([]) // Остальные участники
    const [currentView, setCurrentView] =
        useState<View>('participants') // Текущий экран
    const [isInviting, setIsInviting] = useState(false) // Флаг процесса приглашения
    const [inviteError, setInviteError] = useState<
        string | null
    >(null) // Ошибка при приглашении

    // Загрузка данных из localStorage и синхронизация с Redux
    useEffect(() => {
        setLoading(true)
        const data = findGroupParticipantsByChatKey(chatKey) // Получаем данные из localStorage
        if (data) {
            // Разделяем владельца и остальных участников
            const ownerData =
                data.find((p) => p.isOwner) || null
            const otherParticipants = data.filter(
                (p) => !p.isOwner,
            )
            setOwner(ownerData)
            setParticipantsLocal(otherParticipants)
            // Синхронизируем с Redux
            dispatch(
                setParticipants({
                    chatKey,
                    participants: data,
                }),
            )
        } else {
            // Если данных нет - устанавливаем пустые значения
            setOwner(null)
            setParticipantsLocal([])
            dispatch(
                setParticipants({
                    chatKey,
                    participants: [],
                }),
            )
        }
        setLoading(false)
    }, [chatKey, dispatch])

    // Обновление счётчика участников при изменении списка
    useEffect(() => {
        const totalCount =
            (owner ? 1 : 0) + participants.length
        onParticipantsChange?.(totalCount)
    }, [owner, participants, onParticipantsChange])

    // Обновление заголовка в зависимости от текущего вида
    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    // Обработчик приглашения участников
    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        setIsInviting(true)
        setInviteError(null)

        try {
            // Имитация задержки сети
            await new Promise((resolve) =>
                setTimeout(resolve, 500),
            )

            // Преобразуем выбранные контакты в участников группы
            const newParticipants =
                contactsToGroupParticipants(
                    selectedContacts,
                )
            const allParticipants = [
                ...participants,
                ...newParticipants,
            ]
            const fullList = owner
                ? [owner, ...allParticipants]
                : allParticipants

            // Сохраняем в localStorage
            saveGroupParticipants(chatKey, fullList)

            // Обновляем локальное состояние
            setOwner(
                fullList.find((p) => p.isOwner) || null,
            )
            setParticipantsLocal(
                fullList.filter((p) => !p.isOwner),
            )

            // Обновляем Redux
            dispatch(
                setParticipants({
                    chatKey,
                    participants: fullList,
                }),
            )

            // Возвращаемся к списку участников
            setCurrentView('participants')
        } catch (error) {
            setInviteError(
                error instanceof Error
                    ? error.message
                    : 'Ошибка при приглашении',
            )
        } finally {
            setIsInviting(false)
        }
    }

    // Обработчик удаления участника
    const handleParticipantRemoved = (
        removedUid: string,
    ) => {
        // Фильтруем удалённого участника
        const newParticipants = participants.filter(
            (p) => p.uid !== removedUid,
        )
        const fullList = owner
            ? [owner, ...newParticipants]
            : newParticipants

        // Сохраняем в localStorage
        saveGroupParticipants(chatKey, fullList)

        // Обновляем локальное состояние
        setOwner(fullList.find((p) => p.isOwner) || null)
        setParticipantsLocal(
            fullList.filter((p) => !p.isOwner),
        )

        // Обновляем Redux (удаляем конкретного участника)
        dispatch(
            removeParticipant({ chatKey, uid: removedUid }),
        )
    }

    // Отмена приглашения - возврат к списку участников
    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

    // Показать экран приглашения
    const handleShowInvite = () => {
        setCurrentView('invite')
        setInviteError(null)
    }

    // Состояние загрузки
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка участников...
                </div>
            </div>
        )
    }

    // Полный список участников (владелец + остальные)
    const allParticipants = owner
        ? [owner, ...participants]
        : participants

    return (
        <div className="flex h-full flex-col">
            {currentView === 'participants' ? (
                // Список участников
                <ContactsListGroup
                    owner={owner}
                    participants={participants}
                    onInviteClick={handleShowInvite} // Кнопка "Пригласить"
                    chatKey={chatKey}
                    onParticipantRemoved={
                        handleParticipantRemoved
                    } // Удаление участника
                    canRemoveParticipants={
                        isCurrentUserOwner
                    } // Право на удаление
                />
            ) : (
                // Экран приглашения
                <InviteMembersContent
                    currentParticipants={allParticipants}
                    onInvite={handleInvite}
                    onCancel={handleCancelInvite}
                    isInviting={isInviting}
                    error={inviteError}
                />
            )}
        </div>
    )
}
