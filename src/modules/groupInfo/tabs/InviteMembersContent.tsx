'use client'

import { Button } from '@shared/ui/button/Button'
import ContactsListInvitation from '@modules/contacts/components/ContactsListInvitation'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { setContacts } from '@redux/slices/contactsSlice'
import { Contact, GroupParticipant } from '@shared/types/contact'

interface InviteMembersContentProps {
    groupId?: string
    currentParticipants: GroupParticipant[]
    onInvite?: (selectedContacts: Contact[]) => void
    onCancel?: () => void
    isInviting?: boolean
    error?: string | null
}

export default function InviteMembersContent({
    groupId,
    currentParticipants,
    onInvite,
    onCancel,
    isInviting = false,
    error = null,
}: InviteMembersContentProps) {
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

    const dispatch = useDispatch()

    const selectedUid = useSelector(
        (state: RootState) => state.SelectedContactTemp.uid,
    )
    const allContactsList = useSelector(
        (state: RootState) => state.contactsTemp.list,
    )

    // Фильтруем контакты - убираем тех, кто уже в группе
    const currentParticipantIds = currentParticipants.map(p => p.uid)
    const availableContacts = allContactsList.filter(
        contact => !currentParticipantIds.includes(contact.uid)
    )

    const handleSelectContact = (uid: string) => {
        setSelectedContactIds((prev) =>
            prev.includes(uid)
                ? prev.filter((id) => id !== uid)
                : [...prev, uid],
        )
    }

    const selectedContacts = availableContacts.filter((contact) =>
        selectedContactIds.includes(contact.uid),
    )

    const handleSetSelectedContact = (uid: string) => {
        dispatch(setContacts(uid))
    }

    const handleInviteClick = () => {
        if (onInvite && selectedContacts.length > 0) {
            onInvite(selectedContacts)
        }
    }

    return (
        <>
            {/* Отображение ошибки */}
            {error && (
                <div className={`
                  mx-4 mt-4 mb-4 rounded-md bg-system-red-surface p-3
                `}>
                    <p className="text-sm text-system-red">{error}</p>
                </div>
            )}

            {/* Список контактов */}
            <div className="flex-1 overflow-hidden">
                <ContactsListInvitation
                    selectedContacts={selectedContactIds}
                    handleSelectContact={handleSelectContact}
                    selectedUid={selectedUid}
                    contactsList={availableContacts}
                    handleSetSelectedContact={handleSetSelectedContact}
                />
            </div>

            {/* Кнопка приглашения - фиксированная внизу */}
             
                <div className={`
                  sticky bottom-0 flex shrink-0 items-center justify-center
                  gap-2 border-t border-app-divider bg-gray-main px-4 pt-4 pb-4
                `}>
                   
                    <Button
                        onClick={handleInviteClick}
                        disabled={selectedContacts.length === 0 || isInviting}
                        variant="solid"
                        size="md"
                        className={`
                          h-14 w-full max-w-82 rounded-md
                          disabled:cursor-not-allowed disabled:opacity-50
                        `}
                    >
                        {isInviting ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="h-5 w-5 animate-spin"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Приглашение...
                            </span>
                        ) : (
                            <span className="text-base font-medium">
                                Пригласить в группу
                            </span>
                        )}
                    </Button>
                </div>
            
        </>
    )
}