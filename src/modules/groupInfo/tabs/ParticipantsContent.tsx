// src/modules/groupInfo/tabs/ParticipantsContent.tsx
'use client'

import { useEffect, useState } from 'react'
import {
    findGroupParticipantsByChatKey,
    saveGroupParticipants,
} from '@shared/lib/localStorageGroupParticipants'
import {
    GroupParticipant,
    Contact,
} from '@shared/types/contact'
import { contactsToGroupParticipants } from '@shared/lib/participantUtils'
import ContactsListGroup from '@modules/contacts/components/ContactsListGroup'
import InviteMembersContent from './InviteMembersContent'

type View = 'participants' | 'invite'

interface ParticipantsContentProps {
    chatKey: string
    onTitleChange?: (title: string | null) => void
}

export default function ParticipantsContent({
    chatKey,
    onTitleChange,
}: ParticipantsContentProps) {
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

    // Загрузка участников из localStorage
    useEffect(() => {
        setLoading(true)
        const data = findGroupParticipantsByChatKey(chatKey)
        if (data) {
            const ownerData =
                data.find((p) => p.isOwner) || null
            const otherParticipants = data.filter(
                (p) => !p.isOwner,
            )
            setOwner(ownerData)
            setParticipants(otherParticipants)
        } else {
            setOwner(null)
            setParticipants([])
        }
        setLoading(false)
    }, [chatKey])

    // Обновление заголовка при смене вида
    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    // Приглашение новых участников
    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        setIsInviting(true)
        setInviteError(null)

        try {
            // Симуляция API (можно убрать)
            await new Promise((resolve) =>
                setTimeout(resolve, 500),
            )

            // Преобразуем контакты в участников
            const newParticipants =
                contactsToGroupParticipants(
                    selectedContacts,
                )

            // Объединяем с существующими, убирая дубликаты по uid
            const allParticipants = [...participants]
            for (const newP of newParticipants) {
                if (
                    !allParticipants.some(
                        (p) => p.uid === newP.uid,
                    )
                ) {
                    allParticipants.push(newP)
                }
            }

            // Сохраняем в localStorage
            const fullList = owner
                ? [owner, ...allParticipants]
                : allParticipants
            saveGroupParticipants(chatKey, fullList)

            // Обновляем состояние
            setParticipants(allParticipants)
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

    // Отмена приглашения
    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

    // Переход к приглашению
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

    // Все участники (для передачи в InviteMembersContent как текущие)
    const allParticipants = owner
        ? [owner, ...participants]
        : participants

    return (
        <div className="flex h-full flex-col">
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
