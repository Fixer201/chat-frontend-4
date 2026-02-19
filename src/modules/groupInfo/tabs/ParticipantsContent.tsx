// src/modules/groupInfo/tabs/ParticipantsContent.tsx
'use client'

import { useEffect, useState } from 'react'
import {
    findGroupParticipantsByChatKey,
    saveGroupParticipants,
} from '@shared/lib/localStorageGroupParticipants'
import { GroupParticipant, Contact } from '@shared/types/contact'
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
    const [owner, setOwner] = useState<GroupParticipant | null>(null)
    const [participants, setParticipants] = useState<GroupParticipant[]>([])
    const [currentView, setCurrentView] = useState<View>('participants')
    const [isInviting, setIsInviting] = useState(false)
    const [inviteError, setInviteError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        const data = findGroupParticipantsByChatKey(chatKey)
        if (data) {
            const ownerData = data.find(p => p.isOwner) || null
            const otherParticipants = data.filter(p => !p.isOwner)
            setOwner(ownerData)
            setParticipants(otherParticipants)
        } else {
            setOwner(null)
            setParticipants([])
        }
        setLoading(false)
    }, [chatKey])

    useEffect(() => {
        if (onTitleChange) {
            const title = currentView === 'invite' ? 'Пригласить участников' : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    const handleInvite = async (selectedContacts: Contact[]) => {
        setIsInviting(true)
        setInviteError(null)

        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            const newParticipants = contactsToGroupParticipants(selectedContacts)

            const allParticipants = [...participants]
            for (const newP of newParticipants) {
                if (!allParticipants.some(p => p.uid === newP.uid)) {
                    allParticipants.push(newP)
                }
            }

            const fullList = owner ? [owner, ...allParticipants] : allParticipants
            saveGroupParticipants(chatKey, fullList)

            setParticipants(allParticipants)
            setCurrentView('participants')
        } catch (error) {
            setInviteError(error instanceof Error ? error.message : 'Ошибка при приглашении')
        } finally {
            setIsInviting(false)
        }
    }

    const handleParticipantRemoved = (removedUid: string) => {
        const newParticipants = participants.filter(p => p.uid !== removedUid)
        setParticipants(newParticipants)
        const fullList = owner ? [owner, ...newParticipants] : newParticipants
        saveGroupParticipants(chatKey, fullList)
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
                <div className="text-text-gray">Загрузка участников...</div>
            </div>
        )
    }

    const allParticipants = owner ? [owner, ...participants] : participants

    return (
        <div className="flex h-full flex-col">
            {currentView === 'participants' ? (
                <ContactsListGroup
                    owner={owner}
                    participants={participants}
                    onInviteClick={handleShowInvite}
                    chatKey={chatKey}
                    onParticipantRemoved={handleParticipantRemoved}
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