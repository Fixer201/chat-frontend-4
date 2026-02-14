'use client'

import ContactsListGroup from '@modules/contacts/components/ContactsListGroup'
import InviteMembersContent from './InviteMembersContent'
import { useState, useEffect } from 'react'
import {
    ApiGroupParticipant,
    Contact,
    GroupParticipant,
} from '@shared/types/contact'
import {
    transformParticipants,
    separateOwnerAndParticipants,
    contactsToGroupParticipants, // НОВЫЙ ИМПОРТ
} from '@shared/lib/participantUtils'

type View = 'participants' | 'invite'

interface ParticipantsContentProps {
    onTitleChange?: (title: string) => void
}

export default function ParticipantsContent({
    onTitleChange,
}: ParticipantsContentProps) {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [owner, setOwner] =
        useState<GroupParticipant | null>(null)
    const [participants, setParticipants] = useState<
        GroupParticipant[]
    >([])
    const [currentView, setCurrentView] =
        useState<View>('participants')
    const [isInviting, setIsInviting] = useState(false)
    const [inviteError, setInviteError] = useState<
        string | null
    >(null)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)

        // Загружаем участников
        loadParticipants()

        return () => clearTimeout(t)
    }, [])

    // Обновляем заголовок при изменении view
    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    // Моковые данные в формате API (начальные участники)
    const mockApiParticipants: ApiGroupParticipant[] = [
        {
            uid: '1',
            first_name: 'Иван',
            last_name: 'Иванов',
            avatar_url: 'AvatarWeb1.png',
            avatar_webp_url: 'AvatarWeb1.webp',
            is_owner: true,
            is_blocked: false,
            is_online: true,
            was_online_at: Date.now(),
            is_in_contacts: true,
        },
        {
            uid: '2',
            first_name: 'Петр',
            last_name: 'Петров',
            avatar_url: 'AvatarWeb2.png',
            avatar_webp_url: 'AvatarWeb2.webp',
            is_owner: false,
            is_blocked: false,
            is_online: false,
            was_online_at: Date.now() - 3600000,
            is_in_contacts: true,
        },
        {
            uid: '3',
            first_name: 'Сидор',
            last_name: 'Сидоров',
            avatar_url: 'AvatarWeb3.png',
            avatar_webp_url: 'AvatarWeb3.webp',
            is_owner: false,
            is_blocked: false,
            is_online: true,
            was_online_at: Date.now(),
            is_in_contacts: false,
        },
    ]

    // Функция загрузки участников
    const loadParticipants = async () => {
        setLoading(true)

        try {
            const transformedParticipants =
                transformParticipants(mockApiParticipants)
            const {
                owner: ownerData,
                participants: participantsData,
            } = separateOwnerAndParticipants(
                transformedParticipants,
            )

            setOwner(ownerData)
            setParticipants(participantsData)
        } catch (error) {
            console.error(
                'Ошибка загрузки участников:',
                error,
            )
        } finally {
            setLoading(false)
        }
    }

    // ОБНОВЛЕННЫЙ Обработчик приглашения участников
    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        setIsInviting(true)
        setInviteError(null)

        try {
            // Симуляция API запроса
            await new Promise((resolve) =>
                setTimeout(resolve, 1000),
            )

            // Преобразуем выбранные контакты в GroupParticipant
            const newParticipants =
                contactsToGroupParticipants(
                    selectedContacts,
                )

            console.log(
                'Приглашены участники:',
                selectedContacts,
            )
            console.log(
                'Преобразованные участники:',
                newParticipants,
            )

            // ДОБАВЛЯЕМ новых участников к существующим (убираем дубликаты по uid)
            setParticipants((prev) => {
                const existingUids = new Set(
                    prev.map((p) => p.uid),
                )
                const uniqueNewParticipants =
                    newParticipants.filter(
                        (p) => !existingUids.has(p.uid),
                    )
                return [...prev, ...uniqueNewParticipants]
            })

            // Возвращаемся к списку участников
            setCurrentView('participants')
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Ошибка при приглашении участников'
            setInviteError(errorMessage)
        } finally {
            setIsInviting(false)
        }
    }

    // Обработчик отмены приглашения
    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

    // Переключение на режим приглашения
    const handleShowInvite = () => {
        setCurrentView('invite')
        setInviteError(null)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка участников...
                </div>
            </div>
        )
    }

    // Все текущие участники (владелец + участники)
    const allParticipants = owner
        ? [owner, ...participants]
        : participants

    return (
        <div
            className={`
              flex h-full flex-col transition-opacity duration-200
              ${visible ? 'opacity-100' : 'opacity-0'}
            `}
        >
            {currentView === 'participants' ? (
                <ContactsListGroup
                    owner={owner}
                    participants={participants}
                    onInviteClick={handleShowInvite}
                />
            ) : (
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
