'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
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
import {
    setParticipants,
    removeParticipant,
} from '@redux/slices/groupParticipantsSlice'

type View = 'participants' | 'invite'

interface ParticipantsContentProps {
    chatKey: string
    onTitleChange?: (title: string | null) => void
    onParticipantsChange?: (count: number) => void
    isCurrentUserOwner?: boolean // новый пропс
}

export default function ParticipantsContent({
    chatKey,
    onTitleChange,
    onParticipantsChange,
    isCurrentUserOwner = false,
}: ParticipantsContentProps) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [owner, setOwner] =
        useState<GroupParticipant | null>(null)
    const [participants, setParticipantsLocal] = useState<
        GroupParticipant[]
    >([])
    const [currentView, setCurrentView] =
        useState<View>('participants')
    const [isInviting, setIsInviting] = useState(false)
    const [inviteError, setInviteError] = useState<
        string | null
    >(null)

    // Загрузка данных из localStorage и синхронизация с Redux
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
            setParticipantsLocal(otherParticipants)
            dispatch(
                setParticipants({
                    chatKey,
                    participants: data,
                }),
            )
        } else {
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

    // Обновление счётчика участников
    useEffect(() => {
        const totalCount =
            (owner ? 1 : 0) + participants.length
        onParticipantsChange?.(totalCount)
    }, [owner, participants, onParticipantsChange])

    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        setIsInviting(true)
        setInviteError(null)

        try {
            await new Promise((resolve) =>
                setTimeout(resolve, 500),
            )

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

            saveGroupParticipants(chatKey, fullList)

            setOwner(
                fullList.find((p) => p.isOwner) || null,
            )
            setParticipantsLocal(
                fullList.filter((p) => !p.isOwner),
            )

            dispatch(
                setParticipants({
                    chatKey,
                    participants: fullList,
                }),
            )

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

    const handleParticipantRemoved = (
        removedUid: string,
    ) => {
        const newParticipants = participants.filter(
            (p) => p.uid !== removedUid,
        )
        const fullList = owner
            ? [owner, ...newParticipants]
            : newParticipants

        saveGroupParticipants(chatKey, fullList)

        setOwner(fullList.find((p) => p.isOwner) || null)
        setParticipantsLocal(
            fullList.filter((p) => !p.isOwner),
        )

        dispatch(
            removeParticipant({ chatKey, uid: removedUid }),
        )
    }

    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

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
                    chatKey={chatKey}
                    onParticipantRemoved={
                        handleParticipantRemoved
                    }
                    canRemoveParticipants={
                        isCurrentUserOwner
                    } // передаём право на удаление
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
